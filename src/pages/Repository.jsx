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
  UploadCloud,
  X,
} from 'lucide-react';
import { AccessContext } from '../components/Layout.jsx';

const standardDocumentTypes = ['Standard'];
const formDocumentTypes = ['Appendix', 'Form', 'Register', 'Checklist'];
const categoryTypes = ['Procedure', 'Form'];
const pillFilters = ['All', 'Procedure', 'Form'];

const emptyForm = {
  documentNo: '',
  documentTitle: '',
  documentType: 'Standard',
  category: 'Procedure',
  subCategory: '',
  owner: 'John',
  department: 'HSSE',
  documentUrl: '',
  fileName: '',
};

function getDocumentTypeOptions(category) {
  return category === 'Procedure' ? standardDocumentTypes : formDocumentTypes;
}

function getDocumentCategory(d) {
  if (d.category === 'Procedure' || d.category === 'Form') return d.category;
  return d.documentType === 'Standard' ? 'Procedure' : 'Form';
}

function normalizeDoc(d) {
  const documentType = d.documentType || 'Standard';
  const category = getDocumentCategory({ ...d, documentType });
  const validTypes = getDocumentTypeOptions(category);

  return {
    ...d,
    documentNo: d.documentNo || '',
    documentTitle: d.documentTitle || '',
    documentType: validTypes.includes(documentType) ? documentType : validTypes[0],
    category,
    subCategory: d.subCategory || 'General',
    owner: d.owner || 'HSSE Mgr Gen',
    department: d.department || 'HSSE',
    documentUrl: d.documentUrl || d.url || d.link || '',
    fileName: d.fileName || '',
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

  const subCategories = useMemo(
    () => [...new Set(normalizedDocs.map((d) => d.subCategory).filter(Boolean))].sort(),
    [normalizedDocs]
  );

  const subCategoryOptions = useMemo(
    () => ['Select sub category', ...subCategories],
    [subCategories]
  );

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();

    return normalizedDocs.filter((d) => {
      const haystack = [
        d.documentNo,
        d.documentTitle,
        d.category,
        d.subCategory,
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
      procedures: normalizedDocs.filter((d) => d.category === 'Procedure').length,
      forms: normalizedDocs.filter((d) => d.category === 'Form').length,
      types: new Set(normalizedDocs.map((d) => d.documentType).filter(Boolean)).size,
    }),
    [normalizedDocs]
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

    const nextCategory = getDocumentCategory(doc);
    const nextTypes = getDocumentTypeOptions(nextCategory);
    const nextDocumentType = nextTypes.includes(doc.documentType)
      ? doc.documentType
      : nextTypes[0];

    setMode('edit');
    setForm({
      ...doc,
      category: nextCategory,
      documentType: nextDocumentType,
    });
    setPaneOpen(true);
  }

  function updateForm(key, value) {
    setForm((prev) => {
      if (key === 'category') {
        const nextTypes = getDocumentTypeOptions(value);
        return {
          ...prev,
          category: value,
          documentType: nextTypes[0],
        };
      }

      return { ...prev, [key]: value };
    });
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      fileName: file.name,
      documentUrl: URL.createObjectURL(file),
    }));
  }

  function removeFile() {
    setForm((prev) => ({
      ...prev,
      fileName: '',
      documentUrl: '',
    }));
  }

  function submitForm(e) {
    e.preventDefault();

    if (!setDocs || !canManage) {
      showToast('You do not have permission to manage documents');
      return;
    }

    const finalDoc = {
      ...form,
      subCategory: form.subCategory || 'General',
      documentType: getDocumentTypeOptions(form.category).includes(form.documentType)
        ? form.documentType
        : getDocumentTypeOptions(form.category)[0],
    };

    if (mode === 'add') {
      setDocs((prev) => [{ ...finalDoc, id: `DOC-${Date.now()}` }, ...prev]);
      showToast('Document added');
    } else {
      setDocs((prev) =>
        prev.map((d) => (d.documentNo === form.documentNo ? { ...d, ...finalDoc } : d))
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
            <div><strong>{stats.total}</strong><span>Documents</span></div>
            <div><strong>{stats.procedures}</strong><span>Procedures</span></div>
            <div><strong>{stats.forms}</strong><span>Forms</span></div>
            <div><strong>{stats.types}</strong><span>Types</span></div>
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
            placeholder="Search document no, title, sub category, owner..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <label className="toolbar-select">
          <Tag size={15} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {pillFilters.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <span className="toolbar-count">
          {rows.length} of {normalizedDocs.length} records
        </span>
      </section>

      <div className="repo-pill-filters">
        {pillFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`repo-pill-filter ${category === filter ? 'repo-pill-filter-active' : ''}`}
            onClick={() => setCategory(filter)}
          >
            {filter === 'All' ? 'All' : filter === 'Procedure' ? 'Procedure' : 'Forms'}
          </button>
        ))}
      </div>

      <div className="repo-table-wide clean-repo-listing">
        {rows.map((d, index) => (
          <article
            className="clean-doc-card search-doc-card"
            key={`${d.documentNo}-${index}`}
          >
            <div className="clean-doc-main">
              <div className="clean-doc-icon">
                <FileText size={18} />
              </div>

              <div className="clean-doc-content">
                <div className="repo-title-line">
                  <h3>{d.documentTitle}</h3>

                  <span
                    className={`category-pill repo-title-category-pill ${d.category === 'Procedure'
                      ? 'category-pill-procedure'
                      : 'category-pill-form'
                      }`}
                  >
                    {d.category}
                  </span>
                </div>

                <div className="search-doc-tags-row">
                  <span className="doc-code">{d.documentNo}</span>
                  <span className="file-pill">{d.documentType}</span>
                </div>

                <div className="clean-doc-category">
                  {d.subCategory}
                </div>

                <div className="repo-doc-submeta">
                  <span>{d.owner}</span>
                  <span>•</span>
                  <span>{d.department}</span>
                </div>
              </div>
            </div>

            <div className="repo-doc-actions">
              <button
                type="button"
                className="view-doc-btn"
                onClick={() => setSelectedDoc(d)}
              >
                <Eye size={14} />
                View
              </button>

              {canManage && (
                <button
                  type="button"
                  className="view-doc-btn"
                  onClick={() => openEditPane(d)}
                >
                  <Edit3 size={14} />
                  Manage
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  className="view-doc-btn danger-btn-outline"
                  onClick={() => requestDelete(d)}
                >
                  <Trash2 size={14} />
                  Delete
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
              <Field label="Document No" value={form.documentNo} onChange={(v) => updateForm('documentNo', v)} required />
              <Field label="Document Title" value={form.documentTitle} onChange={(v) => updateForm('documentTitle', v)} required />

              <SelectField
                label="Category"
                value={form.category}
                onChange={(v) => updateForm('category', v)}
                options={categoryTypes}
                required
              />

              <SelectField
                label="Sub Category"
                value={form.subCategory || 'Select sub category'}
                onChange={(v) => updateForm('subCategory', v === 'Select sub category' ? '' : v)}
                options={subCategoryOptions}
              />

              <SelectField
                label="Document Type"
                value={form.documentType}
                onChange={(v) => updateForm('documentType', v)}
                options={getDocumentTypeOptions(form.category)}
                required
              />

              <Field label="Owner" value={form.owner} onChange={(v) => updateForm('owner', v)} />
              <Field label="Department" value={form.department} onChange={(v) => updateForm('department', v)} />

              <FileUploadField
                fileName={form.fileName}
                hasFile={Boolean(form.documentUrl)}
                onUpload={handleFileUpload}
                onRemove={removeFile}
              />

              <div className="filter-actions">
                <button type="button" className="filter-reset-btn" onClick={() => setPaneOpen(false)}>
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
              <Detail label="Category" value={selectedDoc.category} />
              <Detail label="Sub Category" value={selectedDoc.subCategory} />
              <Detail label="Document Type" value={selectedDoc.documentType} />
              <Detail label="Owner" value={selectedDoc.owner} />
              <Detail label="Department" value={selectedDoc.department} />
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
              This will hide <strong>{deleteDoc.documentNo}</strong> from the repository.
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

function SelectField({ label, value, onChange, options = [], required }) {
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
            {option === 'Form' && label === 'Category' ? 'Forms' : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FileUploadField({ fileName, hasFile, onUpload, onRemove }) {
  return (
    <div className="filter-field">
      <span>Upload File</span>

      <label className={`mock-upload-box ${hasFile ? 'mock-upload-box-active' : ''}`}>
        <input type="file" onChange={onUpload} />
        <UploadCloud size={22} />
        <strong>{fileName || 'Choose document file'}</strong>
        <small>{fileName ? 'File selected for this document' : 'PDF, DOCX, XLSX or image file'}</small>
      </label>

      {hasFile && (
        <button type="button" className="remove-upload-btn" onClick={onRemove}>
          Remove selected file
        </button>
      )}
    </div>
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