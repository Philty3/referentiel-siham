import ExcelJS from "exceljs";
import { supabase } from "@/integrations/supabase/client";

const UO_COLUMNS = [
  "code_uo", "libelle_long", "libelle_court", "code_uo_mere", "type", "niveau",
  "code_uai", "statut", "responsable_composante", "responsable_administratif",
  "numero_voie", "complement_adresse", "adresse", "code_postal", "ville",
  "code_uo_p5_p7", "code_uo_bis", "code_uo_site_associe", "groupe_eval", "groupe_phare",
];

const HIGHLIGHTED_CODES = new Set([
  "AGC0200000","AGC0201000","AGC0202000","AGC0403000","AGD0201030",
  "H710000000","H710100000","HML0000000","AGD0400000","AGD0700000",
  "AGJ0002000","AGJ0003010","AGR0502000","AGR0200000","AGR0201000",
  "AGR0202000","AGR040100B","AGR0402000","AGR0402010","AGR040100A",
  "AGR0501000","AGR0804000","AGR0601000","AGR060100A","AGR060100B",
  "AGR060100C","AGR0604000","AGR0603000","AGR0701000","AGR0702000",
  "AGR0801000","AGR080100A","AGR080100B","AGR080100C","AGR0802000",
  "AGR0803000","AGR080300A","AGR080300C","AGR080300B","AGF0200000",
  "AGF0201000","AGF0202000","AGF0203000","AGF0301000","AGF0302000",
  "AGF0500000","AGF0503000","AGF0600000","AGF0700000","AGF0701000",
  "AGF0702000","AGF0703000","APE0300000","APE0000010","APE0000020",
  "APE0000030","APE0001000","APE0001020","APE000102C","APE000102D",
  "APE0100000","APE010000A","APE010000C","APE010000D","APE0400000",
  "APE0402000","APE0403000","APE0405000","APE0501000","APE050100B",
  "APE050100C","APE0502000","APE050200A","APE050200F","APE050200D",
  "APE0600000","APE0602000","APE0605000","APE0606000","APE0606010",
  "APE0607000","APE0609000","APE0610000","APE0700000","APE070000A",
  "APE070000B","APE070000C","APE070000D","APE0800000","APE0801000",
  "APE0803000","APE080300A","APE080300B","APE080300C","APE0804000",
  "APR0401000","AGI0001000","AGI0002000","AGI0003000","AGI000300A",
  "M110600000","M111000000","H030600000","SDG0501000",
  "S510100000","S510200000","S510300000","S510400000","S510500000",
]);

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

      obj.is_highlighted = isRedFontRow(row);
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
