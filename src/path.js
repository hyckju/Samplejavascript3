const path = require('node:path');

function safeJoin(baseDir, untrustedPath) {
  const baseResolved = path.resolve(baseDir);
  const targetResolved = path.resolve(baseResolved, String(untrustedPath));

  const rel = path.relative(baseResolved, targetResolved);
  const isInside = rel && !rel.startsWith('..') && !path.isAbsolute(rel);

  if (!isInside) {
    throw new Error('Path traversal detected');
  }

  return targetResolved;
}

module.exports = { safeJoin };
