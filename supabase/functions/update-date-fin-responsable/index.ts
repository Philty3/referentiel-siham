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

    // Read the uploaded Excel file from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Parse the Excel - headers are on row 3
    // A: Code UO, B: Date d'effet, C: Date de fin, D: Nom, E: Prénom
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: "dd/mm/yyyy" }) as any[][];
    
    console.log(`Total rows in Excel: ${allRows.length}`);
    console.log(`Header row: ${JSON.stringify(allRows[2])}`);

    // Build a map from Excel data: key = code_uo + date_debut + nom_upper
    // For each key, store date_fin
    const excelMap = new Map<string, string>();
    
    for (let i = 3; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || !row[0]) continue;
      
      const codeUo = String(row[0]).trim();
      const dateDebut = row[1] ? String(row[1]).trim() : "";
      const dateFin = row[2] ? String(row[2]).trim() : "";
      const nom = row[3] ? String(row[3]).trim().toUpperCase() : "";
      const prenom = row[4] ? String(row[4]).trim().toUpperCase() : "";
      
      if (!dateFin || !codeUo || !dateDebut) continue;
      
      // Key: code_uo | date_debut | NOM
      // We match on code_uo + date_debut + last name present in responsable_administratif
      const key = `${codeUo}|${dateDebut}|${nom}`;
      excelMap.set(key, dateFin);
    }

    console.log(`Excel entries with date_fin: ${excelMap.size}`);

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

    for (const uo of allUo) {
      if (!uo.code_uo || !uo.date_debut_responsable || !uo.responsable_administratif) continue;
      
      // Extract last name from responsable_administratif (could be "PRENOM NOM" or "NOM PRENOM" or "Prénom NOM")
      const respParts = uo.responsable_administratif.trim().toUpperCase().split(/\s+/);
      
      // Try matching with each part as potential last name
      let foundDateFin: string | null = null;
      
      for (const part of respParts) {
        const key = `${uo.code_uo}|${uo.date_debut_responsable}|${part}`;
        const dateFin = excelMap.get(key);
        if (dateFin) {
          foundDateFin = dateFin;
          break;
        }
      }

      // Also try with full last name (multi-word like "DOS SANTOS", "BAIET DUVAL")
      if (!foundDateFin && respParts.length >= 2) {
        // Try last two words as surname
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

      if (foundDateFin) {
        matched++;
        // Only update if date_fin_responsable is currently empty
        if (!uo.date_fin_responsable) {
          updates.push({
            id: uo.id,
            code_uo: uo.code_uo,
            responsable: uo.responsable_administratif,
            date_fin: foundDateFin,
          });
        }
      }
    }

    // Perform updates in batches
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
    };

    console.log(`Result: matched=${matched}, updated=${updated}`);

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
