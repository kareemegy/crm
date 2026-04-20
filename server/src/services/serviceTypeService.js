import { serviceTypeRepository } from '../repositories/serviceTypeRepository.js';
import { HttpError } from '../middleware/errorHandler.js';

export const serviceTypeService = {
  list: () => serviceTypeRepository.list(),

  create({ name }) {
    if (!name?.trim()) throw new HttpError(400, 'Service type name is required');
    if (serviceTypeRepository.findByName(name.trim())) {
      throw new HttpError(409, 'Service type already exists');
    }
    return serviceTypeRepository.create({ name: name.trim() });
  },

  update(id, { name }) {
    if (!name?.trim()) throw new HttpError(400, 'Service type name is required');
    if (!serviceTypeRepository.findById(id)) throw new HttpError(404, 'Service type not found');
    return serviceTypeRepository.update(id, { name: name.trim() });
  },

  remove(id) {
    if (!serviceTypeRepository.remove(id)) throw new HttpError(404, 'Service type not found');
  }
};
