import { useMemo, useState } from 'react';
import { ExternalLink, Eye, FileText, Search, X } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';

function normalizeLinkedDoc(d) {
  return {
    ...d,
    documentNo: d.documentNo || '',
    documentTitle: d.documentTitle || d.title || '',
    procedureNo: d.procedureNo || d.parentProcedureNo || '',
    procedureTitle: d.procedureTitle || '',
    category: d.category || 'Uncategorized',
    documentType: d.documentType || d.kind || d.type || 'Document',
    documentUrl: d.documentUrl || d.url || d.link || '',
  };
}

export default function LinkedDocuments({ linkedDocuments = [], procedures = [] }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('All');

  const docs = useMemo(() => linkedDocuments.map(normalizeLinkedDoc), [linkedDocuments]);

  const kinds = useMemo(
    () => ['All', ...new Set(docs.map((d) => d.documentType).filter(Boolean))],
    [docs]
  );

  const parentMap = useMemo(
    () => Object.fromEntries(procedures.map((p) => [p.procedureNo, p])),
    [procedures]
  );

  const hasCriteria = query.trim() || kind !== 'All';

  const filtered = useMemo(() => {
    if (!hasCriteria) return [];

    const q = query.trim().toLowerCase();

    return docs.filter((d) => {
      const text = [
        d.documentNo,
        d.documentTitle,
        d.procedureNo,
        d.procedureTitle,
        d.category,
        d.documentType,
      ]
        .join(' ')
        .toLowerCase();

      return (!q || text.includes(q)) && (kind === 'All' || d.documentType === kind);
    });
  }, [docs, query, kind, hasCriteria]);

  function clearSearch() {
    setQuery('');
    setKind('All');
  }

  function openDocument(doc) {
    if (!doc.documentUrl) return;
    window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <PageHeader
        eyebrow="Appendix Mapping"
        title="Linked Documents"
        description="Search forms, checklists, registers, evidence logs, and appendices linked to procedures."
      />

      <section className="toolbar linked-doc-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search document no, title, procedure, or category..."
          />
          {query && (
            <button type="button" className="search-clear-btn" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          {kinds.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>

        {hasCriteria && (
          <button type="button" className="ghost-btn" onClick={clearSearch}>
            Clear
          </button>
        )}
      </section>

      {!hasCriteria && (
        <section className="search-empty compact-empty">
          <FileText size={26} />
          <h3>Search linked documents</h3>
          <p>Enter a keyword or select a document type to view matching linked documents.</p>
        </section>
      )}

      {hasCriteria && filtered.length === 0 && (
        <section className="search-empty compact-empty">
          <Search size={26} />
          <h3>No linked documents found</h3>
          <p>Try another document number, title, procedure, category, or type.</p>
        </section>
      )}

      {hasCriteria && filtered.length > 0 && (
        <section className="linked-doc-list">
          {filtered.map((d, index) => {
            const parent = parentMap[d.procedureNo];

            return (
              <article className="linked-doc-card-clean" key={`${d.documentNo}-${index}`}>
                <div className="linked-doc-left">
                  <div className="linked-doc-file-icon">
                    <FileText size={18} />
                  </div>

                  <div>
                    <div className="linked-doc-topline">
                      <span className="doc-code">{d.documentNo}</span>
                      <span className="file-pill">{d.documentType}</span>
                    </div>

                    <h3>{d.documentTitle || 'Untitled linked document'}</h3>

                    <p>
                      <strong>{d.procedureNo}</strong>
                      <span> · </span>
                      {d.procedureTitle || parent?.procedureTitle || 'Procedure not mapped'}
                    </p>

                    <em>{d.category}</em>
                  </div>
                </div>

                <button
                  type="button"
                  className="view-doc-btn"
                  onClick={() => openDocument(d)}
                  disabled={!d.documentUrl}
                >
                  <Eye size={14} />
                  View
                  <ExternalLink size={12} />
                </button>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}