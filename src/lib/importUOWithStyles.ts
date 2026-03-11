import ExcelJS from "exceljs";
import { supabase } from "@/integrations/supabase/client";

const UO_COLUMNS = [
  "code_uo", "libelle_long", "libelle_court", "code_uo_mere", "type", "niveau",
  "code_uai", "statut", "responsable_composante", "responsable_administratif",
  "numero_voie", "complement_adresse", "adresse", "code_postal", "ville",
  "code_uo_p5_p7", "code_uo_bis", "code_uo_site_associe", "groupe_eval", "groupe_phare",
];

function isRedFontRow(row: ExcelJS.Row): boolean {
  // Only flag rows where the FONT color is red (optionally strikethrough)
  let hasRedFont = false;
  row.eachCell({ includeEmpty: false }, (cell) => {
    const font = cell.font;
    if (font?.color?.argb) {
      const argb = font.color.argb.toUpperCase();
      if (argb.includes("FF0000") || argb.includes("CC0000") || argb.includes("FF3333") || argb.includes("FFFF0000")) {
        hasRedFont = true;
      }
    }
  });
  return hasRedFont;
}

export async function importUOWithStyles(
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    onProgress?.("Lecture du fichier UO avec détection des styles...");

    const response = await fetch("/data/uo.xlsx");
    const buffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return { success: false, count: 0, error: "Aucune feuille trouvée" };
    }

    const rows: Record<string, any>[] = [];
    let rowIndex = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const values = row.values as any[];
      // ExcelJS row.values is 1-indexed (index 0 is empty)
      const cellValues = values.slice(1);

      if (cellValues.length < 1) return;

      const obj: Record<string, any> = {};
      UO_COLUMNS.forEach((col, idx) => {
        const val = cellValues[idx];
        obj[col] = val != null ? String(val) : null;
      });

      obj.is_highlighted = isRedRow(row);
      rows.push(obj);
      rowIndex++;
    });

    if (rows.length === 0) return { success: true, count: 0 };

    onProgress?.("Suppression des anciennes données UO...");
    await supabase.from("uo").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    onProgress?.(`Insertion de ${rows.length} lignes...`);
    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from("uo" as any).insert(batch as any);
      if (error) {
        return { success: false, count: i, error: error.message };
      }
      onProgress?.(`${Math.min(i + batchSize, rows.length)}/${rows.length} lignes insérées...`);
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}
