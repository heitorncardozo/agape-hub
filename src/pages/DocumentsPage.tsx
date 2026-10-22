import { useState } from 'react'
import { FileText, Upload, Trash2, Archive, Search, FolderOpen } from 'lucide-react'
import type { Row } from '../types'
import { useCollection } from '../services/dataService'
import { DOCUMENTS, EVENTS } from '../data/mockData'
import { useProfile } from '../services/profileContext'
import {
  btnGhost, btnPrimary, ColorBadge, ConfirmDialog, DemoBanner, EmptyState,
  inputCls, Modal, PageHeader, StatusBadge, StatCard, Toast, fmtDate,
} from '../components/ui'
import { Plus } from 'lucide-react'

const CATEGORIES = ['Ata', 'Regulamento', 'Financeiro', 'Lista', 'Formação', 'Outro']

const emptyDoc = (): Row => ({
  id: crypto.randomUUID(), title: '', category: 'Ata', eventId: '',
  uploadedBy: '', uploadedAt: new Date().toISOString().slice(0, 10),
  size: '', status: 'Ativo',
})

export default function DocumentsPage() {
  const { user } = useProfile()
  const [docs, upsert, remove, , loading, dataError] = useCollection('documents', DOCUMENTS)
  const [events, , , , , eventsError] = useCollection('events', EVENTS)
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [statusFilter, setStatusFilter] = useState('')
  const [edit, setEdit] = useState<Row | null>(null), [del, setDel] = useState<Row | null>(null)
  const [toast, setToast] = useState(''), [errs, setErrs] = useState<Record<string, string>>({})

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }
  const canEdit = user.profile !== 'membro'

  const shown = docs.filter(d =>
    (!cat || d.category === cat) &&
    (!statusFilter || d.status === statusFilter) &&
    (d.title + d.uploadedBy).toLowerCase().includes(q.toLowerCase())
  ).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))

  const submit = async () => {
    if (!edit) return
    const er: Record<string, string> = {}
    if (!edit.title?.trim()) er.title = 'Campo obrigatório'
    setErrs(er); if (Object.keys(er).length) return
    try {
      await upsert({ ...edit, uploadedBy: edit.uploadedBy || user.name })
      setEdit(null)
      say('Documento registrado no Supabase')
    } catch {
      // The Supabase error is rendered in the form.
    }
  }

  const getEventTitle = (id: string) => events.find(e => e.id === id)?.title ?? ''

  const catColors: Record<string, string> = {
    Ata: '#22D3EE', Regulamento: '#9333EA', Financeiro: '#34D399',
    Lista: '#F97316', Formação: '#EAB308', Outro: '#94A3B8',
  }

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Documentos"
        desc="Acesse atas, regulamentos, listas e arquivos da comunidade."
        action={canEdit ? <button className={btnPrimary} onClick={() => { setErrs({}); setEdit(emptyDoc()) }}><Plus size={16} aria-hidden />Adicionar documento</button> : undefined}
      />
      {(dataError || eventsError) && <p role="alert" className="mb-4 rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm text-err">{dataError || eventsError}</p>}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={docs.length} hint="Documentos" icon={<FolderOpen size={18} />} />
        <StatCard label="Ativos" value={docs.filter(d => d.status === 'Ativo').length} hint="Disponíveis" icon={<FileText size={18} />} accent="#34D399" />
        <StatCard label="Arquivados" value={docs.filter(d => d.status === 'Arquivado').length} hint="Histórico" icon={<Archive size={18} />} accent="#94A3B8" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search size={15} className="absolute left-3 top-3 text-mute" aria-hidden />
          <input aria-label="Buscar documento" placeholder="Buscar documento…" value={q}
            onChange={e => setQ(e.target.value)} className={inputCls + ' pl-9'} />
        </div>
        <select aria-label="Categoria" value={cat} onChange={e => setCat(e.target.value)} className={inputCls + ' !w-auto'}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Situação" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls + ' !w-auto'}>
          <option value="">Todas as situações</option>
          <option>Ativo</option><option>Arquivado</option>
        </select>
      </div>

      <div className="rounded-xl border border-line bg-card overflow-x-auto">
        {loading ? <EmptyState text="Carregando documentos do Supabase..." /> : shown.length === 0 ? <EmptyState text="Nenhum documento encontrado." /> : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs text-mute">
              <tr>
                {['Título', 'Categoria', 'Evento vinculado', 'Enviado por', 'Data', 'Situação', 'Ações'].map(h =>
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map(d => (
                <tr key={d.id} className="border-b border-line last:border-0 hover:bg-card2/50">
                  <td className="px-4 py-3 font-medium">{d.title}</td>
                  <td className="px-4 py-3"><ColorBadge label={d.category} color={catColors[d.category] ?? '#94A3B8'} /></td>
                  <td className="px-4 py-3 text-mute">{getEventTitle(d.eventId) || '—'}</td>
                  <td className="px-4 py-3 text-mute">{d.uploadedBy}</td>
                  <td className="px-4 py-3 text-mute">{fmtDate(d.uploadedAt)}</td>
                  <td className="px-4 py-3"><StatusBadge value={d.status} /></td>
                  <td className="px-4 py-3">
                    {canEdit && <>
                      <button aria-label={`Editar ${d.title}`} className="rounded p-2 hover:bg-card2" onClick={() => { setErrs({}); setEdit(d) }}><Upload size={14} /></button>
                      <button aria-label={`Excluir ${d.title}`} className="rounded p-2 text-err hover:bg-card2" onClick={() => setDel(d)}><Trash2 size={14} /></button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {edit && (
        <Modal title={docs.some(d => d.id === edit.id) ? 'Editar documento' : 'Adicionar documento'} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <div>
              <label htmlFor="doc-title" className="mb-1 block text-sm">Título *</label>
              <input id="doc-title" className={inputCls + (errs.title ? ' !border-err' : '')} value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} />
              {errs.title && <p className="mt-1 text-xs text-err">⚠ {errs.title}</p>}
            </div>
            <div>
              <label htmlFor="doc-cat" className="mb-1 block text-sm">Categoria</label>
              <select id="doc-cat" className={inputCls} value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="doc-event" className="mb-1 block text-sm">Evento vinculado (opcional)</label>
              <select id="doc-event" className={inputCls} value={edit.eventId} onChange={e => setEdit({ ...edit, eventId: e.target.value })}>
                <option value="">Nenhum</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="doc-date" className="mb-1 block text-sm">Data</label>
              <input id="doc-date" type="date" className={inputCls} value={edit.uploadedAt} onChange={e => setEdit({ ...edit, uploadedAt: e.target.value })} />
            </div>
            <div>
              <label htmlFor="doc-status" className="mb-1 block text-sm">Situação</label>
              <select id="doc-status" className={inputCls} value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
                <option>Ativo</option><option>Arquivado</option>
              </select>
            </div>
            {dataError && <p role="alert" className="rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm text-err">{dataError}</p>}
            <p className="rounded-lg border border-line bg-card2 px-3 py-2 text-xs text-mute">
              ⚠ Upload de arquivos não implementado nesta versão. Os metadados serão salvos no Supabase.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button>
              <button className={btnPrimary} onClick={submit}>Salvar</button>
            </div>
          </div>
        </Modal>
      )}

      {del && <ConfirmDialog text={`Excluir "${del.title}"?`} onCancel={() => setDel(null)} onOk={async () => {
        try {
          await remove(del.id)
          setDel(null)
          say('Documento excluído do Supabase')
        } catch {
          setDel(null)
        }
      }} />}
      <Toast msg={toast} />
    </>
  )
}
