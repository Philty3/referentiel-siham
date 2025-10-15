import { format } from "date-fns";

export interface DateValidationError {
  page: string;
  row: number;
  field: string;
  originalValue: any;
  convertedValue: string;
  isValid: boolean;
}

export const formatExcelDate = (value: any): string => {
  if (!value) return "";
  
  // Si c'est un nombre (date Excel sérielle)
  if (typeof value === "number") {
    // Convertir le numéro de série Excel en date JavaScript
    // Excel commence à compter depuis le 1er janvier 1900
    // Il y a un bug dans Excel qui compte 1900 comme année bissextile, donc on doit ajuster
    const excelEpoch = new Date(1899, 11, 30); // 30 décembre 1899
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
  
  // Si c'est déjà une string
  if (typeof value === "string") {
    // Si déjà au bon format, retourner tel quel
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    
    // Si format DD/M/YYYY ou D/MM/YYYY ou D/M/YYYY
    const frenchDateMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (frenchDateMatch) {
      const day = frenchDateMatch[1].padStart(2, "0");
      const month = frenchDateMatch[2].padStart(2, "0");
      const year = frenchDateMatch[3];
      return `${day}/${month}/${year}`;
    }
    
    // Essayer de parser d'autres formats
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return format(date, "dd/MM/yyyy");
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }
  }
  
  // Si c'est un objet Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    return format(value, "dd/MM/yyyy");
  }
  
  return String(value);
};

export const validateDateFormat = (dateString: string): boolean => {
  if (!dateString) return true; // Les dates vides sont valides
  
  // Vérifier le format JJ/MM/AAAA
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  // Vérifier que la date est valide
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
};

export const validateDataDates = (
  data: any[],
  dateFields: string[],
  pageName: string
): DateValidationError[] => {
  const errors: DateValidationError[] = [];
  
  data.forEach((item, index) => {
    dateFields.forEach(field => {
      const value = item[field];
      if (value && !validateDateFormat(value)) {
        errors.push({
          page: pageName,
          row: index + 1,
          field,
          originalValue: value,
          convertedValue: formatExcelDate(value),
          isValid: false
        });
      }
    });
  });
  
  return errors;
};

export const logDateValidationErrors = (errors: DateValidationError[]) => {
  if (errors.length === 0) {
    console.log("✅ Toutes les dates sont au format JJ/MM/AAAA");
    return;
  }
  
  console.group("⚠️ Erreurs de format de dates détectées:");
  errors.forEach(error => {
    console.log(
      `Page: ${error.page}, Ligne: ${error.row}, Champ: ${error.field}\n` +
      `  Valeur originale: ${error.originalValue}\n` +
      `  Valeur convertie: ${error.convertedValue}`
    );
  });
  console.groupEnd();
};
