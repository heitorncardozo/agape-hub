import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Row } from '../types'

type AppRecord = { record_id: string; payload: Row }

function describeSupabaseError(error: unknown) {
  if (error instanceof Error) return error.message
  if (!error || typeof error !== 'object' || !('message' in error) || typeof error.message !== 'string') return String(error)
  return [
    error.message,
    'code' in error && typeof error.code === 'string' && `Código: ${error.code}`,
    'details' in error && typeof error.details === 'string' && error.details,
    'hint' in error && typeof error.hint === 'string' && `Dica: ${error.hint}`,
  ].filter(Boolean).join(' ')
}

export function useCollection(entity: string, _seed: Row[]) {
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setReady(false)
    setError('')
    const { data, error: queryError } = await supabase
      .from('app_records')
      .select('record_id, payload')
      .eq('entity', entity)
    if (queryError) {
      setError(`Não foi possível carregar "${entity}" do Supabase: ${describeSupabaseError(queryError)}`)
      setLoading(false)
      return
    }

    setItems((data ?? []).map((record: AppRecord) => ({ ...record.payload, id: record.record_id })))
    setReady(true)
    setLoading(false)
  }, [entity])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const upsert = useCallback(async (row: Row) => {
    if (loading || !ready) {
      const message = `Aguarde o carregamento de "${entity}" antes de salvar.`
      setError(message)
      throw new Error(message)
    }
    setError('')
    const { data, error: saveError } = await supabase.from('app_records').upsert({
      entity,
      record_id: row.id,
      payload: row,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'entity,record_id' }).select('record_id').single()
    if (saveError) {
      const message = `Não foi possível salvar no Supabase: ${describeSupabaseError(saveError)}`
      setError(message)
      throw new Error(message)
    }
    if (data.record_id !== row.id) {
      const message = `O Supabase não confirmou a gravação de "${entity}".`
      setError(message)
      throw new Error(message)
    }
    setItems(previous => previous.some(item => item.id === row.id)
      ? previous.map(item => item.id === row.id ? row : item)
      : [...previous, row])
  }, [entity, loading, ready])

  const remove = useCallback(async (id: string) => {
    if (loading || !ready) {
      const message = `Aguarde o carregamento de "${entity}" antes de excluir.`
      setError(message)
      throw new Error(message)
    }
    setError('')
    const { error: deleteError } = await supabase
      .from('app_records')
      .delete()
      .eq('entity', entity)
      .eq('record_id', id)
    if (deleteError) {
      const message = `Não foi possível excluir do Supabase: ${describeSupabaseError(deleteError)}`
      setError(message)
      throw new Error(message)
    }
    setItems(previous => previous.filter(item => item.id !== id))
  }, [entity, loading, ready])

  const replace = useCallback(async (rows: Row[]) => {
    if (loading || !ready) {
      const message = `Aguarde o carregamento de "${entity}" antes de salvar.`
      setError(message)
      throw new Error(message)
    }
    setError('')
    const { error: replaceError } = await supabase.rpc('replace_app_records', {
      p_entity: entity,
      p_records: rows,
    })
    if (replaceError) {
      const message = `Não foi possível salvar "${entity}" no Supabase: ${describeSupabaseError(replaceError)}`
      setError(message)
      throw new Error(message)
    }
    const { data, error: verifyError } = await supabase
      .from('app_records')
      .select('record_id')
      .eq('entity', entity)
    if (verifyError) {
      const message = `A gravação de "${entity}" foi enviada, mas não pôde ser confirmada no Supabase: ${describeSupabaseError(verifyError)}`
      setError(message)
      throw new Error(message)
    }
    const savedIds = new Set((data ?? []).map(record => record.record_id))
    if (rows.some(row => !savedIds.has(row.id)) || savedIds.size !== rows.length) {
      const message = `O Supabase não confirmou todos os registros de "${entity}".`
      setError(message)
      throw new Error(message)
    }
    setItems(rows)
  }, [entity, loading, ready])

  return [items, upsert, remove, replace, loading, error] as const
}

export function useStoredValue<T>(entity: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('app_records')
        .select('payload')
        .eq('entity', entity)
        .eq('record_id', '__singleton__')
        .maybeSingle()
      if (!active) return
      if (queryError) {
        setError(`Não foi possível carregar "${entity}" do Supabase: ${describeSupabaseError(queryError)}`)
        setLoading(false)
        return
      }
      if (data) {
        setValue(data.payload as T)
        setReady(true)
        setLoading(false)
        return
      }

      if (active) {
        setReady(true)
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [entity])

  const save = useCallback(async (next: T) => {
    if (loading || !ready) {
      const message = `Aguarde o carregamento de "${entity}" antes de salvar.`
      setError(message)
      throw new Error(message)
    }
    setError('')
    const { data, error: saveError } = await supabase.from('app_records').upsert({
      entity,
      record_id: '__singleton__',
      payload: next,
    }, { onConflict: 'entity,record_id' }).select('record_id').single()
    if (saveError) {
      const message = `Não foi possível salvar "${entity}" no Supabase: ${describeSupabaseError(saveError)}`
      setError(message)
      throw new Error(message)
    }
    if (data.record_id !== '__singleton__') {
      const message = `O Supabase não confirmou a gravação de "${entity}".`
      setError(message)
      throw new Error(message)
    }
    setValue(next)
  }, [entity, loading, ready])

  return [value, save, loading, error, setValue] as const
}

export function useMembers() {
  const [members, setMembers] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error: queryError } = await supabase
        .from('members')
        .select('id, name, group_name, sub, phone, birth, joined, status')
        .order('name')
      if (!active) return
      if (queryError) {
        setError(`Não foi possível carregar os membros do Supabase: ${describeSupabaseError(queryError)}`)
      } else {
        setMembers((data ?? []).map(member => ({
          id: member.id,
          name: member.name,
          group: member.group_name ?? '',
          sub: member.sub ?? '',
          phone: member.phone ?? '',
          birth: member.birth ?? '',
          joined: member.joined ?? '',
          status: member.status ?? 'Ativo',
        })))
      }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  return [members, loading, error] as const
}
