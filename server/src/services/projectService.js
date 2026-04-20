import { projectRepository } from '../repositories/projectRepository.js';
import { HttpError } from '../middleware/errorHandler.js';

const VALID_STATUSES = ['Completed', 'Deposit', 'Pending'];

export const projectService = {
  list:         ()           => projectRepository.list(),
  filter:       (q)          => projectRepository.filter(q),
  listByClient: (clientId)   => projectRepository.listByClient(clientId),

  get(id) {
    const p = projectRepository.findById(id);
    if (!p) throw new HttpError(404, 'Project not found');
    return p;
  },

  create(data) {
    validate(data);
    return projectRepository.create(data);
  },

  update(id, data) {
    validate(data);
    if (!projectRepository.findById(id)) throw new HttpError(404, 'Project not found');
    return projectRepository.update(id, data);
  },

  remove(id) {
    if (!projectRepository.remove(id)) throw new HttpError(404, 'Project not found');
  }
};

function validate(d) {
  if (!d?.name?.trim()) throw new HttpError(400, 'Project name is required');
  if (!d?.client_id)    throw new HttpError(400, 'Client is required');
  if (!VALID_STATUSES.includes(d.payment_status)) {
    throw new HttpError(400, `payment_status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (Number(d.deposit_paid ?? 0) < 0) throw new HttpError(400, 'deposit_paid cannot be negative');
}
