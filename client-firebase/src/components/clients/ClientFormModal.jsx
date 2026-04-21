import Modal from '../ui/Modal.jsx';
import ClientForm from './ClientForm.jsx';

// Thin wrapper: modal chrome + ClientForm. Lets us reuse the form both inline
// (e.g. on Clients page edit) and as the global Add Client modal.
export default function ClientFormModal({ open, onClose, onSaved, initial = null }) {
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Client' : 'Add New Client'}>
      <ClientForm initial={initial} onSaved={onSaved} onCancel={onClose} />
    </Modal>
  );
}
