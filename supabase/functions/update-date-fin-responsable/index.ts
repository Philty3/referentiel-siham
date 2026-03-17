import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the Excel file from the request body (raw binary)
    const arrayBuffer = await req.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: "No file data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`File size: ${arrayBuffer.byteLength} bytes`);

    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Parse the Excel - headers are on row 3
    // A: Code UO, B: Date d'effet, C: Date de fin, D: Nom, E: Prénom
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: "dd/mm/yyyy" }) as any[][];
    
    console.log(`Total rows in Excel: ${allRows.length}`);
    if (allRows.length > 2) {
      console.log(`Header row: ${JSON.stringify(allRows[2])}`);
    }
    if (allRows.length > 3) {
      console.log(`First data row: ${JSON.stringify(allRows[3])}`);
    }

    // Build a map from Excel data: key = code_uo + date_debut + nom_upper
    const excelMap = new Map<string, string>();
    
    for (let i = 3; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || !row[0]) continue;
      
      const codeUo = String(row[0]).trim();
      const dateDebut = row[1] ? String(row[1]).trim() : "";
      const dateFin = row[2] ? String(row[2]).trim() : "";
      const nom = row[3] ? String(row[3]).trim().toUpperCase() : "";
      
      if (!dateFin || !codeUo || !dateDebut) continue;
      
      const key = `${codeUo}|${dateDebut}|${nom}`;
      excelMap.set(key, dateFin);
    }

    console.log(`Excel entries with date_fin: ${excelMap.size}`);
    // Log some sample keys
    let sampleCount = 0;
    for (const [key, val] of excelMap) {
      if (sampleCount < 5) {
        console.log(`  Sample key: "${key}" => "${val}"`);
        sampleCount++;
      }
    }

    // Fetch all UO rows with responsable_administratif set
    let allUo: any[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("uo")
        .select("id, code_uo, responsable_administratif, date_debut_responsable, date_fin_responsable")
        .not("responsable_administratif", "is", null)
        .neq("responsable_administratif", "")
        .range(from, from + pageSize - 1);
      
      if (error) throw error;
      if (!data || data.length === 0) break;
      allUo = allUo.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    console.log(`UO rows with responsable: ${allUo.length}`);

    let updated = 0;
    let matched = 0;
    const updates: { id: string; code_uo: string; responsable: string; date_fin: string }[] = [];
    const noMatch: string[] = [];

    for (const uo of allUo) {
      if (!uo.code_uo || !uo.date_debut_responsable || !uo.responsable_administratif) continue;
      
      const respName = uo.responsable_administratif.trim().toUpperCase();
      const respParts = respName.split(/\s+/);
      
      let foundDateFin: string | null = null;
      
      // Try matching each single word as last name
      for (const part of respParts) {
        if (part === "-" || part.length < 2) continue;
        const key = `${uo.code_uo}|${uo.date_debut_responsable}|${part}`;
        const dateFin = excelMap.get(key);
        if (dateFin) {
          foundDateFin = dateFin;
          break;
        }
      }

      // Try multi-word last names
      if (!foundDateFin && respParts.length >= 2) {
        for (let j = 0; j < respParts.length - 1; j++) {
          const twoWordName = `${respParts[j]} ${respParts[j + 1]}`;
          const key = `${uo.code_uo}|${uo.date_debut_responsable}|${twoWordName}`;
          const dateFin = excelMap.get(key);
          if (dateFin) {
            foundDateFin = dateFin;
            break;
          }
        }
      }

      // Try full name as key
      if (!foundDateFin) {
        const key = `${uo.code_uo}|${uo.date_debut_responsable}|${respName}`;
        const dateFin = excelMap.get(key);
        if (dateFin) {
          foundDateFin = dateFin;
        }
      }

      if (foundDateFin) {
        matched++;
        if (!uo.date_fin_responsable) {
          updates.push({
            id: uo.id,
            code_uo: uo.code_uo,
            responsable: uo.responsable_administratif,
            date_fin: foundDateFin,
          });
        }
      } else {
        if (noMatch.length < 10) {
          noMatch.push(`${uo.code_uo}|${uo.date_debut_responsable}|${respName}`);
        }
      }
    }

    console.log(`Matched: ${matched}, To update: ${updates.length}`);
    console.log(`Sample no-match: ${JSON.stringify(noMatch)}`);

    // Perform updates
    for (const upd of updates) {
      const { error } = await supabase
        .from("uo")
        .update({ date_fin_responsable: upd.date_fin })
        .eq("id", upd.id);
      
      if (error) {
        console.error(`Error updating ${upd.code_uo}: ${error.message}`);
      } else {
        updated++;
      }
    }

    const result = {
      total_excel_entries: excelMap.size,
      total_uo_with_responsable: allUo.length,
      matched,
      updated,
      sample_updates: updates.slice(0, 20),
      sample_no_match: noMatch,
    };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
