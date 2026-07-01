import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wranglerPath = resolve(__dirname, '../dist/server/wrangler.json');

const config = JSON.parse(readFileSync(wranglerPath, 'utf-8'));

// CF Pages requires this field to recognize the config as valid
config.pages_build_output_dir = '../client';

// Remove SESSION KV — not needed, session: false in adapter config doesn't strip it
config.kv_namespaces = (config.kv_namespaces ?? []).filter(
	(kv) => kv.binding !== 'SESSION'
);
if (config.previews?.kv_namespaces) {
	config.previews.kv_namespaces = config.previews.kv_namespaces.filter(
		(kv) => kv.binding !== 'SESSION'
	);
}

writeFileSync(wranglerPath, JSON.stringify(config, null, '\t'));
console.log('[patch-wrangler] dist/server/wrangler.json patched');
