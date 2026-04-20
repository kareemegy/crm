import db from '../db/database.js';

export const serviceTypeRepository = {
  list() {
    return db.prepare('SELECT * FROM service_types ORDER BY name').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM service_types WHERE id = ?').get(id);
  },

  findByName(name) {
    return db.prepare('SELECT * FROM service_types WHERE name = ?').get(name);
  },

  create({ name }) {
    const info = db.prepare('INSERT INTO service_types (name) VALUES (?)').run(name);
    return this.findById(info.lastInsertRowid);
  },

  update(id, { name }) {
    db.prepare('UPDATE service_types SET name = ? WHERE id = ?').run(name, id);
    return this.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM service_types WHERE id = ?').run(id).changes > 0;
  }
};
