import * as XLSX from "xlsx";
import { formatExcelDate } from "./dateValidator";

export const exportAllDataToExcel = async () => {
  try {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();

    // Définir les pages et leurs données avec les champs de dates
    const pages = [
      {
        name: "Statuts contractuels",
        file: "/data/contractuels.xlsx",
        sheetName: "Statuts contractuels",
        dateFields: ["dateDeb", "dateFin"]
      },
      {
        name: "Vacataires",
        file: "/data/vacataires.xlsx",
        sheetName: "Vacataires",
        dateFields: ["dateDeb", "dateFin"]
      },
      {
        name: "Positions",
        file: "/data/positions.xlsx",
        sheetName: "Positions",
        dateFields: ["dateDeb", "dateFin"]
      },
      {
        name: "Corps",
        file: "/data/corps.xlsx",
        sheetName: "Corps",
        dateFields: ["dateDeb", "dateFin"]
      },
      {
        name: "Grades",
        file: "/data/grades.xlsx",
        sheetName: "Grades",
        dateFields: ["dateDeb", "dateFin"]
      },
      {
        name: "Congés/absences",
        file: "/data/conges.xlsx",
        sheetName: "Congés-absences",
        dateFields: ["dateDebutValidite", "dateFinValidite"]
      },
      {
        name: "Emplois",
        file: "/data/emplois.xlsx",
        sheetName: "Emplois",
        dateFields: ["dateEffet"]
      }
    ];

    // Charger et ajouter chaque feuille
    for (const page of pages) {
      try {
        const response = await fetch(page.file);
        const buffer = await response.arrayBuffer();
        const sourceWorkbook = XLSX.read(buffer, { type: "array" });
        const sourceSheetName = sourceWorkbook.SheetNames[0];
        const sourceSheet = sourceWorkbook.Sheets[sourceSheetName];
        
        // Convertir la feuille en JSON pour formater les dates
        const jsonData = XLSX.utils.sheet_to_json(sourceSheet);
        
        // Formater les dates dans les données
        const formattedData = jsonData.map((row: any) => {
          const formattedRow = { ...row };
          page.dateFields.forEach(field => {
            if (formattedRow[field]) {
              formattedRow[field] = formatExcelDate(formattedRow[field]);
            }
          });
          return formattedRow;
        });
        
        // Créer une nouvelle feuille avec les données formatées
        const newSheet = XLSX.utils.json_to_sheet(formattedData);
        
        // Ajouter la feuille au nouveau classeur avec le nom de la page
        XLSX.utils.book_append_sheet(workbook, newSheet, page.sheetName);
      } catch (error) {
        console.error(`Erreur lors du chargement de ${page.name}:`, error);
      }
    }

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    // Télécharger le fichier
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
