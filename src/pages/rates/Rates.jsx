import { useState, useEffect } from 'react'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { fmtDate } from '../../lib/utils'
import { Save, RefreshCw, TrendingUp } from 'lucide-react'

export default function Rates() {
  const [rates,   setRates]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  // Local editable state
  const [usdtToTzs, setUsdtToTzs] = useState('')
  const [spread,    setSpread]    = useState('')
  const [feeRate,   setFeeRate]   = useState('')
  const [gbp,       setGbp]       = useState('')
  const [eur,       setEur]       = useState('')
  const [usd,       setUsd]       = useState('')

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'exchange_rates'), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      setRates(data)
      setUsdtToTzs(data.usdtToTzs || '')
      setSpread(((data.spread || 0.015) * 100).toFixed(2))
      setFeeRate(((data.feeRate || 0.01) * 100).toFixed(2))
      setGbp(data.fiat?.GBP || '')
      setEur(data.fiat?.EUR || '')
      setUsd(data.fiat?.USD || '')
    })
    return unsub
  }, [])

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      await updateDoc(doc(db, 'config', 'exchange_rates'), {
        usdtToTzs: parseFloat(usdtToTzs),
        spread:    parseFloat(spread) / 100,
        feeRate:   parseFloat(feeRate) / 100,
        'fiat.GBP': parseFloat(gbp),
        'fiat.EUR': parseFloat(eur),
        'fiat.USD': parseFloat(usd),
        updatedAt:  new Date(),
        updatedBy:  'admin',
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, value, onChange, unit, hint }) => (
    <div className="space-y-1.5">
      <label className="text-slate-400 text-xs font-medium">{label}</label>
      <div className="relative">
        <input
          type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-navy border border-navy-border rounded-xl px-4 py-3 pr-16 text-white text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-medium">{unit}</span>
      </div>
      {hint && <p className="text-slate-600 text-xs">{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Exchange Rates</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manually override rates · Cloud Function refreshes automatically every 30 min
        </p>
      </div>

      {/* Status banner */}
      {rates && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <div>
            <p className="text-green-400 text-sm font-semibold">Rates Live</p>
            <p className="text-slate-400 text-xs">
              Last updated: {fmtDate({ toDate: () => rates.updatedAt?.toDate?.() || new Date() })}
              {rates.updatedBy && ` · by ${rates.updatedBy}`}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white text-lg font-bold">
              1 USDT = TZS {Number(usdtToTzs).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core rates */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-gold" />
            <h2 className="text-white font-semibold">Core Rates</h2>
          </div>
          <div className="space-y-4">
            <Field label="USDT → TZS Rate" value={usdtToTzs} onChange={setUsdtToTzs} unit="TZS"
              hint="1 USDT equals this many TZS (from CoinGecko)" />
            <Field label="Spread (fee applied on conversion)" value={spread} onChange={setSpread} unit="%"
              hint="e.g. 1.5 means 1.5% spread. Applied to all conversions." />
            <Field label="Transaction Fee Rate" value={feeRate} onChange={setFeeRate} unit="%"
              hint="e.g. 1.0 means 1% charged on TZS amount. Revenue for Sendra." />
          </div>
        </div>

        {/* Fiat rates */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">💱</span>
            <h2 className="text-white font-semibold">Fiat → USDT Rates</h2>
          </div>
          <div className="space-y-4">
            <Field label="🇬🇧 GBP → USDT" value={gbp} onChange={setGbp} unit="USDT"
              hint="e.g. 1.27 means 1 GBP = 1.27 USDT" />
            <Field label="🇪🇺 EUR → USDT" value={eur} onChange={setEur} unit="USDT"
              hint="e.g. 1.08 means 1 EUR = 1.08 USDT" />
            <Field label="🇺🇸 USD → USDT" value={usd} onChange={setUsd} unit="USDT"
              hint="Always 1.0 (USD ≈ USDT at par)" />
          </div>
        </div>
      </div>

      {/* Preview */}
      {usdtToTzs && gbp && (
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5">
          <p className="text-slate-400 text-xs font-medium mb-3">CONVERSION PREVIEW (with current settings)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { from: '1 GBP', usdt: parseFloat(gbp) * (1 - parseFloat(spread)/100), label: 'USDT' },
              { from: '1 EUR', usdt: parseFloat(eur) * (1 - parseFloat(spread)/100), label: 'USDT' },
              { from: '1 USD', usdt: parseFloat(usd) * (1 - parseFloat(spread)/100), label: 'USDT' },
              { from: '1 USDT', usdt: (1 - parseFloat(spread)/100), label: 'USDT' },
            ].map(({ from, usdt, label }) => {
              const tzs = usdt * parseFloat(usdtToTzs)
              return (
                <div key={from} className="bg-navy-border/30 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">{from} →</p>
                  <p className="text-gold font-bold text-sm mt-1">{usdt.toFixed(4)} {label}</p>
                  <p className="text-green-400 text-xs mt-0.5">TZS {Math.round(tzs).toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      {/* Save */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition ${
            saved
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-gold hover:bg-gold-dark text-navy'
          } disabled:opacity-50`}
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Rate Changes'}
        </button>
        <p className="text-slate-500 text-xs self-center">
          Changes apply immediately to all Sendra users via Firestore real-time sync.
        </p>
      </div>
    </div>
  )
}
