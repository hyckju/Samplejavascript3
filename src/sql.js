function buildSelectUserByEmail(email) {
  if (typeof email !== 'string' || email.length === 0 || email.length > 254) {
    throw new Error('Invalid email');
  }

  return {
    text: 'SELECT id, email, display_name FROM users WHERE email = $1 LIMIT 1',
    values: [email]
  };
}

module.exports = { buildSelectUserByEmail };
