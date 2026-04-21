// Firestore-backed data layer. Public surface matches the SQLite/Express
// version byte-for-byte so every page + component compiles unchanged.
//
// Row shape convention: `{ id: <firestore-doc-id>, ...fields }`. Fields keep
// snake_case to match the SQLite schema (created_at, client_id, payment_status),
// so pages that render or filter by those keys keep working.
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

// ---------- helpers -------------------------------------------------------

function nowISO() { return new Date().toISOString(); }

function snapshotToRow(snap) {
  if (!snap.exists || (typeof snap.exists === 'function' && !snap.exists())) return null;
  return { id: snap.id, ...snap.data() };
}

function queryToRows(snap) {
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function listAll(col) {
  return queryToRows(await getDocs(collection(db, col)));
}

async function getOne(col, id) {
  return snapshotToRow(await getDoc(doc(db, col, id)));
}

async function createOne(col, data) {
  const payload = { ...data, created_at: nowISO(), updated_at: nowISO() };
  const ref = await addDoc(collection(db, col), payload);
  return { id: ref.id, ...payload };
}

async function updateOne(col, id, data) {
  const payload = { ...data, updated_at: nowISO() };
  await updateDoc(doc(db, col, id), payload);
  return getOne(col, id);
}

async function deleteOne(col, id) {
  await deleteDoc(doc(db, col, id));
  return null;
}

function indexBy(arr, key = 'id') {
  return Object.fromEntries(arr.map(x => [x[key], x]));
}

// Cascade helper: when we delete a parent, remove children with a matching FK.
async function cascadeDelete(col, fkField, fkValue) {
  const snap = await getDocs(
    query(collection(db, col), where(fkField, '==', fkValue))
  );
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ---------- videos-aware project enrichment -------------------------------
// Mirrors the SQL WITH_PROJECT_STATS CTE in server/src/services/reportService.js:
// every financial widget (dashboard cards, reports) reads these fields.

function aggregateProjectStats(project, videosForProject) {
  let effective_price = 0;
  let effective_deposit = 0;
  let effective_received = 0;
  let video_count = 0;
  let services_count = 0;
  for (const v of videosForProject) {
    const price    = Number(v.price)        || 0;
    const deposit  = Number(v.deposit_paid) || 0;
    const qty      = Number(v.quantity)     || 1;
    video_count   += 1;
    services_count += qty;
    effective_price   += price;
    if (v.payment_status === 'Deposit')   effective_deposit  += deposit;
    if (v.payment_status === 'Completed') effective_received += price;
    else if (v.payment_status === 'Deposit') effective_received += deposit;
  }
  return { ...project, effective_price, effective_deposit, effective_received, video_count, services_count };
}

async function enrichProjects(projects) {
  if (!projects.length) return [];
  const [clients, categories, employees, videos] = await Promise.all([
    listAll('clients'),
    listAll('categories'),
    listAll('employees'),
    listAll('videos')
  ]);
  const cli = indexBy(clients);
  const cat = indexBy(categories);
  const emp = indexBy(employees);
  const videosByProject = videos.reduce((m, v) => {
    (m[v.project_id] ||= []).push(v);
    return m;
  }, {});
  return projects.map(p => {
    const stats = aggregateProjectStats(p, videosByProject[p.id] || []);
    return {
      ...stats,
      client_name:   cli[p.client_id]?.name   ?? null,
      category_name: cat[p.category_id]?.name ?? null,
      assignee_name: emp[p.assignee_id]?.name ?? null
    };
  });
}

function sortByCreatedDesc(rows) {
  return [...rows].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

// ---------- entity wrappers ----------------------------------------------

const clients = {
  list:   async () => sortByCreatedDesc(await listAll('clients')),
  get:    (id)    => getOne('clients', id),
  create: (data)  => createOne('clients', data),
  update: (id, d) => updateOne('clients', id, d),
  remove: async (id) => {
    // Mirror SQL `ON DELETE CASCADE` on projects → videos.
    const projectSnap = await getDocs(
      query(collection(db, 'projects'), where('client_id', '==', id))
    );
    await Promise.all(projectSnap.docs.map(async pDoc => {
      await cascadeDelete('videos', 'project_id', pDoc.id);
      await deleteDoc(pDoc.ref);
    }));
    return deleteOne('clients', id);
  }
};

const projects = {
  list: async (filters = {}) => {
    let rows = await listAll('projects');
    if (filters) {
      if (filters.status)     rows = rows.filter(p => p.payment_status === filters.status);
      if (filters.categoryId) rows = rows.filter(p => p.category_id    === filters.categoryId);
      if (filters.assigneeId) rows = rows.filter(p => p.assignee_id    === filters.assigneeId);
      if (filters.clientId)   rows = rows.filter(p => p.client_id      === filters.clientId);
      if (filters.from)       rows = rows.filter(p => (p.delivery_date || p.created_at || '') >= filters.from);
      if (filters.to)         rows = rows.filter(p => (p.delivery_date || p.created_at || '') <= filters.to);
    }
    return sortByCreatedDesc(await enrichProjects(rows));
  },
  get: async (id) => {
    const p = await getOne('projects', id);
    if (!p) return null;
    return (await enrichProjects([p]))[0];
  },
  create: (data)  => createOne('projects', data),
  update: (id, d) => updateOne('projects', id, d),
  remove: async (id) => {
    await cascadeDelete('videos', 'project_id', id);
    return deleteOne('projects', id);
  }
};

const videos = {
  listByProject: async (projectId) => {
    const snap = await getDocs(
      query(collection(db, 'videos'), where('project_id', '==', projectId))
    );
    return sortByCreatedDesc(queryToRows(snap));
  },
  create: (projectId, data)  => createOne('videos', { ...data, project_id: projectId }),
  update: (id, data)         => updateOne('videos', id, data),
  remove: (id)               => deleteOne('videos', id)
};

const categories = {
  list:   async () => sortByCreatedDesc(await listAll('categories')),
  create: (data)  => createOne('categories', data),
  update: (id, d) => updateOne('categories', id, d),
  remove: (id)    => deleteOne('categories', id)
};

const employees = {
  list:   async () => sortByCreatedDesc(await listAll('employees')),
  create: (data)  => createOne('employees', data),
  update: (id, d) => updateOne('employees', id, d),
  remove: (id)    => deleteOne('employees', id)
};

const serviceTypes = {
  list:   async () => sortByCreatedDesc(await listAll('serviceTypes')),
  create: (data)  => createOne('serviceTypes', data),
  update: (id, d) => updateOne('serviceTypes', id, d),
  remove: (id)    => deleteOne('serviceTypes', id)
};

// ---------- reports (client-side aggregation) -----------------------------
// Firestore has no SQL SUM/GROUP BY, so we load the relevant collections and
// aggregate in JS. Fine at our scale (small CRM, <1000 docs per collection).

async function loadReportData() {
  const [rawProjects, clientsRows, categoriesRows, employeesRows, videos] = await Promise.all([
    listAll('projects'),
    listAll('clients'),
    listAll('categories'),
    listAll('employees'),
    listAll('videos')
  ]);
  const videosByProject = videos.reduce((m, v) => {
    (m[v.project_id] ||= []).push(v);
    return m;
  }, {});
  const projects = rawProjects.map(p => aggregateProjectStats(p, videosByProject[p.id] || []));
  return { projects, clients: clientsRows, categories: categoriesRows, employees: employeesRows, videos };
}

const reports = {
  summary: async () => {
    const { projects, videos } = await loadReportData();
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let incomeThisMonth = 0, depositedMoney = 0, pendingMoney = 0;
    for (const p of projects) {
      const m = (p.delivery_date || p.created_at || '').slice(0, 7);
      if (p.payment_status === 'Completed' && m === curMonth) incomeThisMonth += p.effective_price;
      pendingMoney += Math.max(
        p.effective_price - ((Number(p.deposit_paid) || 0) + p.effective_received),
        0
      );
      if (p.payment_status === 'Deposit') depositedMoney += Number(p.deposit_paid) || 0;
    }
    for (const v of videos) {
      if (v.payment_status === 'Deposit') depositedMoney += Number(v.deposit_paid) || 0;
    }
    return { incomeThisMonth, depositedMoney, pendingMoney };
  },

  workload: async () => {
    const { projects, employees } = await loadReportData();
    const stats = employees.map(e => ({
      id: e.id, name: e.name, role: e.role, total_projects: 0, active_projects: 0, total_value: 0
    }));
    const byId = indexBy(stats);
    for (const p of projects) {
      const s = byId[p.assignee_id];
      if (!s) continue;
      s.total_projects += 1;
      if (p.payment_status !== 'Completed') s.active_projects += 1;
      s.total_value += p.effective_price;
    }
    return stats.sort((a, b) => b.active_projects - a.active_projects || a.name.localeCompare(b.name));
  },

  byStatus: async () => {
    const { projects } = await loadReportData();
    const bucket = {};
    for (const p of projects) {
      const s = p.payment_status || 'Pending';
      bucket[s] ||= { status: s, count: 0, total_value: 0 };
      bucket[s].count += 1;
      bucket[s].total_value += p.effective_price;
    }
    return Object.values(bucket);
  },

  byCategory: async () => {
    const { projects, categories } = await loadReportData();
    const catName = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const bucket = {};
    for (const p of projects) {
      const name = catName[p.category_id] || 'Uncategorized';
      bucket[name] ||= { category: name, count: 0, total_value: 0 };
      bucket[name].count += 1;
      bucket[name].total_value += p.effective_price;
    }
    return Object.values(bucket).sort((a, b) => b.total_value - a.total_value);
  },

  monthly: async () => {
    const { projects } = await loadReportData();
    const byMonth = {};
    for (const p of projects) {
      if (p.payment_status !== 'Completed') continue;
      const m = (p.delivery_date || p.created_at || '').slice(0, 7);
      if (!m) continue;
      byMonth[m] = (byMonth[m] || 0) + p.effective_price;
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12)
      .map(([month, revenue]) => ({ month, revenue }));
  }
};

export const api = { clients, projects, videos, categories, employees, serviceTypes, reports };
