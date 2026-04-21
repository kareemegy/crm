import 'dotenv/config';
import db from './database.js';

// Social-media-marketing flavored sample data.
// Idempotent: categories/service_types use INSERT OR IGNORE; clients &
// employees only seed when their tables are empty so reruns won't duplicate.

const categories = [
  'Content Creation',
  'Paid Ads',
  'Brand Strategy',
  'Video Production',
  'Influencer Campaigns',
  'Community Management'
];

const serviceTypes = [
  'Reel',
  'Short',
  'Podcast',
  'Long Video',
  'Design',
  'Carousel Post',
  'Thumbnail',
  'Ad Creative',
  'Motion Graphics',
  'Script',
  'Voiceover'
];

const employees = [
  { name: 'Sara Ali',      email: 'sara@tikagency.com',   role: 'Content Strategist' },
  { name: 'Omar Hassan',   email: 'omar@tikagency.com',   role: 'Senior Video Editor' },
  { name: 'Lina Saeed',    email: 'lina@tikagency.com',   role: 'Graphic Designer' },
  { name: 'Youssef Nabil', email: 'youssef@tikagency.com',role: 'Copywriter' },
  { name: 'Hana Farouk',   email: 'hana@tikagency.com',   role: 'Paid Ads Specialist' },
  { name: 'Karim Adel',    email: 'karim@tikagency.com',  role: 'Community Manager' }
];

const clients = [
  { name: 'Pulse Fitness Club',  email: 'marketing@pulsefit.co',    phone: '+20 100 555 0101', notes: 'Gym chain — wants weekly reels + member stories.' },
  { name: 'Bean & Brew Coffee',  email: 'hello@beanandbrew.co',     phone: '+20 100 555 0102', notes: 'Specialty coffee chain, 4 branches. Cozy/warm tone.' },
  { name: 'Nova Apparel',        email: 'social@novaapparel.com',   phone: '+20 100 555 0103', notes: 'Streetwear brand launching SS26 collection.' },
  { name: 'CloudStack SaaS',     email: 'growth@cloudstack.io',     phone: '+20 100 555 0104', notes: 'B2B tool — LinkedIn-first content, founder videos.' },
  { name: 'Saffron Bistro',      email: 'owner@saffronbistro.com',  phone: '+20 100 555 0105', notes: 'Fine-dining restaurant opening a second location.' },
  { name: 'Orbit E-Commerce',    email: 'team@orbit.store',         phone: '+20 100 555 0106', notes: 'DTC home goods, heavy on Meta Ads.' },
  { name: 'BrightSmile Dental',  email: 'clinic@brightsmile.co',    phone: '+20 100 555 0107', notes: 'Local clinic — before/after reels + testimonials.' },
  { name: 'Trailhead Outdoors',  email: 'hi@trailhead.travel',      phone: '+20 100 555 0108', notes: 'Adventure tour company — YouTube long-form focus.' }
];

