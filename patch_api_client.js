const fs = require('fs');
const path = require('path');

const apiClientPath = path.join(__dirname, 'lib', 'api-client.ts');
let content = fs.readFileSync(apiClientPath, 'utf8');

const resources = [
  'Assets', 'Entities', 'Identities', 'News', 'Files', 'Notifications', 'LedgerEntries', 'Fees'
];

for (const res of resources) {
  const resourceName = res.toLowerCase();
  // If the create method doesn't exist, append create, update, delete
  if (!content.includes(`create${res}`)) {
    content += `
export async function create${res}(data: any) {
  const res = await fetch(\`\${API_BASE}/${resourceName}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create ${resourceName}');
  return res.json();
}

export async function update${res}(id: string, data: any) {
  const res = await fetch(\`\${API_BASE}/${resourceName}/\${id}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update ${resourceName}');
  return res.json();
}

export async function delete${res}(id: string) {
  const res = await fetch(\`\${API_BASE}/${resourceName}/\${id}\`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete ${resourceName}');
  return res.json();
}
`;
  }
}

// Special case for deals: we need updateDeal and deleteDeal
if (!content.includes('updateDeal')) {
  content += `
export async function updateDeal(id: string, data: any) {
  const res = await fetch(\`\${API_BASE}/deals/\${id}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update deal');
  return res.json();
}

export async function deleteDeal(id: string) {
  const res = await fetch(\`\${API_BASE}/deals/\${id}\`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete deal');
  return res.json();
}

export async function deleteInvestment(id: string) {
  const res = await fetch(\`\${API_BASE}/investments/\${id}\`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete investment');
  return res.json();
}
`;
}

fs.writeFileSync(apiClientPath, content);
console.log('api-client.ts updated successfully!');
