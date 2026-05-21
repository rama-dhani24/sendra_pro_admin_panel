// Format large numbers with commas: 1234567 → 1,234,567
export const fmtNumber = (n) => {
  if (!n && n !== 0) return '0'
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

// Format TZS: TZS 1,234,567
export const fmtTzs = (n) => `TZS ${fmtNumber(n)}`

// Format USDT: 1.2345 USDT
export const fmtUsdt = (n) => `${Number(n).toFixed(4)} USDT`

// Format date: 19 May 2026, 14:30
export const fmtDate = (ts) => {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Relative time: "2m ago", "3h ago"
export const timeAgo = (ts) => {
  if (!ts) return '—'
  const d    = ts?.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Truncate Firestore doc ID for display
export const shortId = (id) => id ? `#${id.substring(0, 8).toUpperCase()}` : '—'

// Currency flag map
export const FLAGS = {
  GBP: '🇬🇧', EUR: '🇪🇺', USD: '🇺🇸', USDT: '🔷', TZS: '🇹🇿',
}
