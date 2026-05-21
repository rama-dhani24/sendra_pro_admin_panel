import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useCollection } from '../../hooks/useCollection'
import { fmtDate } from '../../lib/utils'
import { Bell, Send, Users, User, CheckCircle } from 'lucide-react'

export default function Notifications() {
  const { docs: users } = useCollection('users', { limitCount: 500 })

  const [target,  setTarget]  = useState('all')   // 'all' | 'user'
  const [userId,  setUserId]  = useState('')
  const [title,   setTitle]   = useState('')
  const [body,    setBody]    = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const { docs: recentNotifs } = useCollection('notifications', {
    orderField: 'createdAt', orderDir: 'desc', limitCount: 30,
  })

  const handleSend = async () => {
    setError('')
    if (!title.trim() || !body.trim()) { setError('Title and message are required.'); return }
    if (target === 'user' && !userId) { setError('Select a recipient user.'); return }

    setSending(true)
    try {
      if (target === 'all') {
        // Write a notification for every user in batch
        const writes = users.map((u) =>
          addDoc(collection(db, 'notifications'), {
            userId:    u.id,
            title:     title.trim(),
            body:      body.trim(),
            type:      'admin',
            isRead:    false,
            createdAt: serverTimestamp(),
            sentBy:    'admin_broadcast',
          })
        )
        await Promise.all(writes)
      } else {
        await addDoc(collection(db, 'notifications'), {
          userId:    userId,
          title:     title.trim(),
          body:      body.trim(),
          type:      'admin',
          isRead:    false,
          createdAt: serverTimestamp(),
          sentBy:    'admin_direct',
        })
      }
      setSent(true)
      setTitle(''); setBody(''); setUserId('')
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      setError('Failed to send: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">Send in-app notifications to users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose panel */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-gold" />
            <h2 className="text-white font-semibold">Compose Notification</h2>
          </div>

          {/* Target selector */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-medium">Send To</label>
            <div className="flex gap-3">
              {[
                { val: 'all',  icon: Users,  label: `All Users (${users.length})` },
                { val: 'user', icon: User,   label: 'Specific User' },
              ].map(({ val, icon: Icon, label }) => (
                <button
                  key={val}
                  onClick={() => setTarget(val)}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition ${
                    target === val
                      ? 'bg-gold/15 text-gold border-gold/30'
                      : 'bg-navy border-navy-border text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* User selector */}
          {target === 'user' && (
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-medium">Select User</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-navy border border-navy-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition"
              >
                <option value="">— Choose a user —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} · ID {u.accNumber} · {u.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs font-medium">Notification Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Maintenance"
              maxLength={80}
              className="w-full bg-navy border border-navy-border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 transition"
            />
            <p className="text-slate-600 text-xs text-right">{title.length}/80</p>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs font-medium">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={4}
              maxLength={300}
              className="w-full bg-navy border border-navy-border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 transition resize-none"
            />
            <p className="text-slate-600 text-xs text-right">{body.length}/300</p>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="bg-navy-border/40 rounded-xl p-4 border border-navy-border">
              <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Preview</p>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Bell size={14} className="text-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title || 'Notification Title'}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{body || 'Message body...'}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
              sent
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-gold hover:bg-gold-dark text-navy'
            } disabled:opacity-50`}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                Sending...
              </>
            ) : sent ? (
              <><CheckCircle size={15} /> Sent Successfully!</>
            ) : (
              <><Send size={15} /> Send Notification</>
            )}
          </button>
        </div>

        {/* Recent notifications log */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Notifications</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {recentNotifs.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-10">No notifications sent yet.</p>
            )}
            {recentNotifs.map((n) => {
              const typeColors = {
                debit:         'bg-red-500/10 text-red-400',
                credit:        'bg-green-500/10 text-green-400',
                admin:         'bg-gold/10 text-gold',
                admin_broadcast: 'bg-gold/10 text-gold',
              }
              return (
                <div key={n.id} className="bg-navy border border-navy-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white text-sm font-medium leading-tight">{n.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 ${typeColors[n.type] || typeColors.admin}`}>
                      {n.type === 'admin_broadcast' ? 'broadcast' : n.type}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{n.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-slate-600 text-xs">{fmtDate(n.createdAt)}</p>
                    <p className={`text-xs font-medium ${n.isRead ? 'text-slate-500' : 'text-gold'}`}>
                      {n.isRead ? 'Read' : 'Unread'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
