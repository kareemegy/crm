import { employeeRepository } from '../repositories/employeeRepository.js';
import { HttpError } from '../middleware/errorHandler.js';

export const employeeService = {
  list: () => employeeRepository.list(),

  create(data) {
    if (!data?.name?.trim()) throw new HttpError(400, 'Employee name is required');
    return employeeRepository.create({ ...data, name: data.name.trim() });
  },

  update(id, data) {
    if (!data?.name?.trim()) throw new HttpError(400, 'Employee name is required');
    if (!employeeRepository.findById(id)) throw new HttpError(404, 'Employee not found');
    return employeeRepository.update(id, { ...data, name: data.name.trim() });
  },

  remove(id) {
    if (!employeeRepository.remove(id)) throw new HttpError(404, 'Employee not found');
  }
};
