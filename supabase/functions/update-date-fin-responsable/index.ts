import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  const text = String(value).trim();
  if (!text) return "";

  const frenchMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (frenchMatch) {
    const [, d, m, y] = frenchMatch;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return text;
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
    const { fileUrl } = await req.json();

    if (!fileUrl || typeof fileUrl !== "string") {
      return new Response(JSON.stringify({ error: "fileUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Unable to fetch file: ${fileResponse.status}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
      type: "array",
      cellDates: true,
      raw: false,
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    const firstRow = rows[0] ?? {};
    const headers = Object.keys(firstRow);
    const normalizedHeaders = new Map(headers.map((header) => [normalizeText(header), header]));

    const codeColumn = normalizedHeaders.get("CODE UO");
    const matriculeColumn = normalizedHeaders.get("MATRICULE RESPONSABLE");
    const dateFinColumn = normalizedHeaders.get("DATE FIN RESPONSABLE");

    if (!codeColumn || !matriculeColumn || !dateFinColumn) {
      return new Response(
        JSON.stringify({
          error: "Missing required columns",
          detected_headers: headers,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const excelDateMap = new Map<string, string>();
    let excelRowsWithDate = 0;
    let duplicatePairsResolved = 0;

    for (const row of rows) {
      const codeUo = normalizeText(row[codeColumn]);
      const matricule = normalizeText(row[matriculeColumn]);
      const dateFin = formatDate(row[dateFinColumn]);

      if (!codeUo || !matricule || !dateFin) continue;

      excelRowsWithDate++;
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
          total_excel_rows: rows.length,
          excel_rows_with_date: excelRowsWithDate,
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
        2
      ),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        null,
        2
      ),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});