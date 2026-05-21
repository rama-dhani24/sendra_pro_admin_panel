import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Real-time Firestore collection hook
export function useCollection(collectionName, options = {}) {
  const { orderField = null, orderDir = 'desc', limitCount = 50, filters = [] } = options
  const [docs,    setDocs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let q = collection(db, collectionName)
    const constraints = []
    filters.forEach(([field, op, val]) => constraints.push(where(field, op, val)))
    if (orderField)  constraints.push(orderBy(orderField, orderDir))
    if (limitCount)  constraints.push(limit(limitCount))
    if (constraints.length) q = query(q, ...constraints)

    const unsub = onSnapshot(
      q,
      (snap) => {
        setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => { setError(err.message); setLoading(false) }
    )
    return unsub
  }, [collectionName, JSON.stringify(options)])

  return { docs, loading, error }
}
