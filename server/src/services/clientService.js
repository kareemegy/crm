import { clientRepository } from '../repositories/clientRepository.js';
import { HttpError } from '../middleware/errorHandler.js';

export const clientService = {
  list: () => clientRepository.list(),

  get(id) {
    const c = clientRepository.findById(id);
    if (!c) throw new HttpError(404, 'Client not found');
    return c;
  },

  create(data) {
    validate(data);
    return clientRepository.create(data);
  },

  update(id, data) {
    validate(data);
    if (!clientRepository.findById(id)) throw new HttpError(404, 'Client not found');
    return clientRepository.update(id, data);
  },

  remove(id) {
    if (!clientRepository.remove(id)) throw new HttpError(404, 'Client not found');
  }
};

function validate(d) {
  if (!d?.name?.trim()) throw new HttpError(400, 'Client name is required');
}
