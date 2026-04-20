import db from '../db/database.js';

export const categoryRepository = {
  list() {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  },

  findByName(name) {
    return db.prepare('SELECT * FROM categories WHERE name = ?').get(name);
  },

  create({ name }) {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    return this.findById(info.lastInsertRowid);
  },

  update(id, { name }) {
    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
    return this.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id).changes > 0;
  }
};
