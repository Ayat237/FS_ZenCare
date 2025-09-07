export function formattedDate(inputDate: string) {
  if (!inputDate || inputDate.trim() === "") {
    return "";
  }

  try {
    const date = new Date(inputDate);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date provided to formattedDate:", inputDate);
      return "";
    }

    const formatted = date.toISOString().split("T")[0];
    console.log("Formatted date:", formatted);
    return formatted;
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", inputDate);
    return "";
  }
}
