import { useCollection } from '../../hooks/useCollection'
import { fmtTzs, FLAGS } from '../../lib/utils'
import { format, subDays, startOfDay } from 'date-fns'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

const COLORS = ['#D4A843', '#22C55E', '#3B82F6', '#8B5CF6']

export default function Analytics() {
  const { docs: txs }   = useCollection('transactions', { orderField: 'createdAt', orderDir: 'desc', limitCount: 500 })
  const { docs: users } = useCollection('users',        { orderField: 'createdAt', limitCount: 500 })

  // ── Daily volume (30 days) ───────────────────────────────────────────────
  const last30 = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i))
  const dailyVolume = last30.map((day) => {
    const start = startOfDay(day)
    const end   = new Date(start); end.setDate(end.getDate() + 1)
    const vol   = txs.filter(t => {
      const d = t.createdAt?.toDate?.() || new Date()
      return d >= start && d < end
    }).reduce((s, t) => s + (t.amountTzs || 0), 0)
    return { day: format(day, 'MMM d'), volume: Math.round(vol) }
  })

  // ── Daily new users (30 days) ────────────────────────────────────────────
  const dailyUsers = last30.map((day) => {
    const start = startOfDay(day)
    const end   = new Date(start); end.setDate(end.getDate() + 1)
    const count = users.filter(u => {
      const d = u.createdAt?.toDate?.() || new Date()
      return d >= start && d < end
    }).length
    return { day: format(day, 'MMM d'), users: count }
  })

  // ── Currency breakdown (pie) ─────────────────────────────────────────────
  const currencies = ['GBP','EUR','USD','USDT']
  const pieData = currencies.map((c) => ({
    name: `${FLAGS[c]} ${c}`,
    value: txs.filter(t => t.sentCurrency === c).length,
  })).filter(d => d.value > 0)

  // ── Fee earned per day (last 14) ─────────────────────────────────────────
  const last14 = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i))
  const dailyFees = last14.map((day) => {
    const start = startOfDay(day)
    const end   = new Date(start); end.setDate(end.getDate() + 1)
    const fee   = txs.filter(t => {
      const d = t.createdAt?.toDate?.() || new Date()
      return d >= start && d < end
    }).reduce((s, t) => s + (t.feeTzs || 0), 0)
    return { day: format(day, 'MMM d'), fee: Math.round(fee) }
  })

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalVolume  = txs.reduce((s,t) => s+(t.amountTzs||0), 0)
  const totalFees    = txs.reduce((s,t) => s+(t.feeTzs||0), 0)
  const avgTxSize    = txs.length > 0 ? totalVolume / txs.length : 0
  const last30start  = subDays(new Date(), 30)
  const recentTxs    = txs.filter(t => (t.createdAt?.toDate?.() || new Date()) >= last30start)
  const recentVolume = recentTxs.reduce((s,t) => s+(t.amountTzs||0), 0)

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#152535', border: '1px solid #243D55', borderRadius: 12, fontSize: 11 },
    labelStyle: { color: '#94A3B8' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Performance metrics and growth trends</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'All-time Volume',    value: fmtTzs(totalVolume),        sub: `${txs.length} transactions`   },
          { label: 'All-time Fees',      value: fmtTzs(totalFees),          sub: '1% of each transaction'       },
          { label: 'Avg Transaction',    value: fmtTzs(avgTxSize),          sub: 'Per transfer'                 },
          { label: 'Volume (30 days)',   value: fmtTzs(recentVolume),       sub: `${recentTxs.length} txs`      },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-navy-card border border-navy-border rounded-2xl p-5">
            <p className="text-slate-400 text-xs">{label}</p>
            <p className="text-white text-xl font-bold mt-1 leading-tight">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* 30-day volume chart */}
      <div className="bg-navy-card border border-navy-border rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">Transaction Volume — Last 30 Days</h2>
        <p className="text-slate-500 text-xs mb-5">Daily TZS volume transferred</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyVolume}>
            <defs>
              <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D4A843" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#D4A843" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#243D55" vertical={false}/>
            <XAxis dataKey="day" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false}
              interval={4} />
            <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false}
              tickFormatter={v => v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}K`:v}/>
            <Tooltip {...tooltipStyle} formatter={v=>[`TZS ${v.toLocaleString()}`,'Volume']}/>
            <Area type="monotone" dataKey="volume" stroke="#D4A843" strokeWidth={2} fill="url(#vg)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New users */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">New Users — Last 30 Days</h2>
          <p className="text-slate-500 text-xs mb-5">Daily signups</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243D55" vertical={false}/>
              <XAxis dataKey="day" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} interval={4}/>
              <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false}/>
              <Tooltip {...tooltipStyle} formatter={v=>[v,'New Users']}/>
              <Bar dataKey="users" fill="#3B82F6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Currency pie */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Transaction Mix by Currency</h2>
          <p className="text-slate-500 text-xs mb-5">All-time breakdown</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v,n)=>[`${v} txs`,n]}/>
                <Legend wrapperStyle={{ fontSize:11, color:'#94A3B8' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Fee revenue chart */}
      <div className="bg-navy-card border border-navy-border rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">Fee Revenue — Last 14 Days</h2>
        <p className="text-slate-500 text-xs mb-5">Daily fee income (TZS)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyFees}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243D55" vertical={false}/>
            <XAxis dataKey="day" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false}
              tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v}/>
            <Tooltip {...tooltipStyle} formatter={v=>[`TZS ${v.toLocaleString()}`,'Fees']}/>
            <Bar dataKey="fee" fill="#22C55E" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
