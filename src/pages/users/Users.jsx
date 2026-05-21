import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useCollection } from '../../hooks/useCollection'
import { Table, Td } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { fmtTzs, fmtDate, shortId } from '../../lib/utils'
import { Search, UserX, UserCheck, Eye } from 'lucide-react'

// ── Helper: read balance regardless of field name used in Firestore ────────
const getBalance = (u) =>
  u.balance_tzs ?? u.balanceTzs ?? u.balance ?? 0

const getBalanceUsdt = (u) =>
  u.balance_usdt ?? u.balanceUsdt ?? 0

export default function Users() {
  const { docs: users, loading } = useCollection('users', {
    orderField: 'createdAt', orderDir: 'desc', limitCount: 200,
  })
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = users.filter((u) =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.accNumber?.includes(search)
  )

  const toggleSuspend = async (user) => {
    await updateDoc(doc(db, 'users', user.id), { suspended: !user.suspended })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Users</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} registered accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or Sendra ID..."
          className="w-full bg-navy-card border border-navy-border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
        <Table
          headers={['User', 'Sendra ID', 'Phone', 'Balance TZS', 'Balance USDT', 'Joined', 'Status', 'Actions']}
          loading={loading}
          empty="No users found."
        >
          {filtered.map((u) => {
            const balTzs  = getBalance(u)
            const balUsdt = getBalanceUsdt(u)
            return (
              <tr key={u.id} className="hover:bg-white/2 transition">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                      {u.fullName?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{u.fullName}</p>
                      <p className="text-slate-500 text-xs">{u.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </Td>
                <Td><span className="text-gold font-mono font-bold">{u.accNumber}</span></Td>
                <Td>{u.phone}</Td>
                <Td>
                  <span className={`font-semibold ${balTzs > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {fmtTzs(balTzs)}
                  </span>
                </Td>
                <Td>
                  <span className={`text-sm ${balUsdt > 0 ? 'text-gold' : 'text-slate-500'}`}>
                    {balUsdt > 0 ? `${Number(balUsdt).toFixed(4)} USDT` : '—'}
                  </span>
                </Td>
                <Td><span className="text-xs">{fmtDate(u.createdAt)}</span></Td>
                <Td>
                  <Badge color={u.suspended ? 'red' : 'green'}>
                    {u.suspended ? 'Suspended' : 'Active'}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => toggleSuspend(u)}
                      className={`p-1.5 rounded-lg transition ${
                        u.suspended
                          ? 'text-green-400 hover:bg-green-500/10'
                          : 'text-red-400 hover:bg-red-500/10'
                      }`}
                      title={u.suspended ? 'Unsuspend' : 'Suspend'}
                    >
                      {u.suspended ? <UserCheck size={14} /> : <UserX size={14} />}
                    </button>
                  </div>
                </Td>
              </tr>
            )
          })}
        </Table>
      </div>

      {/* User detail modal */}
      {selected && (() => {
        const balTzs  = getBalance(selected)
        const balUsdt = getBalanceUsdt(selected)
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-navy-card border border-navy-border rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">User Details</h2>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-navy-border">
                <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center text-gold text-xl font-bold">
                  {selected.fullName?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{selected.fullName}</p>
                  <p className="text-gold font-mono font-semibold">ID: {selected.accNumber}</p>
                </div>
              </div>

              <div className="space-y-0">
                {[
                  ['Phone',         selected.phone],
                  ['Balance TZS',   fmtTzs(balTzs)],
                  ['Balance USDT',  `${Number(balUsdt).toFixed(4)} USDT`],
                  ['Firebase UID',  selected.id],
                  ['Joined',        fmtDate(selected.createdAt)],
                  ['Status',        selected.suspended ? '🔴 Suspended' : '🟢 Active'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-navy-border last:border-0">
                    <span className="text-slate-400 text-sm">{k}</span>
                    <span className={`text-sm font-medium ${
                      k === 'Balance TZS' && balTzs > 0 ? 'text-green-400' :
                      k === 'Balance USDT' && balUsdt > 0 ? 'text-gold' :
                      'text-white'
                    }`}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { toggleSuspend(selected); setSelected(null) }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                    selected.suspended
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                  }`}
                >
                  {selected.suspended ? 'Unsuspend Account' : 'Suspend Account'}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}