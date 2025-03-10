import { NameTypeValueItem } from "@/types";

export function parseNameTypeValueItemValue(
    value: string | null | undefined,
    type: NameTypeValueItem["type"] | "date" | "json"
  ): unknown {
    // Handle null or undefined values gracefully
    if (value == null) {
      switch (type) {
        case "number":
          return 0;
        case "boolean":
          return false;
        case "date":
          // Decide how to default invalid dates, e.g. return null
          return null;
        case "json":
          // Return null for missing JSON
          return null;
        case "string":
        default:
          return "";
      }
    }
  
    const trimmedValue = value.trim();
  
    switch (type) {
      case "string":
        return trimmedValue;
  
      case "number": {
        const num = Number(trimmedValue);
        return isNaN(num) ? 0 : num;
      }
  
      case "boolean":
        return trimmedValue.toLowerCase() === "true";
  
      case "date": {
        const parsedDate = new Date(trimmedValue);
        // Return null for invalid dates
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      }
  
      case "json":
        try {
          return JSON.parse(trimmedValue);
        } catch {
          // Return null if JSON parsing fails
          return null;
        }
  
      default:
        // Fallback for unknown types
        return trimmedValue;
    }
  }