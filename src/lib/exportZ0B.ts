import * as XLSX from "xlsx";
import { formatExcelDate } from "./dateValidator";

interface UOExportItem {
  code_uo: string;
  matricule_responsable: string;
  responsable_administratif: string;
  date_debut_responsable: string;
  date_fin_responsable: string;
}

/**
 * Export responsables administratifs au format Z0B
 * Colonnes: Type | Code UO | Matricule du responsable d'UO | Nom et prénom du responsable d'UO | Date début | Date fin
 */
export const exportZ0B = (items: UOExportItem[], fileName?: string) => {
  try {
    const workbook = XLSX.utils.book_new();

    const rows = items.map((item) => ({
      "Type": "P",
      "Code UO": item.code_uo || "",
      "Matricule du responsable d'UO": item.matricule_responsable || "",
      "Nom et prénom du responsable d'UO": "",
      "Date début": item.date_debut_responsable ? formatDateDDMMYYYY(item.date_debut_responsable) : "",
      "Date fin": "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Z0B");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || `Z0B_Export_Responsables_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'export Z0B:", error);
    return false;
  }
};

/**
 * Format a date string to DD/MM/YYYY
 */
function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  // Already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  // ISO format YYYY-MM-DD
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  // Try to parse as date
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}
