import * as XLSX from "xlsx";
import { fetchAllRows } from "./supabaseUtils";
import { formatExcelDate } from "./dateValidator";

// Date field mapping per table
const dateFieldsMap: Record<string, string[]> = {
  contractuels: ["date_deb", "date_fin"],
  vacataires: ["date_deb", "date_fin"],
  heberges: [],
  actes: [],
  positions: ["date_debut_validite", "date_fin_validite"],
  corps: ["date_debut_validite", "date_fin_validite"],
  grades: ["date_debut_validite", "date_fin_validite"],
  conges: ["date_debut_validite", "date_fin_validite"],
  emplois: ["date_effet"],
  modalites: ["date_deb_validite", "date_fin_validite"],
  diplomes: ["date_deb_validite", "date_fin_validite"],
  etablissements: [],
  uo: [],
};

/**
 * Format date fields in a row to DD/MM/YYYY
 */
const formatDateFields = (row: Record<string, any>, dateFields: string[]): Record<string, any> => {
  const formatted = { ...row };
  // Remove internal fields
  delete formatted.id;
  delete formatted.created_at;
  
  // Format known date fields
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatExcelDate(formatted[field]);
    }
  });
  
  // Also try to detect and format any ISO date strings in all fields
  Object.keys(formatted).forEach(key => {
    const val = formatted[key];
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      formatted[key] = formatExcelDate(val);
    }
  });
  
  return formatted;
};

/**
 * Export a single page's data to Excel
 */
export const exportPageToExcel = (data: any[], sheetName: string, fileName: string, dateFields: string[] = []) => {
  try {
    const workbook = XLSX.utils.book_new();
    const formattedData = data.map(row => formatDateFields(row, dateFields));
    const sheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.substring(0, 31));
    
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return false;
  }
};

/**
 * Export all tables to a single Excel file (one sheet per table)
 */
export const exportAllDataToExcel = async () => {
  try {
    const workbook = XLSX.utils.book_new();

    const tables = [
      { table: "contractuels", sheet: "Statuts contractuels", order: "code_siham" },
      { table: "vacataires", sheet: "Vacataires", order: "code_siham" },
      { table: "heberges", sheet: "Hébergés", order: "code_siham" },
      { table: "actes", sheet: "Actes", order: "code" },
      { table: "positions", sheet: "Positions", order: "code" },
      { table: "corps", sheet: "Corps", order: "code" },
      { table: "grades", sheet: "Grades", order: "code" },
      { table: "conges", sheet: "Congés-absences", order: "code" },
      { table: "emplois", sheet: "Emplois", order: "emploi" },
      { table: "modalites", sheet: "Modalités", order: "code" },
      { table: "diplomes", sheet: "Diplômes", order: "code" },
      { table: "etablissements", sheet: "Établissements", order: "code_uai" },
      { table: "uo", sheet: "UO", order: "code_uo" },
    ];

    for (const t of tables) {
      try {
        const { data: rows } = await fetchAllRows(t.table, t.order);
        if (rows && rows.length > 0) {
          const dateFields = dateFieldsMap[t.table] || [];
          const formattedData = rows.map(row => formatDateFields(row, dateFields));
          const sheet = XLSX.utils.json_to_sheet(formattedData);
          XLSX.utils.book_append_sheet(workbook, sheet, t.sheet.substring(0, 31));
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de ${t.table}:`, error);
      }
    }

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Export_Referentiel_SIHAM_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return false;
  }
};
