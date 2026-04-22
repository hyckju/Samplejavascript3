const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');

const {
  escapeHtml,
  safeJoin,
  redactObject,
  buildSelectUserByEmail,
  isValidIPv4,
  isValidIsoDate,
  luhnIsValid,
  getConfig,
  requireSecret
} = require('../src');

test('escapeHtml escapes HTML special chars (XSS-safe output)', () => {
  const input = `<script>alert('x')</script> & \"`;
  const out = escapeHtml(input);
  assert.equal(out.includes('<'), false);
  assert.equal(out.includes('>'), false);
  assert.equal(out.includes('&lt;script&gt;'), true);
  assert.equal(out.includes('&#39;'), true);
  assert.equal(out.includes('&amp;'), true);
  assert.equal(out.includes('&quot;'), true);
});

test('safeJoin blocks directory traversal', () => {
  const base = path.resolve('public', 'uploads');

  assert.throws(() => safeJoin(base, '../secrets.txt'), /Path traversal/);
  assert.throws(() => safeJoin(base, '..\\secrets.txt'), /Path traversal/);

  const ok = safeJoin(base, 'images/avatar.png');
  assert.equal(ok.startsWith(base), true);
});

test('redactObject masks sensitive fields for safe logging', () => {
  const obj = {
    userId: 'demo_user_001',
    cardNumber: '1234-5678-9012-3456',
    password: 'super-secret'
  };

  const redacted = redactObject(obj, ['cardNumber', 'password']);
  assert.equal(redacted.userId, 'demo_user_001');
  assert.equal(redacted.cardNumber.includes('***'), true);
  assert.equal(redacted.password.includes('***'), true);
});

test('buildSelectUserByEmail uses parameterized SQL (SQLi-safe)', () => {
  const attacker = "a@example.invalid' OR '1'='1";
  const q = buildSelectUserByEmail(attacker);

  assert.equal(typeof q.text, 'string');
  assert.deepEqual(q.values, [attacker]);

  // The injected payload must NOT be interpolated into SQL text.
  assert.equal(q.text.includes(attacker), false);
  assert.equal(q.text.includes('$1'), true);
});

test('config has no hardcoded secrets; requireSecret enforces env injection', () => {
  const cfg = getConfig({ LOG_LEVEL: 'debug' });
  assert.equal(cfg.logLevel, 'debug');
  assert.equal(cfg.apiToken, null);

  assert.throws(() => requireSecret('API_TOKEN', {}), /Missing required secret/);
  assert.equal(requireSecret('API_TOKEN', { API_TOKEN: 'injected-value' }), 'injected-value');
});

test('mock_sensitive_records.json is valid and clearly fake', async () => {
  const file = path.join(__dirname, '..', 'data', 'mock_sensitive_records.json');
  const raw = await fs.readFile(file, 'utf8');
  const parsed = JSON.parse(raw);

  assert.equal(typeof parsed.notice, 'string');
  assert.equal(Array.isArray(parsed.records), true);
  assert.equal(parsed.records.length >= 1, true);

  for (const r of parsed.records) {
    assert.equal(r.loginId.endsWith('@example.invalid'), true);
    assert.equal(isValidIPv4(r.ipAddress), true);
    assert.equal(isValidIsoDate(r.birthDate), true);

    // Card numbers are intentionally invalid to avoid any real payment data.
    assert.equal(luhnIsValid(r.cardNumber), false);

    assert.equal(String(r.passwordHint).startsWith('NOT_A_REAL_PASSWORD_'), true);
    assert.equal(String(r.internalCode).startsWith('FAKE_INTERNAL_CODE_'), true);
  }
});
