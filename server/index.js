import "dotenv/config";

import cors from "cors";
import express from "express";
import { getMigrations } from "better-auth/db/migration";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { auth, clientOrigins } from "./auth.js";
import { ensureWorkspaceTable, getWorkspaceForUser, saveWorkspaceForUser } from "./workspaceStore.js";

const app = express();
const port = Number(process.env.PORT || 8787);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const hasBuiltFrontend = existsSync(path.join(distDir, "index.html"));
const allowedOrigins = new Set(clientOrigins);

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed.`));
  },
  credentials: true,
});

app.use(corsMiddleware);
app.options("/{*any}", corsMiddleware);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json({ limit: "100mb" }));

async function requireSession(request, response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session?.user?.id) {
    response.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return session;
}

app.get("/api/workspace", async (request, response) => {
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const workspace = await getWorkspaceForUser(session.user.id);
  response.setHeader("Cache-Control", "no-store");
  response.json({ workspace });
});

app.put("/api/workspace", async (request, response) => {
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const workspace = request.body?.workspace;
  if (!workspace || typeof workspace !== "object" || Array.isArray(workspace)) {
    response.status(400).json({ error: "A workspace object is required." });
    return;
  }

  await saveWorkspaceForUser(session.user.id, workspace);
  response.status(204).end();
});

if (hasBuiltFrontend) {
  app.use(express.static(distDir));

  app.get("/{*any}", (request, response, next) => {
    if (request.path.startsWith("/api/")) {
      next();
      return;
    }

    response.sendFile(path.join(distDir, "index.html"));
  });
} else {
  app.get("/", (_request, response) => {
    response
      .status(503)
      .send("Frontend build not found. Run `npm run build` before starting the production server.");
  });
}

async function start() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  await ensureWorkspaceTable();

  app.listen(port, () => {
    console.log(`LESS NOTE server listening on http://127.0.0.1:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start LESS NOTE server.");
  console.error(error);
  process.exit(1);
});
