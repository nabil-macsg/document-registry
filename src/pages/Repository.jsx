import { useContext, useMemo, useState } from 'react';
import {
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { AccessContext } from '../components/Layout.jsx';

const emptyForm = {
  documentNo: '',
  documentTitle: '',
  procedureNo: '',
  procedureTitle: '',
  documentType: '',
  category: '',
  owner: 'John',
  department: 'HSSE',
  documentUrl: '',
};

function normalizeDoc(d) {
  return {
    ...d,
    documentNo: d.documentNo || '',
    documentTitle: d.documentTitle || '',
    procedureNo: d.procedureNo || '',
    procedureTitle: d.procedureTitle || '',
    category: d.category || 'Uncategorized',
    documentType: d.documentType || d.type || 'Document',
    owner: d.owner || 'HSSE Mgr Gen',
    department: d.department || 'HSSE',
    documentUrl: d.documentUrl || d.url || d.link || '',
    isDeleted: d.isDeleted || false,
  };
}

export default function Repository({ docs = [], setDocs }) {
  const { role, permissions } = useContext(AccessContext);

  const canManage = permissions?.canManageRepository;
  const canDelete = permissions?.canDeleteDocuments;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [paneOpen, setPaneOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState('');

  const normalizedDocs = useMemo(
    () => docs.map(normalizeDoc).filter((d) => !d.isDeleted),
    [docs]
  );

  const documentTypes = [
    'Standard',
    'Appendix',
    'Form',
    'Register',
    'Checklist',
  ];

  const categories = useMemo(
    () => ['All', ...new Set(normalizedDocs.map((d) => d.category).filter(Boolean))],
    [normalizedDocs]
  );

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();

    return normalizedDocs.filter((d) => {
      const haystack = [
        d.documentNo,
        d.documentTitle,
        d.procedureNo,
        d.procedureTitle,
        d.category,
        d.owner,
        d.department,
        d.documentType,
      ]
        .join(' ')
        .toLowerCase();

      return (!q || haystack.includes(q)) && (category === 'All' || d.category === category);
    });
  }, [normalizedDocs, query, category]);

  const stats = useMemo(
    () => ({
      total: normalizedDocs.length,
      procedures: new Set(normalizedDocs.map((d) => d.procedureNo).filter(Boolean)).size,
      categories: categories.length - 1,
      types: new Set(normalizedDocs.map((d) => d.documentType).filter(Boolean)).size,
    }),
    [normalizedDocs, categories]
  );

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  }

  function openAddPane() {
    if (!canManage) {
      showToast(`${role} has view-only access`);
      return;
    }

    setMode('add');
    setForm(emptyForm);
    setPaneOpen(true);
  }

  function openEditPane(doc) {
    if (!canManage) {
      showToast(`${role} cannot manage documents`);
      return;
    }

    setMode('edit');
    setForm(doc);
    setPaneOpen(true);
  }

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submitForm(e) {
    e.preventDefault();

    if (!setDocs || !canManage) {
      showToast('You do not have permission to manage documents');
      return;
    }

    if (mode === 'add') {
      const newDoc = {
        ...form,
        id: `DOC-${Date.now()}`,
      };

      setDocs((prev) => [newDoc, ...prev]);
      showToast('Document added');
    } else {
      setDocs((prev) =>
        prev.map((d) => (d.documentNo === form.documentNo ? { ...d, ...form } : d))
      );
      showToast('Document updated');
    }

    setPaneOpen(false);
    setForm(emptyForm);
  }

  function confirmDelete() {
    if (!deleteDoc || !setDocs || !canDelete) {
      showToast('You do not have permission to delete documents');
      setDeleteDoc(null);
      return;
    }

    setDocs((prev) =>
      prev.map((d) => (d.documentNo === deleteDoc.documentNo ? { ...d, isDeleted: true } : d))
    );

    setDeleteDoc(null);
    showToast('Document deleted');
  }

  function requestDelete(doc) {
    if (!canDelete) {
      showToast(`${role} cannot delete documents`);
      return;
    }

    setDeleteDoc(doc);
  }

  function openDocument(doc) {
    if (!doc.documentUrl) return;
    window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="view repo-view repo-full-width">
      {toast && <div className="center-toast">{toast}</div>}

      <div className="view-header repo-header-clean">
        <div>
          <span className="view-eyebrow">Repository</span>
          <h1 className="view-title">Controlled document repository</h1>
          <p className="view-desc">
            {canManage
              ? 'Browse, add, view, manage, and remove controlled HSSE document records.'
              : 'Browse and view controlled HSSE document records.'}
          </p>
        </div>

        <div className="repo-header-actions">
          <div className="repo-summary-strip">
            <div>
              <strong>{stats.total}</strong>
              <span>Documents</span>
            </div>
            {/* <div>
              <strong>{stats.procedures}</strong>
              <span>Procedures</span>
            </div> */}
            <div>
              <strong>{stats.categories}</strong>
              <span>Categories</span>
            </div>
            <div>
              <strong>{stats.types}</strong>
              <span>Types</span>
            </div>
          </div>

          {canManage && (
            <button type="button" className="primary-btn" onClick={openAddPane}>
              <Plus size={16} />
              Add Document
            </button>
          )}
        </div>
      </div>

      {!canManage && (
        <div className="permission-banner">
          <strong>{role}</strong>
          <span>View-only mode: add, manage, and delete actions are hidden.</span>
        </div>
      )}

      <section className="toolbar repo-toolbar-clean">
        <label className="toolbar-search">
          <Search size={16} />
          <input
            placeholder="Search document no, title, procedure, owner..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <label className="toolbar-select">
          <Tag size={15} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <span className="toolbar-count">
          {rows.length} of {normalizedDocs.length} records
        </span>
      </section>

      <div className="repo-table-wide">
        {rows.map((d, index) => (
          <article className="repo-doc-row-clean" key={`${d.documentNo}-${index}`}>
            <div className="repo-doc-icon">
              <FileText size={18} />
            </div>

            <div className="repo-doc-main">
              <div className="repo-doc-top">
                <span className="doc-code">{d.documentNo}</span>
                <span className="file-pill">{d.documentType}</span>
              </div>

              <h3>{d.documentTitle}</h3>

              <div className="repo-doc-meta">
                <span>{d.procedureNo}</span>
                <span>·</span>
                <span>{d.procedureTitle}</span>
              </div>

              <div className="repo-doc-submeta">
                <span>{d.category}</span>
                <span>·</span>
                <span>{d.owner}</span>
                <span>·</span>
                <span>{d.department}</span>
              </div>
            </div>

            <div className="repo-doc-actions">
              <button type="button" className="icon-action-btn" onClick={() => setSelectedDoc(d)}>
                <Eye size={15} /> View
              </button>

              {canManage && (
                <button type="button" className="icon-action-btn" onClick={() => openEditPane(d)}>
                  <Edit3 size={15} /> Manage
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  className="icon-action-btn danger-action"
                  onClick={() => requestDelete(d)}
                >
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {paneOpen && canManage && (
        <div className="filter-backdrop" onClick={() => setPaneOpen(false)}>
          <aside className="filter-pane doc-form-pane" onClick={(e) => e.stopPropagation()}>
            <div className="filter-pane-header">
              <div>
                <span>{mode === 'add' ? 'Add Document' : 'Manage Document'}</span>
                <h2>{mode === 'add' ? 'New document record' : form.documentNo}</h2>
              </div>
              <button type="button" onClick={() => setPaneOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="filter-form" onSubmit={submitForm}>
              <Field
                label="Document No"
                value={form.documentNo}
                onChange={(v) => updateForm('documentNo', v)}
                required
              />
              <Field
                label="Document Title"
                value={form.documentTitle}
                onChange={(v) => updateForm('documentTitle', v)}
                required
              />
              {/* <Field
                label="Procedure No"
                value={form.procedureNo}
                onChange={(v) => updateForm('procedureNo', v)}
              />
              <Field
                label="Procedure Title"
                value={form.procedureTitle}
                onChange={(v) => updateForm('procedureTitle', v)}
              /> */}
              <Field
                label="Category"
                value={form.category}
                onChange={(v) => updateForm('category', v)}
              />
              <SelectField
                label="Document Type"
                value={form.documentType}
                onChange={(v) => updateForm('documentType', v)}
                options={documentTypes}
              />
              <Field label="Owner" value={form.owner} onChange={(v) => updateForm('owner', v)} />
              <Field
                label="Department"
                value={form.department}
                onChange={(v) => updateForm('department', v)}
              />
              <Field
                label="Document URL"
                value={form.documentUrl}
                onChange={(v) => updateForm('documentUrl', v)}
              />

              <div className="filter-actions">
                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={() => setPaneOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="filter-apply-btn">
                  {mode === 'add' ? 'Add Document' : 'Save Changes'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {selectedDoc && (
        <div className="modal-backdrop-clean" onClick={() => setSelectedDoc(null)}>
          <div className="repo-modal-clean" onClick={(e) => e.stopPropagation()}>
            <div className="repo-modal-header">
              <div>
                <span className="view-eyebrow">Document Details</span>
                <h2>{selectedDoc.documentTitle}</h2>
              </div>
              <button type="button" onClick={() => setSelectedDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="repo-detail-grid">
              <Detail label="Document No" value={selectedDoc.documentNo} />
              <Detail label="Document Type" value={selectedDoc.documentType} />
              <Detail label="Procedure No" value={selectedDoc.procedureNo} />
              <Detail label="Procedure Title" value={selectedDoc.procedureTitle} />
              <Detail label="Category" value={selectedDoc.category} />
              <Detail label="Owner" value={selectedDoc.owner} />
            </div>

            <div className="repo-modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setSelectedDoc(null)}>
                Close
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => openDocument(selectedDoc)}
                disabled={!selectedDoc.documentUrl}
              >
                <ExternalLink size={15} />
                Open document
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteDoc && canDelete && (
        <div className="modal-backdrop-clean" onClick={() => setDeleteDoc(null)}>
          <div className="repo-modal-clean small-modal-clean" onClick={(e) => e.stopPropagation()}>
            <div className="repo-modal-header">
              <div>
                <span className="view-eyebrow">Confirm Delete</span>
                <h2>Delete document?</h2>
              </div>
              <button type="button" onClick={() => setDeleteDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="repo-modal-note">
              This will hide <strong>{deleteDoc.documentNo}</strong> from the repository mockup.
            </p>

            <div className="repo-modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setDeleteDoc(null)}>
                Cancel
              </button>
              <button type="button" className="danger-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = [],
  required,
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>

      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select-clean"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div className="repo-detail-item">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}