const fs = require('fs');

const path = './lib/api-client.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace fetch(`${API_BASE}/endpoint`) with apiFetch('/endpoint')
code = code.replace(/await fetch\(`\$\{API_BASE\}(.*?)(?:`\)|`, \{(.*?)\}\))/gs, (match, endpoint, options) => {
  if (options) {
    return `await apiFetch(\`${endpoint}\`, {${options}})`;
  }
  return `await apiFetch(\`${endpoint}\`)`;
});

// Remove all `if (!res.ok) throw new Error(...)` lines
code = code.replace(/if \(!res\.ok\) throw new Error\('.*?'\);\n/g, '');

// The apiFetch already returns json, so we don't need `return res.json()`
code = code.replace(/const res = await apiFetch/g, 'return await apiFetch');
code = code.replace(/return res\.json\(\);\n/g, '');

// For endpoints that return text or nothing, wait... apiFetch handles returning json or null if 204.
// Let's just do a blanket fix. 
fs.writeFileSync(path, code);
console.log('Patched api-client.ts');
