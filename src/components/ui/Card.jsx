export function Card({ children, className = '' }) {
  return (
    <div className={`bg-navy-card border border-navy-border rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, sub, color = 'gold', trend }) {
  const colors = {
    gold:  { bg: 'bg-gold/10',   text: 'text-gold',       border: 'border-gold/20'   },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    red:   { bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/20'   },
    blue:  { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/20'  },
  }
  const c = colors[color] || colors.gold
  return (
    <div className="bg-navy-card border border-navy-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={18} className={c.text} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs mt-3">{label}</p>
      <p className="text-white text-2xl font-bold mt-1 leading-none">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}
