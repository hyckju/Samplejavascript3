function redactValue(value) {
  if (value === null || value === undefined) return value;
  const text = String(value);
  if (text.length <= 4) return '***';
  return text.slice(0, 2) + '***' + text.slice(-2);
}

function redactObject(input, sensitiveKeys = []) {
  if (input === null || typeof input !== 'object') {
    throw new TypeError('input must be an object');
  }

  const sensitive = new Set(sensitiveKeys.map((k) => String(k).toLowerCase()));
  const result = Array.isArray(input) ? [] : {};

  for (const [key, value] of Object.entries(input)) {
    if (sensitive.has(String(key).toLowerCase())) {
      result[key] = redactValue(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

module.exports = { redactObject };
