import { useMemo, useState } from 'react';
import {
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const DEFAULT_DOCUMENT_URL = '';

function CategorySwatch({ category }) {
  const colors = ['#D98E04', '#3D6B8C', '#B5483D', '#7A5C9E', '#3F7A5C', '#5B6B82'];
  let hash = 0;

  for (let i = 0; i < String(category || '').length; i += 1) {
    hash += String(category || '').charCodeAt(i);
  }

  return <span className="cat-dot" style={{ background: colors[hash % colors.length] }} />;
}

function normalizeDoc(d) {
  return {
    ...d,
    documentNo: d.documentNo || '',
    documentTitle: d.documentTitle || '',
    procedureNo: d.procedureNo || '',
    procedureTitle: d.procedureTitle || '',
    category: d.category || 'Uncategorized',
    documentType: d.documentType || d.type || 'Document',
    department: d.department || 'HSSE',
    owner: d.owner || 'HSSE Mgr Gen',
    documentUrl:
      d.documentUrl ||
      d.fileUrl ||
      d.filePath ||
      d.path ||
      d.url ||
      d.link ||
      DEFAULT_DOCUMENT_URL,
  };
}

export default function SearchPage({ docs = [], stats = {} }) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [filters, setFilters] = useState({
    procedureNo: '',
    procedureTitle: '',
    category: 'All',
    documentType: 'All',
  });

  const normalizedDocs = useMemo(() => docs.map(normalizeDoc), [docs]);

  const categories = useMemo(
    () => ['All', ...new Set(normalizedDocs.map((d) => d.category).filter(Boolean))],
    [normalizedDocs]
  );

  const documentTypes = useMemo(
    () => ['All', ...new Set(normalizedDocs.map((d) => d.documentType).filter(Boolean))],
    [normalizedDocs]
  );

  const hasCriteria = useMemo(() => {
    return (
      query.trim() ||
      filters.procedureNo.trim() ||
      filters.procedureTitle.trim() ||
      filters.category !== 'All' ||
      filters.documentType !== 'All'
    );
  }, [query, filters]);

  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (filters.procedureNo.trim()) count += 1;
    if (filters.procedureTitle.trim()) count += 1;
    if (filters.category !== 'All') count += 1;
    if (filters.documentType !== 'All') count += 1;
    return count;
  }, [filters]);

  const computedStats = useMemo(
    () => ({
      total: stats.total || normalizedDocs.length,
      categories: stats.categories || categories.length - 1,
      procedures:
        stats.procedures ||
        new Set(normalizedDocs.map((d) => d.procedureNo).filter(Boolean)).size,
    }),
    [stats, normalizedDocs, categories]
  );

  const results = useMemo(() => {
    if (!searched || !hasCriteria) return [];

    const q = query.trim().toLowerCase();
    const procedureNo = filters.procedureNo.trim().toLowerCase();
    const procedureTitle = filters.procedureTitle.trim().toLowerCase();

    return normalizedDocs.filter((d) => {
      const docNo = String(d.documentNo).toLowerCase();
      const docTitle = String(d.documentTitle).toLowerCase();
      const procNo = String(d.procedureNo).toLowerCase();
      const procTitle = String(d.procedureTitle).toLowerCase();
      const category = String(d.category).toLowerCase();
      const documentType = String(d.documentType).toLowerCase();

      return (
        (!q || docNo.includes(q) || docTitle.includes(q)) &&
        (!procedureNo || procNo.includes(procedureNo)) &&
        (!procedureTitle || procTitle.includes(procedureTitle)) &&
        (filters.category === 'All' || category === filters.category.toLowerCase()) &&
        (filters.documentType === 'All' ||
          documentType === filters.documentType.toLowerCase())
      );
    });
  }, [normalizedDocs, query, filters, searched, hasCriteria]);

  function runSearch(e) {
    e.preventDefault();
    setSearched(true);
  }

  function clearSearch() {
    setQuery('');
    setFilters({
      procedureNo: '',
      procedureTitle: '',
      category: 'All',
      documentType: 'All',
    });
    setSearched(false);
    setAdvancedOpen(false);
  }

  function applyAdvancedSearch(e) {
    e.preventDefault();
    setSearched(true);
    setAdvancedOpen(false);
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function openDocument(doc) {
    if (!doc.documentUrl) return;
    window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="view search-view">
      <header className="search-hero compact-search-hero">
        <div className="ledger-lines" />

        <div className="hero-content-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">Document Registry · Lookup</span>
            <h1 className="hero-title">Find controlled documents faster.</h1>
            <p className="hero-sub">
              Search by document number or title. Use advanced search for procedure, category, and type.
            </p>
          </div>

          <div className="hero-stats compact-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{computedStats.total}</span>
              <span className="hero-stat-label">Documents</span>
            </div>
            <div className="hero-stat-sep" />
            {/* <div className="hero-stat">
              <span className="hero-stat-num">{computedStats.procedures}</span>
              <span className="hero-stat-label">Procedures</span>
            </div> */}
            {/* <div className="hero-stat-sep" /> */}
            <div className="hero-stat">
              <span className="hero-stat-num">{computedStats.categories}</span>
              <span className="hero-stat-label">Categories</span>
            </div>
          </div>
        </div>

        <form className="search-bar compact-search-bar" onSubmit={runSearch}>
          <Search size={17} className="search-icon" />

          <input
            autoFocus
            placeholder="Search by document no or document title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && (
            <button type="button" className="search-clear-btn" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}

          <button
            type="button"
            className={`advanced-search-btn ${activeAdvancedCount ? 'advanced-search-btn-active' : ''
              }`}
            onClick={() => setAdvancedOpen(true)}
          >
            <SlidersHorizontal size={16} />
            <span>Advanced</span>
            {activeAdvancedCount > 0 && <strong>{activeAdvancedCount}</strong>}
          </button>

          <button type="submit" className="search-submit">
            Search
          </button>
        </form>
      </header>

      <section className="search-results-area">
        {(!searched || !hasCriteria) && (
          <div className="search-empty compact-empty">
            <ClipboardList size={26} />
            <h3>Start your search</h3>
            <p>Enter a document number/title or apply an advanced filter.</p>
          </div>
        )}

        {searched && hasCriteria && results.length === 0 && (
          <div className="search-empty compact-empty">
            <Search size={26} />
            <h3>No matching documents found</h3>
            <p>Try a shorter keyword or clear advanced filters.</p>
            <button className="empty-action-btn" type="button" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        {searched && hasCriteria && results.length > 0 && (
          <>
            <div className="results-meta">
              <span>
                Showing <strong>{results.length}</strong> matching document
                {results.length !== 1 ? 's' : ''}
              </span>
              <button type="button" onClick={clearSearch}>Clear</button>
            </div>

            <div className="results-list clean-results-list">
              {results.map((d, index) => (
                <article key={`${d.documentNo}-${index}`} className="clean-doc-card">
                  <div className="clean-doc-main">
                    <div className="clean-doc-icon">
                      <FileText size={18} />
                    </div>

                    <div className="clean-doc-content">
                      <div className="clean-doc-header">
                        <span className="doc-code">{d.documentNo}</span>
                        <span className="file-pill">{d.documentType}</span>
                      </div>

                      <h3>{d.documentTitle}</h3>

                      <div className="clean-doc-meta">
                        <span><Hash size={12} /> {d.procedureNo}</span>
                        <span>{d.procedureTitle}</span>
                      </div>

                      <div className="clean-doc-category">
                        <CategorySwatch category={d.category} />
                        {d.category}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-doc-btn"
                    onClick={() => openDocument(d)}
                    disabled={!d.documentUrl}
                  >
                    <Eye size={14} />
                    <span>View</span>
                    <ExternalLink size={12} />
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {advancedOpen && (
        <div className="filter-backdrop" onClick={() => setAdvancedOpen(false)}>
          <aside className="filter-pane" onClick={(e) => e.stopPropagation()}>
            <div className="filter-pane-header">
              <div>
                <span>Advanced Search</span>
                <h2>Filter documents</h2>
              </div>
              <button type="button" onClick={() => setAdvancedOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="filter-form" onSubmit={applyAdvancedSearch}>
              {/* <label className="filter-field">
                <span>Procedure No</span>
                <input
                  placeholder="Example: GEN-HSSE-B-101"
                  value={filters.procedureNo}
                  onChange={(e) => updateFilter('procedureNo', e.target.value)}
                />
              </label> */}

              {/* <label className="filter-field">
                <span>Procedure Title</span>
                <input
                  placeholder="Example: Access Control"
                  value={filters.procedureTitle}
                  onChange={(e) => updateFilter('procedureTitle', e.target.value)}
                />
              </label> */}

              <label className="filter-field">
                <span>Category</span>
                <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>

              <label className="filter-field">
                <span>Document Type</span>
                <select value={filters.documentType} onChange={(e) => updateFilter('documentType', e.target.value)}>
                  {documentTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>

              <div className="filter-actions">
                <button type="button" className="filter-reset-btn" onClick={clearSearch}>
                  Reset
                </button>
                <button type="submit" className="filter-apply-btn">
                  Apply Filters
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}