const insertCategory    = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
const insertServiceType = db.prepare('INSERT OR IGNORE INTO service_types (name) VALUES (?)');
const insertEmployee    = db.prepare('INSERT INTO employees (name, email, role) VALUES (?, ?, ?)');
const insertClient      = db.prepare('INSERT INTO clients (name, email, phone, notes) VALUES (?, ?, ?, ?)');
const insertProject     = db.prepare(`
  INSERT INTO projects
    (name, client_id, category_id, assignee_id, payment_status, delivery_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertVideo = db.prepare(`
  INSERT INTO videos
    (project_id, service_type_id, name, quantity, price, payment_status, deposit_paid, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const anyEmployees = db.prepare('SELECT COUNT(*) AS c FROM employees').get().c > 0;
const anyClients   = db.prepare('SELECT COUNT(*) AS c FROM clients').get().c > 0;
const anyProjects  = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c > 0;

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

db.transaction(() => {
  categories.forEach(c => insertCategory.run(c));
  serviceTypes.forEach(n => insertServiceType.run(n));
  if (!anyEmployees) employees.forEach(e => insertEmployee.run(e.name, e.email, e.role));

  if (!anyClients) {
    clients.forEach(c => insertClient.run(c.name, c.email, c.phone, c.notes));
  }

  // Projects seed independently of clients: they load whenever the
  // projects table is empty, and bind to clients by name (existing or
  // freshly-seeded). If a referenced client doesn't exist, the project
  // is skipped with a warning — so reruns after manual deletes don't crash.
  if (!anyProjects) {
    const catByName = Object.fromEntries(
      db.prepare('SELECT id, name FROM categories').all().map(r => [r.name, r.id])
    );
    const typeByName = Object.fromEntries(
      db.prepare('SELECT id, name FROM service_types').all().map(r => [r.name, r.id])
    );
    const clientByName = Object.fromEntries(
      db.prepare('SELECT id, name FROM clients').all().map(r => [r.name, r.id])
    );
    const emps = db.prepare('SELECT id FROM employees').all();
    const pickEmp = (i) => emps[i % emps.length]?.id;

    // Each project: one or more line-item services (the "videos" table).
    // Mix of retainers (recurring monthly) and campaign one-offs.
    const projects = [
      {
        client: 'Pulse Fitness Club',
        category: 'Content Creation',
        name: 'April content retainer',
        status: 'Completed', days: -12, empIdx: 0,
        notes: 'Monthly content drop — reels + carousels.',
        services: [
          { type: 'Reel',          name: 'Weekly member-story reels',     qty: 8, price: 3200, status: 'Completed', deposit: 0 },
          { type: 'Carousel Post', name: 'Workout tips carousels',        qty: 6, price: 1200, status: 'Completed', deposit: 0 },
          { type: 'Short',         name: 'Trainer intro shorts',          qty: 4, price:  800, status: 'Completed', deposit: 0 }
        ]
      },
      {
        client: 'Pulse Fitness Club',
        category: 'Content Creation',
        name: 'May content retainer',
        status: 'Deposit', days: 18, empIdx: 0,
        notes: 'Next drop — summer challenge launch.',
        services: [
          { type: 'Reel',          name: 'Summer challenge reels',        qty: 10, price: 4000, status: 'Deposit',   deposit: 1500 },
          { type: 'Thumbnail',     name: 'Challenge promo thumbnails',    qty: 5,  price:  500, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'Bean & Brew Coffee',
        category: 'Video Production',
        name: 'Brand story film',
        status: 'Deposit', days: 25, empIdx: 1,
        notes: '90-sec hero film for website + YouTube.',
        services: [
          { type: 'Long Video',    name: 'Brand story hero film',         qty: 1, price: 6500, status: 'Deposit',   deposit: 2500 },
          { type: 'Short',         name: 'Cutdown teaser shorts',         qty: 3, price:  900, status: 'Pending',   deposit: 0 },
          { type: 'Motion Graphics', name: 'Logo animation package',      qty: 1, price: 1200, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'Bean & Brew Coffee',
        category: 'Community Management',
        name: 'IG community management — Q2',
        status: 'Completed', days: -4, empIdx: 5,
        notes: 'Comment replies, DM triage, monthly report.',
        services: [
          { type: 'Carousel Post', name: 'Weekly carousels',              qty: 12, price: 2400, status: 'Completed', deposit: 0 }
        ]
      },
      {
        client: 'Nova Apparel',
        category: 'Influencer Campaigns',
        name: 'SS26 collection launch',
        status: 'Deposit', days: 32, empIdx: 0,
        notes: '8 creators, TikTok + Reels seeding.',
        services: [
          { type: 'Reel',          name: 'Creator-produced reels',        qty: 8, price: 6400, status: 'Deposit',   deposit: 2000 },
          { type: 'Ad Creative',   name: 'Paid whitelisting creatives',   qty: 6, price: 1800, status: 'Pending',   deposit: 0 },
          { type: 'Script',        name: 'Creator briefs + scripts',      qty: 8, price:  800, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'Nova Apparel',
        category: 'Paid Ads',
        name: 'Meta Ads — retargeting flight',
        status: 'Pending', days: 45, empIdx: 4,
        notes: 'Awaiting approval on budget.',
        services: [
          { type: 'Ad Creative',   name: 'Retargeting ad creative pack',  qty: 12, price: 2400, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'CloudStack SaaS',
        category: 'Video Production',
        name: 'Founder-led LinkedIn series',
        status: 'Deposit', days: 21, empIdx: 1,
        notes: '6-episode talking-head series.',
        services: [
          { type: 'Long Video',    name: 'LinkedIn video episodes',       qty: 6, price: 5400, status: 'Deposit',   deposit: 1800 },
          { type: 'Short',         name: 'Episode cutdown shorts',        qty: 12, price: 1800, status: 'Pending',  deposit: 0 },
          { type: 'Thumbnail',     name: 'Episode cover images',          qty: 6, price:  600, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'CloudStack SaaS',
        category: 'Brand Strategy',
        name: 'Tone of voice + content pillars',
        status: 'Completed', days: -30, empIdx: 3,
        notes: 'Strategy doc delivered, now executing.',
        services: [
          { type: 'Script',        name: 'Brand voice + pillars doc',     qty: 1, price: 2200, status: 'Completed', deposit: 0 }
        ]
      },
      {
        client: 'Saffron Bistro',
        category: 'Content Creation',
        name: 'Second-location launch campaign',
        status: 'Deposit', days: 14, empIdx: 2,
        notes: 'Pre-opening buzz + opening week.',
        services: [
          { type: 'Reel',          name: 'Pre-opening teaser reels',      qty: 6, price: 2400, status: 'Deposit',   deposit: 1000 },
          { type: 'Carousel Post', name: 'Menu highlight carousels',      qty: 4, price:  800, status: 'Pending',   deposit: 0 },
          { type: 'Design',        name: 'Opening-week poster set',       qty: 1, price:  600, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'Orbit E-Commerce',
        category: 'Paid Ads',
        name: 'Q2 performance creative sprint',
        status: 'Completed', days: -7, empIdx: 4,
        notes: 'Delivered 24 creatives, ready for testing.',
        services: [
          { type: 'Ad Creative',   name: 'Static ad creatives',           qty: 16, price: 3200, status: 'Completed', deposit: 0 },
          { type: 'Motion Graphics', name: 'Animated product ads',        qty: 8,  price: 3200, status: 'Completed', deposit: 0 }
        ]
      },
      {
        client: 'Orbit E-Commerce',
        category: 'Content Creation',
        name: 'UGC-style monthly content',
        status: 'Deposit', days: 10, empIdx: 1,
        notes: 'UGC creators + in-house edits.',
        services: [
          { type: 'Reel',          name: 'UGC-style reels',               qty: 12, price: 4800, status: 'Deposit',   deposit: 2000 },
          { type: 'Voiceover',     name: 'Reel voiceovers',               qty: 12, price:  600, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'BrightSmile Dental',
        category: 'Content Creation',
        name: 'Testimonial & case-study reels',
        status: 'Pending', days: 28, empIdx: 1,
        notes: 'Awaiting patient consent forms.',
        services: [
          { type: 'Reel',          name: 'Before/after patient reels',    qty: 5, price: 2000, status: 'Pending',   deposit: 0 },
          { type: 'Script',        name: 'Testimonial scripts',           qty: 5, price:  400, status: 'Pending',   deposit: 0 }
        ]
      },
      {
        client: 'Trailhead Outdoors',
        category: 'Video Production',
        name: 'YouTube adventure series — Ep. 1–3',
        status: 'Completed', days: -18, empIdx: 1,
        notes: 'Uploaded, strong early retention.',
        services: [
          { type: 'Long Video',    name: 'Long-form YouTube episodes',    qty: 3, price: 7200, status: 'Completed', deposit: 0 },
          { type: 'Thumbnail',     name: 'YouTube thumbnails (A/B)',      qty: 6, price:  900, status: 'Completed', deposit: 0 },
          { type: 'Short',         name: 'Episode highlight shorts',      qty: 9, price: 1800, status: 'Completed', deposit: 0 }
        ]
      },
      {
        client: 'Trailhead Outdoors',
        category: 'Video Production',
        name: 'YouTube adventure series — Ep. 4–6',
        status: 'Deposit', days: 40, empIdx: 1,
        notes: 'Shooting next week in the mountains.',
        services: [
          { type: 'Long Video',    name: 'Long-form YouTube episodes',    qty: 3, price: 7200, status: 'Deposit',   deposit: 2400 },
          { type: 'Podcast',       name: 'Companion podcast episodes',    qty: 3, price: 1800, status: 'Pending',   deposit: 0 }
        ]
      }
    ];

    for (const p of projects) {
      const clientId = clientByName[p.client];
      if (!clientId) {
        console.warn(`[seed] skipping project "${p.name}" — client "${p.client}" not found`);
        continue;
      }
      const projectId = insertProject.run(
        p.name,
        clientId,
        catByName[p.category] ?? null,
        pickEmp(p.empIdx),
        p.status,
        addDays(p.days),
        p.notes ?? null
      ).lastInsertRowid;

      for (const s of p.services) {
        insertVideo.run(
          projectId,
          typeByName[s.type] ?? null,
          s.name,
          s.qty,
          s.price,
          s.status,
          s.deposit ?? 0,
          null
        );
      }
    }
  }
})();

console.log('Seed complete — social media marketing sample data loaded.');
