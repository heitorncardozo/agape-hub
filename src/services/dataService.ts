// Camada local desativada. Nenhum dado simulados deve continuar sendo carregado.
import { useCallback, useState } from 'react'
import type { Row } from '../types'

const key = (e: string) => 'agape:' + e

export function loadAll<T>(entity: string, seed: T): T {
  void entity
  if (Array.isArray(seed)) return [] as T
  if (seed && typeof seed === 'object') return {} as T
  return seed
}

export function saveAll<T>(entity: string, data: T) {
  void entity
  void data
}

export function useCollection(entity: string, seed: Row[]) {
  const [items, set] = useState<Row[]>(() => loadAll(entity, seed))
  const upsert = useCallback((r: Row) => set(p => {
    const n = p.some(x => x.id === r.id) ? p.map(x => x.id === r.id ? r : x) : [...p, r]
    saveAll(entity, n)
    return n
  }), [entity])
  const remove = useCallback((id: string) => set(p => {
    const n = p.filter(x => x.id !== id)
    saveAll(entity, n)
    return n
  }), [entity])
  return [items, upsert, remove] as const
}
