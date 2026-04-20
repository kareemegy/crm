// Thin fetch wrapper. Keeps UI components free of network details.
// In dev the Vite proxy handles /api → localhost:4000.
// In prod, set VITE_API_BASE_URL to the deployed server origin (e.g. https://crm-api.onrender.com).
const BASE = (import.meta.env.VITE_API_BASE_URL || '') + '/api';

async function request(path, { method = 'GET', body, query } = {}) {
  const qs = query
    ? '?' + new URLSearchParams(
        Object.entries(query).filter(([, v]) => v != null && v !== '')
      ).toString()
    : '';

  const res = await fetch(`${BASE}${path}${qs}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  clients: {
    list:   ()      => request('/clients'),
    get:    (id)    => request(`/clients/${id}`),
    create: (data)  => request('/clients', { method: 'POST',   body: data }),
    update: (id, d) => request(`/clients/${id}`, { method: 'PUT',    body: d }),
    remove: (id)    => request(`/clients/${id}`, { method: 'DELETE' })
  },
  projects: {
    list:   (query) => request('/projects', { query }),
    get:    (id)    => request(`/projects/${id}`),
    create: (data)  => request('/projects', { method: 'POST',   body: data }),
    update: (id, d) => request(`/projects/${id}`, { method: 'PUT',    body: d }),
    remove: (id)    => request(`/projects/${id}`, { method: 'DELETE' })
  },
  videos: {
    listByProject: (projectId) => request(`/projects/${projectId}/videos`),
    create: (projectId, data)  => request(`/projects/${projectId}/videos`, { method: 'POST',   body: data }),
    update: (id, data)         => request(`/videos/${id}`,                 { method: 'PUT',    body: data }),
    remove: (id)               => request(`/videos/${id}`,                 { method: 'DELETE' })
  },
  categories: {
    list:   ()      => request('/categories'),
    create: (data)  => request('/categories', { method: 'POST',   body: data }),
    update: (id, d) => request(`/categories/${id}`, { method: 'PUT',    body: d }),
    remove: (id)    => request(`/categories/${id}`, { method: 'DELETE' })
  },
  employees: {
    list:   ()      => request('/employees'),
    create: (data)  => request('/employees', { method: 'POST',   body: data }),
    update: (id, d) => request(`/employees/${id}`, { method: 'PUT',    body: d }),
    remove: (id)    => request(`/employees/${id}`, { method: 'DELETE' })
  },
  serviceTypes: {
    list:   ()      => request('/service-types'),
    create: (data)  => request('/service-types', { method: 'POST',   body: data }),
    update: (id, d) => request(`/service-types/${id}`, { method: 'PUT',    body: d }),
    remove: (id)    => request(`/service-types/${id}`, { method: 'DELETE' })
  },
  reports: {
    summary:    () => request('/reports/summary'),
    workload:   () => request('/reports/workload'),
    byStatus:   () => request('/reports/by-status'),
    byCategory: () => request('/reports/by-category'),
    monthly:    () => request('/reports/monthly')
  }
};
