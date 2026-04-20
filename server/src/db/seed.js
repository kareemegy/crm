import 'dotenv/config';
import db from './database.js';

const categories = ['Web Development', 'Mobile App', 'Branding', 'Consulting'];
const employees = [
  { name: 'Sara Ali',    email: 'sara@company.com',   role: 'Designer' },
  { name: 'Omar Hassan', email: 'omar@company.com',   role: 'Developer' },
  { name: 'Lina Saeed',  email: 'lina@company.com',   role: 'PM' }
];
const clients = [
  { name: 'Acme Co.',       email: 'hello@acme.com',       phone: '555-0100' },
  { name: 'Globex',         email: 'contact@globex.com',   phone: '555-0200' },
  { name: 'Initech',        email: 'support@initech.com',  phone: '555-0300' }
];

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
const insertEmployee = db.prepare('INSERT INTO employees (name, email, role) VALUES (?, ?, ?)');
const insertClient   = db.prepare('INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)');
const insertProject  = db.prepare(`
  INSERT INTO projects
    (name, client_id, category_id, assignee_id, price, deposit_paid, payment_status, delivery_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const anyEmployees = db.prepare('SELECT COUNT(*) AS c FROM employees').get().c > 0;
const anyClients   = db.prepare('SELECT COUNT(*) AS c FROM clients').get().c > 0;

db.transaction(() => {
  categories.forEach(c => insertCategory.run(c));
  if (!anyEmployees) employees.forEach(e => insertEmployee.run(e.name, e.email, e.role));

  if (!anyClients) {
    const clientIds = clients.map(c =>
      insertClient.run(c.name, c.email, c.phone).lastInsertRowid
    );
    const cats = db.prepare('SELECT id FROM categories').all();
    const emps = db.prepare('SELECT id FROM employees').all();

    // Seed a few projects across clients / statuses / months.
    const samples = [
      { name: 'Corporate website',    client: 0, price: 4500, deposit: 0,    status: 'Completed', days: -10 },
      { name: 'Mobile app v1',        client: 0, price: 8000, deposit: 3000, status: 'Deposit',   days: 20 },
      { name: 'Rebrand',              client: 1, price: 2500, deposit: 0,    status: 'Pending',   days: 40 },
      { name: 'Internal dashboard',   client: 2, price: 6000, deposit: 2000, status: 'Deposit',   days: 15 }
    ];
    for (const s of samples) {
      const delivery = new Date(); delivery.setDate(delivery.getDate() + s.days);
      insertProject.run(
        s.name,
        clientIds[s.client],
        cats[s.client % cats.length]?.id,
        emps[s.client % emps.length]?.id,
        s.price, s.deposit, s.status,
        delivery.toISOString().slice(0, 10)
      );
    }
  }
})();

console.log('Seed complete.');
