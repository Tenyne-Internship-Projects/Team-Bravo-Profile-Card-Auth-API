
// Group by month and either count or sum the values based on the valueKey
export function groupByMonth(datesOrObjects, valueKey = null) {
  if (!Array.isArray(datesOrObjects)) {
    throw new Error("Input should be an array of dates or objects");
  }

  const map = {};
  for (let entry of datesOrObjects) {
    const date = valueKey ? entry.date : entry;
    const value = valueKey ? entry[valueKey] : 1;
    const month = new Date(date).toLocaleString("default", { month: "long" });

    map[month] = (map[month] || 0) + value;
  }

  return Object.entries(map).map(([month, val]) => ({
    month,
    [valueKey ? 'amount' : 'count']: val
  }));
}

// Merge user and revenue data for charting purposes
export function mergeChartData(users, revenue) {
  if (!Array.isArray(users) || !Array.isArray(revenue)) {
    throw new Error("Both inputs must be arrays");
  }

  const allMonths = new Set([...users.map(u => u.month), ...revenue.map(r => r.month)]);
  return Array.from(allMonths).map(month => ({
    month,
    users: users.find(x => x.month === month)?.count || 0,
    revenue: revenue.find(x => x.month === month)?.amount || 0
  }));
}

// Calculate the average value of an array of numbers
export function average(arr) {
  if (!Array.isArray(arr)) {
    throw new Error("Input should be an array");
  }

  if (!arr.length) return 0;

  const total = arr.reduce((sum, n) => sum + n, 0);
  return total / arr.length;
}


