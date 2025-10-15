import * as XLSX from "xlsx";

export const exportAllDataToExcel = async () => {
  try {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();

    // Définir les pages et leurs données
    const pages = [
      {
        name: "Statuts contractuels",
        file: "/data/contractuels.xlsx",
        sheetName: "Statuts contractuels"
      },
      {
        name: "Vacataires",
        file: "/data/vacataires.xlsx",
        sheetName: "Vacataires"
      },
      {
        name: "Positions",
        file: "/data/positions.xlsx",
        sheetName: "Positions"
      },
      {
        name: "Corps",
        file: "/data/corps.xlsx",
        sheetName: "Corps"
      },
      {
        name: "Grades",
        file: "/data/grades.xlsx",
        sheetName: "Grades"
      },
      {
        name: "Congés/absences",
        file: "/data/conges.xlsx",
        sheetName: "Congés-absences"
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
        
        // Ajouter la feuille au nouveau classeur avec le nom de la page
        XLSX.utils.book_append_sheet(workbook, sourceSheet, page.sheetName);
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
