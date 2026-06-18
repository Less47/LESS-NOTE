function parseCsv(value) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const defaultClientOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
];

const authBaseUrl =
  process.env.BETTER_AUTH_URL?.trim() ||
  `http://127.0.0.1:${process.env.PORT?.trim() || "8787"}`;

const clientOrigins = Array.from(
  new Set([
    new URL(authBaseUrl).origin,
    ...defaultClientOrigins,
    ...parseCsv(process.env.CLIENT_ORIGINS),
  ]),
);

const databaseUrl = getRequiredEnv("DATABASE_URL");
const betterAuthSecret = getRequiredEnv("BETTER_AUTH_SECRET");
const useDatabaseSsl =
  process.env.DATABASE_SSL === "true" ||
  process.env.PGSSLMODE === "require" ||
  databaseUrl.includes("sslmode=require");

export {
  authBaseUrl,
  betterAuthSecret,
  clientOrigins,
  databaseUrl,
  getRequiredEnv,
  useDatabaseSsl,
};
