export function Badge({ children, color = 'green' }) {
  const colors = {
    green:  'bg-green-500/10 text-green-400 border-green-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
    gold:   'bg-gold/10 text-gold border-gold/20',
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    gray:   'bg-white/5 text-slate-400 border-white/10',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${colors[color] || colors.green}`}>
      {children}
    </span>
  )
}
