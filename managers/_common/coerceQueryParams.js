const COERCE_RULES = {
  page: (v) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? false : n;
  },
  limit: (v) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? false : n;
  },
  isActive: (v) => {
    if (v === "true") return true;
    if (v === "false") return false;
    return v;
  },
};

function coerceQueryParams(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = { ...raw };
  for (const [key, coerce] of Object.entries(COERCE_RULES)) {
    if (raw[key] !== undefined) {
      out[key] = coerce(raw[key]);
    }
  }
  return out;
}

module.exports = { coerceQueryParams, COERCE_RULES };
