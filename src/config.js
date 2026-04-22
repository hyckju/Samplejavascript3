function getConfig(env = process.env) {
  const logLevel = env.LOG_LEVEL || 'info';

  return {
    logLevel,
    apiToken: env.API_TOKEN || null
  };
}

function requireSecret(name, env = process.env) {
  const key = String(name);
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required secret: ${key}`);
  }
  return value;
}

module.exports = { getConfig, requireSecret };
