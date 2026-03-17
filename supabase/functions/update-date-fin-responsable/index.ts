import { createClient } from "npm:@supabase/supabase-js@2";
import parsedMarkdown from "./data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

const formatDate = (value: string): string => {
  const normalized = normalizeText(value).replace(/ /g, "");
  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";

  const [, day, month, year] = match;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const parseFrenchDate = (value: string): number | null => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date.getTime();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lines = parsedMarkdown.split(/\r?\n/);

    const excelDateMap = new Map<string, string>();
    let parsedLines = 0;
    let duplicatePairsResolved = 0;

    for (const line of lines) {
      const match = line.match(/^\|([^|]+)\|([^|]*)\|([^|]*)\|$/);
      if (!match) continue;

      const codeUo = normalizeText(match[1]);
      const matricule = normalizeText(match[2]);
      const dateFin = formatDate(match[3]);

      if (!codeUo || !matricule || !dateFin) continue;
      if (codeUo === "CODE UO" || codeUo.startsWith("-")) continue;

      parsedLines++;
      const key = `${codeUo}|${matricule}`;
      const existingDate = excelDateMap.get(key);

      if (!existingDate) {
        excelDateMap.set(key, dateFin);
        continue;
      }

      const existingTimestamp = parseFrenchDate(existingDate);
      const newTimestamp = parseFrenchDate(dateFin);

      if (newTimestamp !== null && (existingTimestamp === null || newTimestamp > existingTimestamp)) {
        excelDateMap.set(key, dateFin);
        duplicatePairsResolved++;
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const allUo: Array<{
      id: string;
      code_uo: string | null;
      matricule_responsable: string | null;
      date_fin_responsable: string | null;
    }> = [];

    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("uo")
        .select("id, code_uo, matricule_responsable, date_fin_responsable")
        .not("code_uo", "is", null)
        .not("matricule_responsable", "is", null)
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allUo.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    const pendingUpdates: Array<{ id: string; code_uo: string; matricule_responsable: string; date_fin_responsable: string }> = [];
    let matchedRows = 0;
    let unchangedRows = 0;

    for (const uo of allUo) {
      const key = `${normalizeText(uo.code_uo)}|${normalizeText(uo.matricule_responsable)}`;
      const dateFin = excelDateMap.get(key);

      if (!dateFin) continue;
      matchedRows++;

      if ((uo.date_fin_responsable ?? "") === dateFin) {
        unchangedRows++;
        continue;
      }

      pendingUpdates.push({
        id: uo.id,
        code_uo: uo.code_uo ?? "",
        matricule_responsable: uo.matricule_responsable ?? "",
        date_fin_responsable: dateFin,
      });
    }

    let updatedRows = 0;
    const failedUpdates: Array<{ id: string; code_uo: string; matricule_responsable: string; error: string }> = [];

    for (const update of pendingUpdates) {
      const { error } = await supabase
        .from("uo")
        .update({ date_fin_responsable: update.date_fin_responsable })
        .eq("id", update.id);

      if (error) {
        failedUpdates.push({
          id: update.id,
          code_uo: update.code_uo,
          matricule_responsable: update.matricule_responsable,
          error: error.message,
        });
        continue;
      }

      updatedRows++;
    }

    return new Response(
      JSON.stringify(
        {
          parsed_lines_with_date: parsedLines,
          unique_excel_pairs_with_date: excelDateMap.size,
          duplicate_pairs_resolved_using_latest_date: duplicatePairsResolved,
          total_uo_rows_checked: allUo.length,
          matched_rows_in_uo: matchedRows,
          unchanged_rows: unchangedRows,
          updated_rows: updatedRows,
          failed_updates: failedUpdates.length,
          sample_updates: pendingUpdates.slice(0, 20),
          sample_failures: failedUpdates.slice(0, 20),
        },
        null,
        2,
      ),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        null,
        2,
      ),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});