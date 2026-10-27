// Removes MongoDB operators ("$gt", "a.b") from user input and trims strings.
// This blocks NoSQL-injection attempts such as { "email": { "$gt": "" } }.
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = clean(value[key]);
    }
    return out;
  }
  return typeof value === 'string' ? value.trim() : value;
};

module.exports = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.query) req.query = clean(req.query);
  next();
};
