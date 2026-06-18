import { X } from 'lucide-react';

export default function DocumentModal({ doc, mode = 'view', categories, onClose, onSave }) {
  const editable = mode !== 'view';
  const data = doc || { category: categories[0] || '', procedureNo: '', procedureTitle: '', totalLinkedDocs: 0, forms: 0, checklists: 0, registers: 0, appendices: 0, owner: '', department: '', type: '', linkedDocuments: '' };
  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = Object.fromEntries(form.entries());
    ['totalLinkedDocs','forms','checklists','registers','appendices'].forEach(k => next[k] = Number(next[k] || 0));
    onSave({ ...data, ...next, id: data.id || `DOC-${Date.now()}` });
  }
  return <div className="modal-overlay"><div className="modal-panel"><div className="modal-header"><div><div className="modal-eyebrow">{mode === 'add' ? 'New Procedure' : mode === 'edit' ? 'Edit Procedure' : 'Procedure Details'}</div><h2>{data.procedureNo || 'New Record'}</h2></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
    <form className="modal-body" onSubmit={submit}>
      <div className="form-grid">
        <label>Procedure No.<input name="procedureNo" defaultValue={data.procedureNo} disabled={!editable} required /></label>
        <label>Category<select name="category" defaultValue={data.category} disabled={!editable}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="field-full">Procedure Title<input name="procedureTitle" defaultValue={data.procedureTitle} disabled={!editable} required /></label>
        <label>Total Linked Docs<input name="totalLinkedDocs" type="number" defaultValue={data.totalLinkedDocs} disabled={!editable}/></label>
        <label>Forms<input name="forms" type="number" defaultValue={data.forms} disabled={!editable}/></label>
        <label>Checklists<input name="checklists" type="number" defaultValue={data.checklists} disabled={!editable}/></label>
        <label>Registers<input name="registers" type="number" defaultValue={data.registers} disabled={!editable}/></label>
        <label>Appendices<input name="appendices" type="number" defaultValue={data.appendices} disabled={!editable}/></label>
        <label>Owner<input name="owner" defaultValue={data.owner} disabled={!editable}/></label>
        <label>Department<input name="department" defaultValue={data.department} disabled={!editable}/></label>
        <label>Type<input name="type" defaultValue={data.type} disabled={!editable}/></label>
        <label className="field-full">Linked Documents<textarea name="linkedDocuments" defaultValue={data.linkedDocuments} disabled={!editable} rows="5" /></label>
      </div>
      <div className="modal-footer"><button type="button" className="secondary-btn" onClick={onClose}>Close</button>{editable && <button className="primary-btn">Save Record</button>}</div>
    </form>
  </div></div>;
}
