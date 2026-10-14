import { useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { Row } from '../types'
import { useCollection } from '../services/dataService'
import { Avatar, btnGhost, btnPrimary, ConfirmDialog, EmptyState, inputCls, Modal, PageHeader, StatusBadge, Toast } from './ui'
export type Field = { key: string; label: string; type?: 'text' | 'date' | 'time' | 'select' | 'textarea'; options?: string[]; required?: boolean }
type Props = { entity: string; seed: Row[]; title: string; desc: string; addLabel: string; noun: string; fields: Field[]; cols: string[]; filterKey?: string; badges?: string[] }
const PAGE = 8
export default function CrudPage({ entity, seed, title, desc, addLabel, noun, fields, cols, filterKey, badges = [] }: Props) {
  const [items, upsert, remove] = useCollection(entity, seed)
  const [q, setQ] = useState(''), [f, setF] = useState(''), [page, setPage] = useState(0)
  const [edit, setEdit] = useState<Row | null>(null), [del, setDel] = useState<Row | null>(null), [toast, setToast] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }
  const fk = fields[0].key, label = (k: string) => fields.find(x => x.key === k)?.label ?? k
  const shown = items.filter(i => (!f || !filterKey || i[filterKey] === f) && Object.values(i).join(' ').toLowerCase().includes(q.toLowerCase())).sort((a, b) => a[fk].localeCompare(b[fk]))
  const pages = Math.max(1, Math.ceil(shown.length / PAGE)), cur = shown.slice(page * PAGE, page * PAGE + PAGE)
  const filterOpts = filterKey ? fields.find(x => x.key === filterKey)?.options : undefined
  const submit = (e: FormEvent) => {
    e.preventDefault(); if (!edit) return
    const er: Record<string, string> = {}
    fields.forEach(x => { if (x.required && !edit[x.key]?.trim()) er[x.key] = 'Campo obrigatório' })
    setErrs(er); if (Object.keys(er).length) return
    upsert(edit); setEdit(null); say(`${noun} salvo(a) localmente`)
  }
  const openNew = () => { setErrs({}); setEdit({ id: crypto.randomUUID(), ...Object.fromEntries(fields.map(x => [x.key, x.type === 'select' ? x.options![0] : ''])) }) }
  return <>
    <PageHeader title={title} desc={desc} action={<button className={btnPrimary} onClick={openNew}><Plus size={16} aria-hidden />{addLabel}</button>} />
    <div className="mb-4 flex flex-wrap gap-2"><div className="relative min-w-48 flex-1"><Search size={15} className="absolute left-3 top-3 text-mute" aria-hidden /><input aria-label="Buscar" placeholder="Buscar…" value={q} onChange={e => { setQ(e.target.value); setPage(0) }} className={inputCls + ' pl-9'} /></div>
      {filterOpts && <select aria-label="Filtrar" value={f} onChange={e => { setF(e.target.value); setPage(0) }} className={inputCls + ' !w-auto'}><option value="">{label(filterKey!)}: todos</option>{filterOpts.map(o => <option key={o}>{o}</option>)}</select>}</div>
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      {cur.length === 0 ? <EmptyState text="Nenhum registro encontrado." /> : <table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-line text-xs text-mute"><tr>{cols.map(c => <th key={c} className="px-4 py-3 font-medium">{label(c)}</th>)}<th className="px-4 py-3 text-right">Ações</th></tr></thead>
        <tbody>{cur.map(r => <tr key={r.id} className="border-b border-line last:border-0 hover:bg-card2/50">{cols.map((c, i) => <td key={c} className="max-w-xs truncate px-4 py-3">{i === 0 && entity === 'members' ? <span className="flex items-center gap-3"><Avatar name={r[c]} />{r[c]}</span> : badges.includes(c) ? <StatusBadge value={r[c]} /> : r[c]}</td>)}
          <td className="px-4 py-3 text-right"><button aria-label={`Editar ${r[fk]}`} className="rounded p-2 hover:bg-card2" onClick={() => { setErrs({}); setEdit(r) }}><Pencil size={15} /></button><button aria-label={`Excluir ${r[fk]}`} className="rounded p-2 text-err hover:bg-card2" onClick={() => setDel(r)}><Trash2 size={15} /></button></td></tr>)}</tbody></table>}
    </div>
    <div className="mt-3 flex items-center justify-between text-xs text-mute"><span>{shown.length} registro(s)</span><span className="flex items-center gap-2"><button className={btnGhost + ' !px-3 !py-1'} disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>{page + 1}/{pages}<button className={btnGhost + ' !px-3 !py-1'} disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Próxima</button></span></div>
    {edit && <Modal title={items.some(i => i.id === edit.id) ? `Editar ${noun}` : addLabel} onClose={() => setEdit(null)}>
      <form onSubmit={submit} noValidate className="space-y-3">{fields.map(x => <div key={x.key}><label htmlFor={x.key} className="mb-1 block text-sm">{x.label}{x.required && ' *'}</label>
        {x.type === 'select' ? <select id={x.key} className={inputCls} value={edit[x.key]} onChange={e => setEdit({ ...edit, [x.key]: e.target.value })}>{x.options!.map(o => <option key={o}>{o}</option>)}</select>
          : x.type === 'textarea' ? <textarea id={x.key} rows={4} className={inputCls} value={edit[x.key]} onChange={e => setEdit({ ...edit, [x.key]: e.target.value })} />
          : <input id={x.key} type={x.type ?? 'text'} className={inputCls + (errs[x.key] ? ' !border-err' : '')} aria-invalid={!!errs[x.key]} value={edit[x.key]} onChange={e => setEdit({ ...edit, [x.key]: e.target.value })} />}
        {errs[x.key] && <p className="mt-1 text-xs text-err">⚠ {errs[x.key]}</p>}</div>)}
        <div className="flex justify-end gap-2 pt-2"><button type="button" className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button><button className={btnPrimary}>Salvar</button></div></form></Modal>}
    {del && <ConfirmDialog text={`Excluir "${del[fk]}"? Esta ação não pode ser desfeita.`} onCancel={() => setDel(null)} onOk={() => { remove(del.id); setDel(null); say('Registro excluído') }} />}
    <Toast msg={toast} />
  </>
}
