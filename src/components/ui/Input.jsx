export function Input({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-slate-400 text-xs font-medium">{label}</label>}
      <input
        className="w-full bg-navy-card border border-navy-border rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition"
        {...props}
      />
    </div>
  )
}
