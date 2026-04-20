import db from '../db/database.js';

export const employeeRepository = {
  list() {
    return db.prepare('SELECT * FROM employees ORDER BY name').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  },

  create({ name, email = null, role = null }) {
    const info = db.prepare(
      'INSERT INTO employees (name, email, role) VALUES (?, ?, ?)'
    ).run(name, email, role);
    return this.findById(info.lastInsertRowid);
  },

  update(id, { name, email, role }) {
    db.prepare(
      'UPDATE employees SET name = ?, email = ?, role = ? WHERE id = ?'
    ).run(name, email ?? null, role ?? null, id);
    return this.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM employees WHERE id = ?').run(id).changes > 0;
  }
};
