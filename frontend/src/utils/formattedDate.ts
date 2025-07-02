
export function formattedDate(inputDate: string) {
  const date = new Date(inputDate);
  const formatted = date.toISOString().split("T")[0];
  console.log(formatted);
  return formatted;
}
