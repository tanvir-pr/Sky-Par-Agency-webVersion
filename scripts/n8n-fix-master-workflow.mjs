#!/usr/bin/env node
/**
 * Reset n8n Master Router workflow to clean version (fixes "1 node has issues").
 * Usage: node scripts/n8n-fix-master-workflow.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { DatabaseSync } from "node:sqlite";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKFLOW_ID = "S1lTeLshHh8nxhyV";
const dbPath = join(homedir(), ".n8n", "database.sqlite");
const workflowFile = join(__dirname, "../n8n/workflows/01-master-router.json");

const workflow = JSON.parse(readFileSync(workflowFile, "utf8"));
const nodes = JSON.stringify(workflow.nodes);
const connections = JSON.stringify(workflow.connections);

const db = new DatabaseSync(dbPath);
const result = db
  .prepare(
    `UPDATE workflow_entity
     SET nodes = ?, connections = ?, updatedAt = datetime('now'), versionCounter = versionCounter + 1
     WHERE id = ?`
  )
  .run(nodes, connections, WORKFLOW_ID);

if (result.changes === 0) {
  console.error("Workflow not found:", WORKFLOW_ID);
  process.exit(1);
}

console.log("Updated workflow in database:", WORKFLOW_ID);

process.env.N8N_ENCRYPTION_KEY =
  process.env.N8N_ENCRYPTION_KEY || "nexus-n8n-encryption-key-dev";

execSync(`npx n8n publish:workflow --id=${WORKFLOW_ID}`, {
  stdio: "inherit",
  cwd: join(__dirname, ".."),
});

console.log("\nDone. Restart n8n (Ctrl+C then: npx n8n start) if it is already running.");
