export function getAvailableWeeks() {
  const weeks = [];
  let current = new Date();
  // Get current Monday
  const day = current.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  current.setDate(current.getDate() + diff);
  
  for (let i = 0; i < 4; i++) {
    weeks.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

export function formatThaiDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("th-TH", { 
    day: 'numeric', 
    month: 'short' 
  });
}
