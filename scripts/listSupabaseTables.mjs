import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    return {};
  }

  const content = readFileSync(envPath, 'utf8');
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    env[key] = value;
  }

  return env;
}

const fileEnv = loadEnvFile();
const projectRef = 'ufanddrywvmemldxuffr';
const managementToken = process.env.SUPABASE_ACCESS_TOKEN || fileEnv.SUPABASE_ACCESS_TOKEN || fileEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!managementToken) {
  console.error('Missing management token. Provide SUPABASE_ACCESS_TOKEN in your environment or .env.local file.');
  process.exitCode = 1;
  process.exit();
}

const query = `
  select table_schema, table_name
  from information_schema.tables
  where table_schema not in ('information_schema', 'pg_catalog')
  order by table_schema, table_name
`;

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${managementToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query, read_only: true })
});

if (!response.ok) {
  console.error('Failed to fetch tables:', response.status, response.statusText);
  const text = await response.text();
  if (text) {
    console.error(text);
  }
  process.exitCode = 1;
  process.exit();
}

const data = await response.json();
const rows = Array.isArray(data) ? data : [];
const tables = rows.map((row) => `${row.table_schema}.${row.table_name}`);

if (!tables.length) {
  console.log('No tables found.');
} else {
  console.log('Supabase tables:', tables.join(', '));
}