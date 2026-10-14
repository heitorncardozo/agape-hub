// Camada de dados local. Para o Firebase, substitua o corpo destas funções por chamadas ao Firestore.
import { useCallback, useState } from 'react'
import type { Row } from '../types'
const key = (e: string) => 'agape:' + e
export function loadAll<T>(entity: string, seed: T): T {
  try { const r = localStorage.getItem(key(entity)); if (r) return JSON.parse(r) } catch { /* ignora */ }
  return seed
}
export function saveAll<T>(entity: string, data: T) { try { localStorage.setItem(key(entity), JSON.stringify(data)) } catch { /* ignora */ } }
export function useCollection(entity: string, seed: Row[]) {
  const [items, set] = useState<Row[]>(() => loadAll(entity, seed))
  const upsert = useCallback((r: Row) => set(p => { const n = p.some(x => x.id === r.id) ? p.map(x => x.id === r.id ? r : x) : [...p, r]; saveAll(entity, n); return n }), [entity])
  const remove = useCallback((id: string) => set(p => { const n = p.filter(x => x.id !== id); saveAll(entity, n); return n }), [entity])
  return [items, upsert, remove] as const
}
