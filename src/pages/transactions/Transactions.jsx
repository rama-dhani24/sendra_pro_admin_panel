import { useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { Table, Td } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { fmtTzs, fmtUsdt, fmtDate, shortId, FLAGS } from '../../lib/utils'
import { Search, Download } from 'lucide-react'

export default function Transactions() {
  const { docs: txs, loading } = useCollection('transactions', {
    orderField: 'createdAt', orderDir: 'desc', limitCount: 200,
  })
  const [search,   setSearch]   = useState('')
  const [currency, setCurrency] = useState('ALL')
  const [selected, setSelected] = useState(null)

  const filtered = txs.filter((t) => {
    const matchSearch = !search ||
      t.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      t.receiverName?.toLowerCase().includes(search.toLowerCase()) ||
      t.senderAccNumber?.includes(search) ||
      t.receiverAccNumber?.includes(search) ||
      t.id.includes(search.toLowerCase())
    const matchCur = currency === 'ALL' || t.sentCurrency === currency
    return matchSearch && matchCur
  })

  // Export CSV
  const exportCSV = () => {
    const headers = ['ID','Sender','Receiver','Currency','Sent Amount','TZS Amount','Fee','Received TZS','Rate','Date']
    const rows    = filtered.map(t => [
      t.id, t.senderName, t.receiverName, t.sentCurrency,
      t.sentAmount, t.amountTzs, t.feeTzs, t.receivedTzs,
      t.usdtToTzsRate, fmtDate(t.createdAt),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `sendra-transactions-${Date.now()}.csv`; a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">{txs.length} total transactions</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, Sendra ID, or transaction ID..."
            className="w-full bg-navy-card border border-navy-border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 transition"
          />
        </div>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-navy-card border border-navy-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition"
        >
          {['ALL','GBP','EUR','USD','USDT'].map(c => (
            <option key={c} value={c}>{c === 'ALL' ? 'All Currencies' : `${FLAGS[c]} ${c}`}</option>
          ))}
        </select>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Total Volume',   value: fmtTzs(filtered.reduce((s,t) => s+(t.amountTzs||0),0)),  color: 'text-green-400' },
          { label: 'Total Fees',     value: fmtTzs(filtered.reduce((s,t) => s+(t.feeTzs||0),0)),     color: 'text-gold'      },
          { label: 'Showing',        value: `${filtered.length} txs`,                                color: 'text-blue-400'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-navy-card border border-navy-border rounded-xl px-4 py-2">
            <span className="text-slate-400 text-xs">{label}: </span>
            <span className={`text-sm font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
        <Table
          headers={['ID','From → To','Amount Sent','Received (TZS)','Fee','Rate','Date','Status']}
          loading={loading}
          empty="No transactions found."
        >
          {filtered.map((tx) => (
            <tr key={tx.id} className="hover:bg-white/2 cursor-pointer transition" onClick={() => setSelected(tx)}>
              <Td><span className="font-mono text-xs text-slate-400">{shortId(tx.id)}</span></Td>
              <Td>
                <div>
                  <p className="text-white text-sm font-medium">{tx.senderName}</p>
                  <p className="text-slate-500 text-xs">→ {tx.receiverName}</p>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  <span>{FLAGS[tx.sentCurrency] || ''}</span>
                  <span className="text-white font-semibold text-sm">{tx.sentAmount?.toFixed(2)} {tx.sentCurrency}</span>
                </div>
              </Td>
              <Td><span className="text-green-400 font-bold text-sm">{fmtTzs(tx.receivedTzs)}</span></Td>
              <Td><span className="text-red-400 text-sm">-{fmtTzs(tx.feeTzs)}</span></Td>
              <Td><span className="text-slate-400 text-xs">1 USDT = TZS {(tx.usdtToTzsRate||0).toLocaleString()}</span></Td>
              <Td><span className="text-xs">{fmtDate(tx.createdAt)}</span></Td>
              <Td><Badge color="green">{tx.status || 'completed'}</Badge></Td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-card border border-navy-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Transaction Detail</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-0">
              {[
                ['Transaction ID', selected.id],
                ['From',          `${selected.senderName} (ID: ${selected.senderAccNumber})`],
                ['To',            `${selected.receiverName} (ID: ${selected.receiverAccNumber})`],
                ['Sent',          `${selected.sentAmount?.toFixed(4)} ${selected.sentCurrency}`],
                ['USDT Amount',   `${selected.usdtAmount?.toFixed(4)} USDT`],
                ['TZS Amount',    fmtTzs(selected.amountTzs)],
                ['Fee (1%)',       fmtTzs(selected.feeTzs)],
                ['Total Debited', fmtTzs(selected.totalDebitedTzs)],
                ['Recipient Got', fmtTzs(selected.receivedTzs)],
                ['Rate Used',     `1 USDT = TZS ${(selected.usdtToTzsRate||0).toLocaleString()}`],
                ['Rate Source',   selected.rateSrc || '—'],
                ['Status',        selected.status || 'completed'],
                ['Date',          fmtDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-navy-border last:border-0">
                  <span className="text-slate-400 text-sm">{k}</span>
                  <span className="text-white text-sm font-medium text-right max-w-xs truncate">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)}
              className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
