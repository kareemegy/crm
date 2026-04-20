import { categoryRepository } from '../repositories/categoryRepository.js';
import { HttpError } from '../middleware/errorHandler.js';

export const categoryService = {
  list: () => categoryRepository.list(),

  create({ name }) {
    if (!name?.trim()) throw new HttpError(400, 'Category name is required');
    if (categoryRepository.findByName(name.trim())) {
      throw new HttpError(409, 'Category already exists');
    }
    return categoryRepository.create({ name: name.trim() });
  },

  update(id, { name }) {
    if (!name?.trim()) throw new HttpError(400, 'Category name is required');
    if (!categoryRepository.findById(id)) throw new HttpError(404, 'Category not found');
    return categoryRepository.update(id, { name: name.trim() });
  },

  remove(id) {
    if (!categoryRepository.remove(id)) throw new HttpError(404, 'Category not found');
  }
};
