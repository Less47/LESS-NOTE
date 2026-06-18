import { createInitialWorkspace } from "./defaultWorkspace.js";
import { pool } from "./auth.js";

async function ensureWorkspaceTable() {
  await pool.query(`
    create table if not exists user_workspaces (
      user_id text primary key references "user"(id) on delete cascade,
      workspace jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
}

async function getWorkspaceForUser(userId) {
  const result = await pool.query(
    "select workspace from user_workspaces where user_id = $1",
    [userId],
  );

  if (result.rowCount) {
    return result.rows[0].workspace;
  }

  const workspace = createInitialWorkspace();
  await saveWorkspaceForUser(userId, workspace);
  return workspace;
}

async function saveWorkspaceForUser(userId, workspace) {
  await pool.query(
    `
      insert into user_workspaces (user_id, workspace)
      values ($1, $2::jsonb)
      on conflict (user_id)
      do update set
        workspace = excluded.workspace,
        updated_at = now()
    `,
    [userId, JSON.stringify(workspace)],
  );
}

export { ensureWorkspaceTable, getWorkspaceForUser, saveWorkspaceForUser };
