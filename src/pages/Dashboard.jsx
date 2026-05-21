import { useCollection } from '../hooks/useCollection'
import { StatCard } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { fmtTzs, fmtDate, shortId, FLAGS } from '../lib/utils'
import {
  Users, ArrowLeftRight, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { format } from 'date-fns'

export default function Dashboard() {
  const { docs: users }        = useCollection('users',        { orderField: 'createdAt', limitCount: 200 })
  const { docs: transactions } = useCollection('transactions', { orderField: 'createdAt', orderDir: 'desc', limitCount: 100 })
  const { docs: rates }        = useCollection('config',       { limitCount: 5 })

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalUsers       = users.length
  const totalTxs         = transactions.length
  const totalVolumeTzs   = transactions.reduce((s, t) => s + (t.amountTzs || 0), 0)
  const totalFeeTzs      = transactions.reduce((s, t) => s + (t.feeTzs    || 0), 0)

  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const todayTxs   = transactions.filter(t => {
    const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date()
    return d >= todayStart
  })
  const todayVolume = todayTxs.reduce((s, t) => s + (t.amountTzs || 0), 0)

  // ── Chart data — volume by day (last 7 days) ─────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0)
    return d
  })
  const chartData = last7.map((day) => {
    const next = new Date(day); next.setDate(next.getDate() + 1)
    const vol  = transactions
      .filter(t => { const d = t.createdAt?.toDate?.() || new Date(); return d >= day && d < next })
      .reduce((s, t) => s + (t.amountTzs || 0), 0)
    return { day: format(day, 'EEE'), volume: Math.round(vol) }
  })

  // ── Currency breakdown ────────────────────────────────────────────────────
  const byGbp  = transactions.filter(t => t.sentCurrency === 'GBP').length
  const byEur  = transactions.filter(t => t.sentCurrency === 'EUR').length
  const byUsd  = transactions.filter(t => t.sentCurrency === 'USD').length
  const byUsdt = transactions.filter(t => t.sentCurrency === 'USDT').length

  const recent5 = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time overview of Sendra activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}          label="Total Users"        value={totalUsers.toLocaleString()}  color="gold"  />
        <StatCard icon={ArrowLeftRight} label="Total Transactions"  value={totalTxs.toLocaleString()}   color="blue"  />
        <StatCard icon={TrendingUp}     label="Total Volume"        value={fmtTzs(totalVolumeTzs)}      color="green" />
        <StatCard icon={DollarSign}     label="Total Fees Earned"   value={fmtTzs(totalFeeTzs)}         color="gold"  />
      </div>

      {/* Chart + breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume chart */}
        <div className="lg:col-span-2 bg-navy-card border border-navy-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold">Transaction Volume</p>
              <p className="text-slate-400 text-xs mt-0.5">Last 7 days (TZS)</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5">
              <p className="text-green-400 text-xs font-semibold">Today: {fmtTzs(todayVolume)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D4A843" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#243D55" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
              <Tooltip
                contentStyle={{ backgroundColor: '#152535', border: '1px solid #243D55', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94A3B8' }}
                formatter={(v) => [`TZS ${v.toLocaleString()}`, 'Volume']}
              />
              <Area type="monotone" dataKey="volume" stroke="#D4A843" strokeWidth={2} fill="url(#volGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Currency breakdown */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5">
          <p className="text-white font-semibold mb-1">Send Currency Mix</p>
          <p className="text-slate-400 text-xs mb-4">All-time by currency</p>
          <div className="space-y-3">
            {[
              { cur: 'GBP', count: byGbp  },
              { cur: 'EUR', count: byEur  },
              { cur: 'USD', count: byUsd  },
              { cur: 'USDT',count: byUsdt },
            ].map(({ cur, count }) => {
              const pct = totalTxs > 0 ? Math.round((count / totalTxs) * 100) : 0
              return (
                <div key={cur}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{FLAGS[cur]} {cur}</span>
                    <span className="text-slate-400">{count} txs · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-navy-border rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-navy-card border border-navy-border rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-border">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-gold" />
            <p className="text-white font-semibold">Recent Transactions</p>
          </div>
          <a href="/transactions" className="text-gold text-xs font-medium hover:underline">View all →</a>
        </div>
        <div className="divide-y divide-navy-border">
          {recent5.length === 0 && (
            <p className="text-center text-slate-500 py-10 text-sm">No transactions yet.</p>
          )}
          {recent5.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-base flex-shrink-0">
                {FLAGS[tx.sentCurrency] || '💰'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {tx.senderName} → {tx.receiverName}
                </p>
                <p className="text-slate-500 text-xs">{shortId(tx.id)} · {fmtDate(tx.createdAt)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-green-400 text-sm font-bold">{fmtTzs(tx.receivedTzs)}</p>
                <p className="text-slate-500 text-xs">{tx.sentAmount?.toFixed(2)} {tx.sentCurrency}</p>
              </div>
              <Badge color="green">Completed</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
