import { supabase } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:3001/api';

let cachedToken: string | null = null;
let sessionInitPromise: Promise<void> | null = null;

// Listen for auth changes (like token refresh) to keep the token fresh
supabase.auth.onAuthStateChange((event, session) => {
  cachedToken = session?.access_token || null;
});

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Ensure we only call getSession once to prevent concurrent lock deadlocks
  if (!sessionInitPromise) {
    sessionInitPromise = supabase.auth.getSession().then(({ data }) => {
      cachedToken = data.session?.access_token || null;
    }).catch(err => {
      console.error('Failed to get initial session in apiFetch:', err);
    });
  }
  
  await sessionInitPromise;

  const headers: Record<string, string> = {
    ...((options.headers as any) || {}),
  };

  if (cachedToken) {
    headers['Authorization'] = `Bearer ${cachedToken}`;
  }

  console.log(`[apiFetch] Requesting: ${API_BASE}${endpoint}`);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(err || `Request failed with status ${res.status}`);
  }

  // Handle empty responses
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchDeals() {
  try {
    return await apiFetch('/deals');
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) return [];
    throw error;
  }
}

export async function createDeal(dealData: any) {
  return apiFetch('/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dealData),
  });
}

export async function fetchInvestments() {
  try {
    return await apiFetch(`/investments`);
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) return [];
    throw error;
  }
}

export async function createInvestment(investmentData: any) {
  return await apiFetch(`/investments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(investmentData),
  });
    }

export async function updateInvestment(id: string, data: any) {
  return await apiFetch(`/investments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function fetchAssets() {
  try {
    return await apiFetch(`/assets`);
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) return [];
    throw error;
  }
}

export async function fetchEntities() {
  return await apiFetch(`/entities`);
    }

export async function fetchIdentities() {
  return await apiFetch(`/identities`);
    }

export async function fetchNews() {
  return await apiFetch(`/news`);
    }

export async function fetchFiles() {
  return await apiFetch(`/files`);
    }

export async function fetchNotifications() {
  try {
    return await apiFetch(`/notifications`);
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) return [];
    throw error;
  }
}

export async function fetchLedgerEntries() {
  return await apiFetch(`/ledger`);
    }

export async function fetchFees() {
  return await apiFetch(`/fees`);
    }

export async function createAssets(data: any) {
  return await apiFetch(`/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateAssets(id: string, data: any) {
  return await apiFetch(`/assets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteAssets(id: string) {
  return await apiFetch(`/assets/${id}`, {
    method: 'DELETE',
  });
    }

export async function createEntities(data: any) {
  return await apiFetch(`/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateEntities(id: string, data: any) {
  return await apiFetch(`/entities/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteEntities(id: string) {
  return await apiFetch(`/entities/${id}`, {
    method: 'DELETE',
  });
    }

export async function createIdentities(data: any) {
  return await apiFetch(`/identities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateIdentities(id: string, data: any) {
  return await apiFetch(`/identities/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteIdentities(id: string) {
  return await apiFetch(`/identities/${id}`, {
    method: 'DELETE',
  });
    }

export async function createNews(data: any) {
  return await apiFetch(`/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateNews(id: string, data: any) {
  return await apiFetch(`/news/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteNews(id: string) {
  return await apiFetch(`/news/${id}`, {
    method: 'DELETE',
  });
    }

export async function createFiles(data: any) {
  return await apiFetch(`/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateFiles(id: string, data: any) {
  return await apiFetch(`/files/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteFiles(id: string) {
  return await apiFetch(`/files/${id}`, {
    method: 'DELETE',
  });
    }

export async function createNotifications(data: any) {
  return await apiFetch(`/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateNotifications(id: string, data: any) {
  return await apiFetch(`/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteNotifications(id: string) {
  return await apiFetch(`/notifications/${id}`, {
    method: 'DELETE',
  });
    }

export async function createLedgerEntries(data: any) {
  return await apiFetch(`/ledger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateLedgerEntries(id: string, data: any) {
  return await apiFetch(`/ledger/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteLedgerEntries(id: string) {
  return await apiFetch(`/ledger/${id}`, {
    method: 'DELETE',
  });
    }

export async function createFees(data: any) {
  return await apiFetch(`/fees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function updateFees(id: string, data: any) {
  return await apiFetch(`/fees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteFees(id: string) {
  return await apiFetch(`/fees/${id}`, {
    method: 'DELETE',
  });
    }

export async function updateDeal(id: string, data: any) {
  return await apiFetch(`/deals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    }

export async function deleteDeal(id: string) {
  return await apiFetch(`/deals/${id}`, {
    method: 'DELETE',
  });
    }

export async function deleteInvestment(id: string) {
  return await apiFetch(`/investments/${id}`, {
    method: 'DELETE',
  });
    }
