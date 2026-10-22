import { useState } from 'react'
import { Plus, Pencil, Trash2, MapPin, Clock, User } from 'lucide-react'
import type { Row } from '../types'
import { useCollection } from '../services/dataService'
import { EVENTS, TASKS, DOCUMENTS } from '../data/mockData'
import { useProfile } from '../services/profileContext'
import {
  btnGhost, btnPrimary, ColorBadge, ConfirmDialog, DemoBanner, EmptyState,
  inputCls, Modal, PageHeader, StatCard, StatusBadge, Tabs, Toast, fmtDate, fmtBRL, SectionCard,
} from '../components/ui'
import { CalendarCheck, Users, DollarSign, FileText } from 'lucide-react'

const EVENT_STATUSES = ['Planejamento', 'Em andamento', 'Concluído', 'Cancelado']
const EVENT_CATS = ['Retiro', 'Celebração', 'Evangelização', 'Formação', 'Social']

const emptyEvent = (): Row => ({
  id: crypto.randomUUID(), title: '', date: '', endDate: '', place: '',
  category: 'Retiro', responsible: '', status: 'Planejamento', budget: '', participants: '0',
})

export default function EventsPage() {
  const { user } = useProfile()
  const [events, upsertEvent, removeEvent, , loading, dataError] = useCollection('events', EVENTS)
  const [tasks, , , , , tasksError] = useCollection('tasks', TASKS)
  const [docs, , , , , docsError] = useCollection('documents', DOCUMENTS)
  const [tab, setTab] = useState('Eventos')
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)
  const [del, setDel] = useState<Row | null>(null)
  const [detail, setDetail] = useState<Row | null>(null)
  const [toast, setToast] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({})

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }
  const canEdit = user.profile === 'coordenacao' || user.profile === 'lideranca'

  const shown = events
    .filter(e => (!statusFilter || e.status === statusFilter) && (e.title + e.place + e.responsible).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date))

  const submit = async () => {
    if (!edit) return
    const er: Record<string, string> = {}
    if (!edit.title?.trim()) er.title = 'Campo obrigatório'
    if (!edit.date) er.date = 'Campo obrigatório'
    setErrs(er); if (Object.keys(er).length) return
    try {
      await upsertEvent(edit)
      setEdit(null)
      say('Evento salvo no Supabase')
    } catch {
      // The Supabase error is rendered in the form.
    }
  }

  const tasksByEvent = (eid: string) => tasks.filter(t => t.eventId === eid)
  const docsByEvent = (eid: string) => docs.filter(d => d.eventId === eid)

  const statCounts = (s: string) => events.filter(e => e.status === s).length

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Eventos"
        desc="Gerencie eventos internos, responsáveis e acompanhamento."
        action={canEdit ? <button className={btnPrimary} onClick={() => { setErrs({}); setEdit(emptyEvent()) }}><Plus size={16} aria-hidden />Novo evento</button> : undefined}
      />
      {(dataError || tasksError || docsError) && <p role="alert" className="mb-4 rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm text-err">{dataError || tasksError || docsError}</p>}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={events.length} hint="Eventos cadastrados" icon={<CalendarCheck size={18} />} />
        <StatCard label="Planejamento" value={statCounts('Planejamento')} hint="A realizar" icon={<CalendarCheck size={18} />} accent="#22D3EE" />
        <StatCard label="Em andamento" value={statCounts('Em andamento')} hint="Em execução" icon={<Users size={18} />} accent="#FBBF24" />
        <StatCard label="Concluídos" value={statCounts('Concluído')} hint="Realizados" icon={<CalendarCheck size={18} />} accent="#34D399" />
      </div>

      <Tabs tabs={['Eventos', 'Tarefas']} active={tab} onChange={setTab} />

      {tab === 'Eventos' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <input aria-label="Buscar evento" placeholder="Buscar evento…" value={q}
              onChange={e => setQ(e.target.value)} className={inputCls + ' min-w-48 flex-1'} />
            <select aria-label="Situação" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls + ' !w-auto'}>
              <option value="">Todas as situações</option>
              {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {loading && <EmptyState text="Carregando eventos do Supabase..." />}
            {!loading && shown.length === 0 && <EmptyState text="Nenhum evento encontrado." />}
            {shown.map(ev => (
              <div key={ev.id} className="rounded-xl border border-line bg-card p-4 hover:border-accent/40 transition cursor-pointer" onClick={() => setDetail(ev)}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug">{ev.title}</h3>
                  <StatusBadge value={ev.status} />
                </div>
                <div className="space-y-1 text-xs text-mute">
                  <div className="flex items-center gap-1"><CalendarCheck size={12} />{fmtDate(ev.date)}{ev.endDate !== ev.date && ` → ${fmtDate(ev.endDate)}`}</div>
                  <div className="flex items-center gap-1"><MapPin size={12} />{ev.place}</div>
                  <div className="flex items-center gap-1"><User size={12} />{ev.responsible}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <ColorBadge label={ev.category} color="#22D3EE" />
                  <div className="flex items-center gap-3 text-xs text-mute">
                    <span className="flex items-center gap-1"><Users size={12} />{ev.participants} part.</span>
                    {user.canAccessFinancial && <span className="flex items-center gap-1"><DollarSign size={12} />{fmtBRL(ev.budget)}</span>}
                  </div>
                </div>
                {canEdit && (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3" onClick={e => e.stopPropagation()}>
                    <button className={btnGhost + ' !py-1 !px-3 text-xs flex-1'} onClick={() => { setErrs({}); setEdit(ev) }}><Pencil size={13} />Editar</button>
                    <button className="rounded-lg border border-line px-3 py-1 text-xs text-err hover:bg-card2" onClick={() => setDel(ev)}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'Tarefas' && (
        <div className="space-y-3">
          {events.map(ev => {
            const evTasks = tasksByEvent(ev.id)
            if (evTasks.length === 0) return null
            return (
              <SectionCard key={ev.id} title={ev.title}>
                <div className="space-y-2">
                  {evTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg bg-card2 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">{t.title}</div>
                        <div className="flex items-center gap-3 text-xs text-mute">
                          <span className="flex items-center gap-1"><User size={11} />{t.responsible}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{fmtDate(t.dueDate)}</span>
                        </div>
                      </div>
                      <StatusBadge value={t.status} />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-mute">Data:</span> {fmtDate(detail.date)}{detail.endDate !== detail.date && ` → ${fmtDate(detail.endDate)}`}</div>
              <div><span className="text-mute">Local:</span> {detail.place}</div>
              <div><span className="text-mute">Responsável:</span> {detail.responsible}</div>
              <div><span className="text-mute">Participantes:</span> {detail.participants}</div>
              <div><span className="text-mute">Categoria:</span> {detail.category}</div>
              <div><span className="text-mute">Situação:</span> <StatusBadge value={detail.status} /></div>
              {user.canAccessFinancial && <div className="col-span-2"><span className="text-mute">Orçamento:</span> {fmtBRL(detail.budget)}</div>}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Tarefas ({tasksByEvent(detail.id).length})</h3>
              {tasksByEvent(detail.id).length === 0 ? <p className="text-xs text-mute">Sem tarefas vinculadas.</p> : (
                <div className="space-y-1">
                  {tasksByEvent(detail.id).map(t => (
                    <div key={t.id} className="flex items-center justify-between rounded bg-card2 px-3 py-2 text-xs">
                      <span>{t.title} — {t.responsible}</span>
                      <StatusBadge value={t.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Documentos ({docsByEvent(detail.id).length})</h3>
              {docsByEvent(detail.id).length === 0 ? <p className="text-xs text-mute">Sem documentos vinculados.</p> : (
                <div className="space-y-1">
                  {docsByEvent(detail.id).map(d => (
                    <div key={d.id} className="flex items-center gap-2 rounded bg-card2 px-3 py-2 text-xs">
                      <FileText size={13} className="text-mute" />{d.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {edit && (
        <Modal title={events.some(e => e.id === edit.id) ? 'Editar evento' : 'Novo evento'} onClose={() => setEdit(null)} wide>
          <div className="space-y-3">
            <div>
              <label htmlFor="ev-title" className="mb-1 block text-sm">Título *</label>
              <input id="ev-title" className={inputCls + (errs.title ? ' !border-err' : '')} value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} />
              {errs.title && <p className="mt-1 text-xs text-err">⚠ {errs.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-date" className="mb-1 block text-sm">Data de início *</label>
                <input id="ev-date" type="date" className={inputCls + (errs.date ? ' !border-err' : '')} value={edit.date} onChange={e => setEdit({ ...edit, date: e.target.value })} />
                {errs.date && <p className="mt-1 text-xs text-err">⚠ {errs.date}</p>}
              </div>
              <div>
                <label htmlFor="ev-endDate" className="mb-1 block text-sm">Data de término</label>
                <input id="ev-endDate" type="date" className={inputCls} value={edit.endDate} onChange={e => setEdit({ ...edit, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="ev-place" className="mb-1 block text-sm">Local</label>
              <input id="ev-place" className={inputCls} value={edit.place} onChange={e => setEdit({ ...edit, place: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-cat" className="mb-1 block text-sm">Categoria</label>
                <select id="ev-cat" className={inputCls} value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })}>
                  {EVENT_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ev-status" className="mb-1 block text-sm">Situação</label>
                <select id="ev-status" className={inputCls} value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
                  {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="ev-resp" className="mb-1 block text-sm">Responsável</label>
              <input id="ev-resp" className={inputCls} value={edit.responsible} onChange={e => setEdit({ ...edit, responsible: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-participants" className="mb-1 block text-sm">Nº estimado de participantes</label>
                <input id="ev-participants" type="number" className={inputCls} value={edit.participants} onChange={e => setEdit({ ...edit, participants: e.target.value })} />
              </div>
              <div>
                <label htmlFor="ev-budget" className="mb-1 block text-sm">Orçamento previsto (R$)</label>
                <input id="ev-budget" type="number" step="0.01" className={inputCls} value={edit.budget} onChange={e => setEdit({ ...edit, budget: e.target.value })} />
              </div>
            </div>
            {dataError && <p role="alert" className="rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm text-err">{dataError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button>
              <button className={btnPrimary} onClick={submit}>Salvar</button>
            </div>
          </div>
        </Modal>
      )}

      {del && <ConfirmDialog text={`Excluir "${del.title}"? Esta ação não pode ser desfeita.`} onCancel={() => setDel(null)} onOk={async () => {
        try {
          await removeEvent(del.id)
          setDel(null)
          say('Evento excluído do Supabase')
        } catch {
          setDel(null)
        }
      }} />}
      <Toast msg={toast} />
    </>
  )
}
