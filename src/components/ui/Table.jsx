export function Table({ headers, children, loading, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-border">
            {headers.map((h) => (
              <th key={h} className="text-left text-slate-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-border">
          {loading ? (
            <tr><td colSpan={headers.length} className="text-center py-12 text-slate-500">Loading...</td></tr>
          ) : !children || (Array.isArray(children) && children.length === 0) ? (
            <tr><td colSpan={headers.length} className="text-center py-12 text-slate-500">{empty || 'No data found.'}</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3.5 text-slate-300 ${className}`}>{children}</td>
}
