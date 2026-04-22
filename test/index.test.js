const test = require('node:test');
const assert = require('node:assert/strict');

test('library exports expected API', () => {
  const api = require('../src');
  assert.equal(typeof api.escapeHtml, 'function');
  assert.equal(typeof api.safeJoin, 'function');
  assert.equal(typeof api.redactObject, 'function');
  assert.equal(typeof api.buildSelectUserByEmail, 'function');
});
