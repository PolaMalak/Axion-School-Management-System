module.exports = {
  username: (data) => {
    if (data.trim().length < 3) return false;
    return true;
  },
  mongoId: (data) => {
    if (data === undefined || data === null || data === "") return false;
    if (typeof data !== "string" || data.length !== 24) return false;
    if (!/^[a-f0-9A-F]{24}$/.test(data)) return false;
    return true;
  },
  date: (data) => {
    if (data === undefined || data === null || data === "") return false;
    if (typeof data !== "string") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return false;
    if (d.toISOString().slice(0, 10) !== data) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d > today) return false;
    const min = new Date("1900-01-01");
    if (d < min) return false;
    return true;
  },
};
