import { videoRepository } from '../repositories/videoRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';
import { serviceTypeRepository } from '../repositories/serviceTypeRepository.js';
import { HttpError } from '../middleware/errorHandler.js';

const VALID_STATUSES = ['Completed', 'Deposit', 'Pending'];

export const videoService = {
  listByProject: (projectId) => {
    if (!projectRepository.findById(projectId)) throw new HttpError(404, 'Project not found');
    return videoRepository.listByProject(projectId);
  },

  create(data) {
    const clean = normalize(data);
    validate(clean);
    if (!projectRepository.findById(clean.project_id)) {
      throw new HttpError(400, 'Project not found');
    }
    if (clean.service_type_id && !serviceTypeRepository.findById(clean.service_type_id)) {
      throw new HttpError(400, 'Service type not found');
    }
    return videoRepository.create(clean);
  },

  update(id, data) {
    const clean = normalize(data, { requireProject: false });
    validate(clean, { requireProject: false });
    if (!videoRepository.findById(id)) throw new HttpError(404, 'Video not found');
    if (clean.service_type_id && !serviceTypeRepository.findById(clean.service_type_id)) {
      throw new HttpError(400, 'Service type not found');
    }
    return videoRepository.update(id, clean);
  },

  remove(id) {
    if (!videoRepository.remove(id)) throw new HttpError(404, 'Video not found');
  }
};

function normalize(d, { requireProject = true } = {}) {
  const status = d.payment_status ?? 'Pending';
  return {
    project_id:      d.project_id,
    service_type_id: d.service_type_id ? Number(d.service_type_id) : null,
    name:            d.name,
    quantity:        d.quantity,
    price:           d.price,
    payment_status:  status,
    deposit_paid:    status === 'Deposit' ? Number(d.deposit_paid ?? 0) : 0,
    notes:           d.notes
  };
}

function validate(d, { requireProject = true } = {}) {
  if (requireProject && !d?.project_id) throw new HttpError(400, 'project_id is required');
  if (!d?.name?.trim())                 throw new HttpError(400, 'Service name is required');
  if (Number(d.price ?? 0) < 0)         throw new HttpError(400, 'Price cannot be negative');

  const qty = Number(d.quantity ?? 1);
  if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
    throw new HttpError(400, 'Quantity must be a positive whole number');
  }

  if (!VALID_STATUSES.includes(d.payment_status)) {
    throw new HttpError(400, `payment_status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const deposit = Number(d.deposit_paid ?? 0);
  if (deposit < 0) throw new HttpError(400, 'deposit_paid cannot be negative');
  if (d.payment_status === 'Deposit' && deposit > Number(d.price ?? 0)) {
    throw new HttpError(400, 'deposit_paid cannot exceed the price');
  }
}
