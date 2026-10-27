// Small helper functions shared by controllers.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Reads ?page= and ?limit= from the URL and returns values for MongoDB skip/limit.
const pageInfo = (req, defaultLimit = 9) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || defaultLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// Returns a number, or undefined if the value is empty / not a number.
const num = (v) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : undefined);

// Turns any value into a clean, unique list of non-empty strings.
const cleanList = (arr, max = 15) => [
  ...new Set((Array.isArray(arr) ? arr : []).map((s) => String(s).trim()).filter(Boolean)),
].slice(0, max);

module.exports = { escapeRegex, pageInfo, num, cleanList };
