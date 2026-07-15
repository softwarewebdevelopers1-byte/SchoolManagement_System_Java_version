import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function DataTable({
  columns, data, searchKeys = [], filters = [], pageSize = 8, rowActions, onRowClick, title, toolbar,
}) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let out = data;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
    }
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (val && val !== 'All') out = out.filter((row) => String(row[key]) === val);
    });
    return out;
  }, [data, query, activeFilters, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card fade-in" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {title && <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>}
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{filtered.length} records</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {searchKeys.length > 0 && (
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                placeholder="Search…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                style={{ paddingLeft: 32, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 12px 9px 32px', fontSize: 13.5, color: 'var(--text)', width: 200 }}
              />
            </div>
          )}
          {filters.map((f) => (
            <select
              key={f.key}
              value={activeFilters[f.key] || 'All'}
              onChange={(e) => { setActiveFilters((s) => ({ ...s, [f.key]: e.target.value })); setPage(1); }}
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 10px', fontSize: 13.5, color: 'var(--text)' }}
            >
              <option>All</option>
              {f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          {toolbar}
        </div>
      </div>

      {pageData.length === 0 ? (
        <div style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Inbox size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No records match your search.</p>
        </div>
      ) : (
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                {rowActions && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => (
                <tr key={row.id || i} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                  {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
                  {rowActions && <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>{rowActions(row)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary btn-icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={15} /></button>
            <button className="btn btn-secondary btn-icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
