import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CalendarDays, CheckCircle2, CircleAlert, ClipboardList, MapPinned,
  Pencil, Plus, Search, Trash2, Users, UsersRound, Wallet, Workflow,
  XCircle, CircleDashed,
} from 'lucide-react'
import { loadAll, saveAll } from '../services/dataService'
import {
  MEMBERS,
  RETREATS,
  RETREAT_ACTIVITIES,
  RETREAT_ATTENDANCE,
  RETREAT_DOCUMENTS,
  RETREAT_ITEMS,
  RETREAT_PARTICIPANTS,
  RETREAT_REPORT,
  RETREAT_TASKS,
  RETREAT_TEAMS,
} from '../data/mockData'
import { useProfile } from '../services/profileContext'
import {
  btnGhost, btnPrimary, ConfirmDialog, DemoBanner, EmptyState,
  inputCls, Modal, PageHeader, SectionCard, StatCard, StatusBadge,
  Tabs, Toast, fmtBRL, fmtDate,
} from '../components/ui'
import type { Row } from '../types'

const RETREAT_TABS = [
  'Visão geral',
  'Cronograma',
  'Participantes',
  'Equipes',
  'Tarefas',
  'Logística e materiais',
  'Orçamento e prestação de contas',
  'Documentos',
  'Presenças',
  'Relatório final',
] as const

const RETREAT_STATUSES = ['Planejamento', 'Preparação', 'Em andamento', 'Prestação de contas', 'Em revisão', 'Encerrado', 'Cancelado']
const FINANCIAL_STATUSES = ['Em preparação', 'Aguardando conferência', 'Em revisão', 'Necessita correção', 'Aprovada', 'Consolidada']
const PARTICIPANT_SITUATIONS = ['Pré-cadastrado', 'Confirmado', 'Lista de espera', 'Cancelado']
const TASK_STATUS = ['A fazer', 'Em andamento', 'Concluída', 'Cancelada']
const TASK_PRIORITY = ['Baixa', 'Normal', 'Alta', 'Urgente']
const ITEM_STATUS = ['Pendente', 'Em preparação', 'Disponível', 'Parcial', 'Concluído']
const DOCUMENT_CLASS = ['Público', 'Interno', 'Restrito']

const emptyRetreat = (): Row => ({
  id: crypto.randomUUID(),
  name: '',
  theme: '',
  description: '',
  objective: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  location: '',
  responsible: '',
  targetAudience: '',
  capacity: '',
  status: 'Planejamento',
  notes: '',
  financialStatus: 'Em preparação',
  budgetPlanned: '0',
  budgetApproved: '0',
  budgetActual: '0',
})

const emptyActivity = (): Row => ({
  id: crypto.randomUUID(),
  retreatId: '',
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  place: '',
  responsible: '',
  notes: '',
})

const emptyParticipant = (): Row => ({
  id: crypto.randomUUID(),
  retreatId: '',
  name: '',
  origin: 'Membro',
  memberId: '',
  status: 'Pré-cadastrado',
  email: '',
  phone: '',
  notes: '',
})

const emptyTeam = (): Row => ({
  id: crypto.randomUUID(),
  retreatId: '',
  name: '',
  objective: '',
  leader: '',
  members: '',
  functions: '',
  tasks: '',
  status: 'Ativa',
})

const emptyTask = (): Row => ({
  id: crypto.randomUUID(),
  retreatId: '',
  title: '',
  description: '',
  area: '',
  responsible: '',
  dueDate: '',
  priority: 'Normal',
  status: 'A fazer',
  notes: '',
})

const emptyItem = (): Row => ({
  id: crypto.randomUUID(),
  retreatId: '',
  name: '',
  description: '',
  qtyNeeded: '',
  qtyAvailable: '',
  responsible: '',
  status: 'Pendente',
  observations: '',
})

const emptyDocument = (): Row => ({
  id: crypto.randomUUID(),
  retreatId: '',
  title: '',
  category: 'Programação',
  description: '',
  date: '',
  responsible: '',
  access: 'Interno',
  file: 'Simulação local',
})

const emptyAttendance = (): Row => ({
  id: crypto.randomUUID(),
  retreatId: '',
  participantId: '',
  participantName: '',
  status: 'Pendente',
  justification: '',
})

const toDate = (value?: string) => value ? new Date(`${value}T00:00:00`) : null

const hasOverlap = (a: Row, b: Row) => {
  if (!a.date || !b.date || a.date !== b.date) return false
  if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false
  const startA = new Date(`2000-01-01T${a.startTime}:00`).getTime()
  const endA = new Date(`2000-01-01T${a.endTime}:00`).getTime()
  const startB = new Date(`2000-01-01T${b.startTime}:00`).getTime()
  const endB = new Date(`2000-01-01T${b.endTime}:00`).getTime()
  return startA < endB && startB < endA
}

export default function RetreatsPage() {
  const { user } = useProfile()
  const location = useLocation()
  const [retreats, setRetreats] = useState<Row[]>(() => loadAll('retreats', RETREATS))
  const [activities, setActivities] = useState<Row[]>(() => loadAll('retreat_activities', RETREAT_ACTIVITIES))
  const [participants, setParticipants] = useState<Row[]>(() => loadAll('retreat_participants', RETREAT_PARTICIPANTS))
  const [teams, setTeams] = useState<Row[]>(() => loadAll('retreat_teams', RETREAT_TEAMS))
  const [tasks, setTasks] = useState<Row[]>(() => loadAll('retreat_tasks', RETREAT_TASKS))
  const [items, setItems] = useState<Row[]>(() => loadAll('retreat_items', RETREAT_ITEMS))
  const [documents, setDocuments] = useState<Row[]>(() => loadAll('retreat_documents', RETREAT_DOCUMENTS))
  const [attendance, setAttendance] = useState<Row[]>(() => loadAll('retreat_attendance', RETREAT_ATTENDANCE))
  const [report, setReport] = useState<Row>(() => loadAll('retreat_report', RETREAT_REPORT))

  const [selectedId, setSelectedId] = useState<string>(RETREATS[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [responsibleFilter, setResponsibleFilter] = useState('')
  const [tab, setTab] = useState<(typeof RETREAT_TABS)[number]>('Visão geral')
  const [editRetreat, setEditRetreat] = useState<Row | null>(null)
  const [deleteRetreat, setDeleteRetreat] = useState<Row | null>(null)
  const [toast, setToast] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [activityDraft, setActivityDraft] = useState<Row>(() => ({ ...emptyActivity() }))
  const [activityEditId, setActivityEditId] = useState<string | null>(null)
  const [participantDraft, setParticipantDraft] = useState<Row>(() => ({ ...emptyParticipant() }))
  const [teamDraft, setTeamDraft] = useState<Row>(() => ({ ...emptyTeam() }))
  const [taskDraft, setTaskDraft] = useState<Row>(() => ({ ...emptyTask() }))
  const [itemDraft, setItemDraft] = useState<Row>(() => ({ ...emptyItem() }))
  const [documentDraft, setDocumentDraft] = useState<Row>(() => ({ ...emptyDocument() }))
  const [attendanceDraft, setAttendanceDraft] = useState<Row>(() => ({ ...emptyAttendance() }))

  const selected = useMemo(() => retreats.find(r => r.id === selectedId) ?? retreats[0] ?? null, [retreats, selectedId])
  const canEdit = user.profile === 'coordenacao' || user.profile === 'lideranca'
  const canAccessFinance = user.canAccessFinancial

  useEffect(() => {
    if (!selected) return
    setActivityDraft(prev => ({ ...prev, retreatId: selected.id }))
    setParticipantDraft(prev => ({ ...prev, retreatId: selected.id }))
    setTeamDraft(prev => ({ ...prev, retreatId: selected.id }))
    setTaskDraft(prev => ({ ...prev, retreatId: selected.id }))
    setItemDraft(prev => ({ ...prev, retreatId: selected.id }))
    setDocumentDraft(prev => ({ ...prev, retreatId: selected.id }))
    setAttendanceDraft(prev => ({ ...prev, retreatId: selected.id }))
  }, [selected])

  const updateRetreatList = (next: Row[]) => {
    setRetreats(next)
    saveAll('retreats', next)
  }
  const updateParticipantsList = (next: Row[]) => {
    setParticipants(next)
    saveAll('retreat_participants', next)
  }
  const updateActivitiesList = (next: Row[]) => {
    setActivities(next)
    saveAll('retreat_activities', next)
  }
  const updateTeamsList = (next: Row[]) => {
    setTeams(next)
    saveAll('retreat_teams', next)
  }
  const updateTasksList = (next: Row[]) => {
    setTasks(next)
    saveAll('retreat_tasks', next)
  }
  const updateItemsList = (next: Row[]) => {
    setItems(next)
    saveAll('retreat_items', next)
  }
  const updateDocumentsList = (next: Row[]) => {
    setDocuments(next)
    saveAll('retreat_documents', next)
  }
  const updateAttendanceList = (next: Row[]) => {
    setAttendance(next)
    saveAll('retreat_attendance', next)
  }

  const say = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }

  const requirePermission = (action: string, financial = false) => {
    if (financial && !canAccessFinance) {
      say(`Ação bloqueada: ${action} exige permissão financeira simulada.`)
      return false
    }
    if (!canEdit) {
      say(`Ação bloqueada: ${action} não está autorizada para o seu perfil.`)
      return false
    }
    return true
  }

  useEffect(() => {
    const state = location.state as { openRetreatId?: string } | null
    if (state?.openRetreatId) {
      setSelectedId(state.openRetreatId)
      setTab('Participantes')
    }
  }, [location.state])

  const getParticipantGroup = (participant: Row): 'cursista' | 'servo' => {
    const member = MEMBERS.find(item => item.id === participant.memberId)
    if (member?.group === 'cursista' || member?.group === 'servo') return member.group

    const origin = String(participant.origin || participant.group || '').toLowerCase()
    if (origin.includes('servo')) return 'servo'
    if (origin.includes('cursista')) return 'cursista'
    return 'cursista'
  }

  const selectedParticipants = participants.filter(p => p.retreatId === selected?.id)
  const participantGroups = useMemo(() => ({
    cursista: selectedParticipants.filter(participant => getParticipantGroup(participant) === 'cursista'),
    servo: selectedParticipants.filter(participant => getParticipantGroup(participant) === 'servo'),
  }), [selectedParticipants])
  const selectedActivities = activities.filter(a => a.retreatId === selected?.id).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
  const selectedTeams = teams.filter(t => t.retreatId === selected?.id)
  const selectedTasks = tasks.filter(t => t.retreatId === selected?.id)
  const selectedItems = items.filter(i => i.retreatId === selected?.id)
  const selectedDocuments = documents.filter(d => d.retreatId === selected?.id)
  const selectedAttendances = attendance.filter(a => a.retreatId === selected?.id)

  const participantSummary = {
    total: selectedParticipants.length,
    confirmed: selectedParticipants.filter(p => p.status === 'Confirmado').length,
  }

  const taskSummary = {
    total: selectedTasks.length,
    pending: selectedTasks.filter(t => t.status !== 'Concluída' && t.status !== 'Cancelada').length,
    completed: selectedTasks.filter(t => t.status === 'Concluída').length,
  }

  const financialDelta = selected ? parseFloat(selected.budgetActual || '0') - parseFloat(selected.budgetPlanned || '0') : 0
  const responsibleOptions = Array.from(new Set(retreats.map(r => r.responsible).filter(Boolean)))

  const visibleRetreats = retreats.filter(retreat => {
    const q = search.toLowerCase()
    const matchesQuery = !q || `${retreat.name} ${retreat.theme} ${retreat.location} ${retreat.responsible}`.toLowerCase().includes(q)
    const matchesStatus = !statusFilter || retreat.status === statusFilter
    const matchesPeriod = !periodFilter || (() => {
      const start = toDate(retreat.startDate)
      if (periodFilter === 'próximos') return !!start && start.getTime() >= Date.now()
      if (periodFilter === 'passados') return !!start && start.getTime() < Date.now()
      return true
    })()
    return matchesQuery && matchesStatus && matchesPeriod && (!responsibleFilter || retreat.responsible === responsibleFilter)
  })

  const saveRetreatDraft = () => {
    if (!editRetreat) return
    const nextErrors: Record<string, string> = {}
    if (!editRetreat.name?.trim()) nextErrors.name = 'Obrigatório'
    if (!editRetreat.location?.trim()) nextErrors.location = 'Obrigatório'
    if (!editRetreat.responsible?.trim()) nextErrors.responsible = 'Obrigatório'
    if (!editRetreat.startDate) nextErrors.startDate = 'Obrigatório'
    if (!editRetreat.endDate) nextErrors.endDate = 'Obrigatório'
    if (editRetreat.startDate && editRetreat.endDate && toDate(editRetreat.startDate)! > toDate(editRetreat.endDate)!) {
      nextErrors.endDate = 'Data final anterior ao início'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const next = [...retreats]
    const idx = next.findIndex(r => r.id === editRetreat.id)
    if (idx >= 0) next[idx] = { ...editRetreat }
    else next.unshift({ ...editRetreat })
    updateRetreatList(next)
    setSelectedId(editRetreat.id)
    setEditRetreat(null)
    say('Retiro salvo localmente.')
  }

  const openRetreatForm = (retreat?: Row) => {
    if (!canEdit) {
      say('Ação bloqueada: o perfil atual não pode criar ou editar retiros.')
      return
    }
    setErrors({})
    setEditRetreat(retreat ? { ...retreat } : emptyRetreat())
  }

  const handleCancelRetreat = () => {
    if (!deleteRetreat) return
    if (!requirePermission('cancelar retiro')) return
    const next = retreats.map(r => r.id === deleteRetreat.id ? { ...r, status: 'Cancelado' } : r)
    updateRetreatList(next)
    setDeleteRetreat(null)
    setSelectedId(deleteRetreat.id)
    say('Retiro cancelado sem apagar o histórico.')
  }

  const addActivity = () => {
    if (!selected) return
    if (!requirePermission('salvar cronograma')) return
    const row: Row = { ...activityDraft, retreatId: selected.id }
    if (!row.title?.trim() || !row.date || !row.startTime || !row.endTime || !row.place?.trim() || !row.responsible?.trim()) {
      say('Preencha todos os campos obrigatórios da atividade.')
      return
    }
    if (activityEditId) {
      updateActivitiesList(activities.map(a => a.id === activityEditId ? { ...row, id: activityEditId } : a))
      say('Atividade atualizada.')
    } else {
      updateActivitiesList([...activities, row])
      say('Atividade adicionada.')
    }
    setActivityEditId(null)
    setActivityDraft({ ...emptyActivity(), retreatId: selected.id })
  }

  const addParticipant = () => {
    if (!selected) return
    if (!participantDraft.name?.trim() && !participantDraft.memberId) {
      say('Selecione ou informe um participante.')
      return
    }
    const member = MEMBERS.find(m => m.id === participantDraft.memberId)
    const row = {
      ...participantDraft,
      retreatId: selected.id,
      name: participantDraft.name || member?.name || 'Participante externo',
      origin: member ? 'Membro' : participantDraft.origin || 'Externo',
    }
    updateParticipantsList([...participants, row])
    setParticipantDraft({ ...emptyParticipant(), retreatId: selected.id })
    say('Participante incluído no retiro.')
  }

  const addTeam = () => {
    if (!selected) return
    if (!teamDraft.name?.trim() || !teamDraft.leader?.trim()) {
      say('Nome e líder da equipe são obrigatórios.')
      return
    }
    updateTeamsList([...teams, { ...teamDraft, retreatId: selected.id }])
    setTeamDraft({ ...emptyTeam(), retreatId: selected.id })
    say('Equipe cadastrada.')
  }

  const addTask = () => {
    if (!selected) return
    if (!taskDraft.title?.trim() || !taskDraft.responsible?.trim()) {
      say('Título e responsável são obrigatórios.')
      return
    }
    updateTasksList([...tasks, { ...taskDraft, retreatId: selected.id }])
    setTaskDraft({ ...emptyTask(), retreatId: selected.id })
    say('Tarefa registrada.')
  }

  const addItem = () => {
    if (!selected) return
    if (!itemDraft.name?.trim()) {
      say('Informe o nome do item.')
      return
    }
    updateItemsList([...items, { ...itemDraft, retreatId: selected.id }])
    setItemDraft({ ...emptyItem(), retreatId: selected.id })
    say('Item de logística incluído.')
  }

  const addDocument = () => {
    if (!selected) return
    if (!documentDraft.title?.trim()) {
      say('Informe o título do documento.')
      return
    }
    updateDocumentsList([...documents, { ...documentDraft, retreatId: selected.id }])
    setDocumentDraft({ ...emptyDocument(), retreatId: selected.id })
    say('Documento registrado localmente.')
  }

  const addAttendance = () => {
    if (!selected) return
    if (!attendanceDraft.participantId || !attendanceDraft.participantName) {
      say('Selecione um participante para registrar presença.')
      return
    }
    updateAttendanceList([...attendance, { ...attendanceDraft, retreatId: selected.id }])
    setAttendanceDraft({ ...emptyAttendance(), retreatId: selected.id })
    say('Registro de presença atualizado.')
  }

  const renderOverview = () => {
    if (!selected) return <EmptyState text="Nenhum retiro disponível." />
    const prepValue = selectedTasks.length ? Math.round((taskSummary.completed / selectedTasks.length) * 100) : 0
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Participantes inscritos" value={participantSummary.total} hint={`${participantSummary.confirmed} confirmados`} icon={<Users size={18} />} />
          <StatCard label="Tarefas pendentes" value={taskSummary.pending} hint={`${taskSummary.completed} concluídas`} icon={<CircleAlert size={18} />} />
          <StatCard label="Preparação" value={`${prepValue}%`} hint="Checklist de organização" icon={<Workflow size={18} />} />
          <StatCard label="Situação financeira" value={selected.financialStatus || 'Em preparação'} hint={financialDelta >= 0 ? `Diferença: ${fmtBRL(Math.abs(financialDelta).toFixed(2))} positiva` : `Diferença: ${fmtBRL(Math.abs(financialDelta).toFixed(2))} negativa`} icon={<Wallet size={18} />} accent={financialDelta >= 0 ? '#34D399' : '#F87171'} />
        </div>

        <SectionCard title="Dados gerais">
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-xs text-mute">Tema</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm">{selected.theme || '—'}</div></div>
            <div><label className="mb-1 block text-xs text-mute">Responsável geral</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm">{selected.responsible || '—'}</div></div>
            <div><label className="mb-1 block text-xs text-mute">Data</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm">{fmtDate(selected.startDate)} {selected.startTime ? `• ${selected.startTime}` : ''}{selected.endDate ? ` a ${fmtDate(selected.endDate)}` : ''}</div></div>
            <div><label className="mb-1 block text-xs text-mute">Local</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm">{selected.location || '—'}</div></div>
            <div className="md:col-span-2"><label className="mb-1 block text-xs text-mute">Objetivo</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm leading-6">{selected.objective || '—'}</div></div>
            <div className="md:col-span-2"><label className="mb-1 block text-xs text-mute">Observações</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm leading-6">{selected.notes || 'Sem observações registradas.'}</div></div>
          </div>
        </SectionCard>
      </div>
    )
  }

  const renderSchedule = () => {
    const planned = selectedActivities.map((item, index) => ({ item, conflict: selectedActivities.some((other, j) => j > index && hasOverlap(item, other)) }))
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">{activityEditId ? 'Editar atividade' : 'Nova atividade'}</h3>
            {activityEditId && <button className={btnGhost} onClick={() => { setActivityEditId(null); setActivityDraft({ ...emptyActivity(), retreatId: selected?.id ?? '' }) }}>Cancelar</button>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={activityDraft.title ?? ''} onChange={e => setActivityDraft({ ...activityDraft, title: e.target.value })} className={inputCls} placeholder="Título" />
            <input value={activityDraft.responsible ?? ''} onChange={e => setActivityDraft({ ...activityDraft, responsible: e.target.value })} className={inputCls} placeholder="Responsável" />
            <input type="date" value={activityDraft.date ?? ''} onChange={e => setActivityDraft({ ...activityDraft, date: e.target.value })} className={inputCls} />
            <input value={activityDraft.place ?? ''} onChange={e => setActivityDraft({ ...activityDraft, place: e.target.value })} className={inputCls} placeholder="Local/espaco" />
            <input type="time" value={activityDraft.startTime ?? ''} onChange={e => setActivityDraft({ ...activityDraft, startTime: e.target.value })} className={inputCls} />
            <input type="time" value={activityDraft.endTime ?? ''} onChange={e => setActivityDraft({ ...activityDraft, endTime: e.target.value })} className={inputCls} />
            <div className="md:col-span-2"><textarea value={activityDraft.description ?? ''} onChange={e => setActivityDraft({ ...activityDraft, description: e.target.value })} rows={3} className={inputCls} placeholder="Descrição" /></div>
            <div className="md:col-span-2"><textarea value={activityDraft.notes ?? ''} onChange={e => setActivityDraft({ ...activityDraft, notes: e.target.value })} rows={2} className={inputCls} placeholder="Observações" /></div>
          </div>
          <div className="mt-3 flex justify-end"><button className={btnPrimary} onClick={addActivity}>{activityEditId ? 'Salvar atividade' : 'Adicionar atividade'}</button></div>
        </div>

        <SectionCard title="Programação cronológica">
          <div className="space-y-3">
            {planned.length === 0 && <EmptyState text="Nenhuma atividade cadastrada." />}
            {planned.map(({ item, conflict }) => (
              <div key={item.id} className={`rounded-lg border p-3 ${conflict ? 'border-err bg-card2/70' : 'border-line bg-card2'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-mute">{fmtDate(item.date)} · {item.startTime} às {item.endTime}</div>
                  </div>
                  <div className="flex gap-2">
                    {conflict && <StatusBadge value="Conflito" />}
                    <button className={btnGhost} onClick={() => { setActivityEditId(item.id); setActivityDraft({ ...item, retreatId: selected?.id ?? '' }) }}><Pencil size={14} /></button>
                    <button className={btnGhost} onClick={() => { if (!requirePermission('excluir atividade')) return; updateActivitiesList(activities.filter(a => a.id !== item.id)) }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-mute">{item.description || 'Sem descrição'}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-mute">
                  <span>{item.place}</span>
                  <span>Responsável: {item.responsible}</span>
                  {item.notes && <span>Obs.: {item.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    )
  }

  const renderParticipants = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center justify-between"><h3 className="font-medium">Cadastro manual</h3><span className="text-xs text-mute">Prioriza referências a membros existentes</span></div>
        <div className="grid gap-3 md:grid-cols-2">
          <select value={participantDraft.memberId ?? ''} onChange={e => setParticipantDraft({ ...participantDraft, memberId: e.target.value, origin: e.target.value ? 'Membro' : 'Externo' })} className={inputCls}>
            <option value="">Pessoa externa / manual</option>
            {MEMBERS.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
          <input value={participantDraft.name ?? ''} onChange={e => setParticipantDraft({ ...participantDraft, name: e.target.value })} className={inputCls} placeholder="Nome do participante" />
          <input value={participantDraft.email ?? ''} onChange={e => setParticipantDraft({ ...participantDraft, email: e.target.value })} className={inputCls} placeholder="E-mail" />
          <input value={participantDraft.phone ?? ''} onChange={e => setParticipantDraft({ ...participantDraft, phone: e.target.value })} className={inputCls} placeholder="Telefone" />
          <select value={participantDraft.status ?? 'Pré-cadastrado'} onChange={e => setParticipantDraft({ ...participantDraft, status: e.target.value })} className={inputCls}>{PARTICIPANT_SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select value={participantDraft.origin ?? 'Membro'} onChange={e => setParticipantDraft({ ...participantDraft, origin: e.target.value })} className={inputCls}><option value="Membro">Membro</option><option value="Externo">Externo</option><option value="Cursista">Cursista</option><option value="Servo">Servo</option></select>
          <div className="md:col-span-2"><textarea value={participantDraft.notes ?? ''} onChange={e => setParticipantDraft({ ...participantDraft, notes: e.target.value })} className={inputCls} rows={2} placeholder="Observações / histórico simulado" /></div>
        </div>
        <div className="mt-3 flex justify-end"><button className={btnPrimary} onClick={addParticipant}>Adicionar participante</button></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(['cursista', 'servo'] as const).map(groupKey => (
          <SectionCard key={groupKey} title={groupKey === 'cursista' ? 'Cursistas' : 'Servos'}>
            <div className="space-y-3">
              {participantGroups[groupKey].length === 0 && <EmptyState text={`Nenhum ${groupKey === 'cursista' ? 'cursista' : 'servo'} registrado.`} />}
              {participantGroups[groupKey].map(p => (
                <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-card2 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-card text-accent font-medium">{p.name.split(' ').slice(0, 2).map(s => s[0]).join('').slice(0, 2)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name} <span className="text-xs text-mute">({p.origin || (groupKey === 'cursista' ? 'Cursista' : 'Servo')})</span></div>
                    <div className="text-xs text-mute">{p.email || '—'} · {p.phone || '—'}</div>
                  </div>
                  <StatusBadge value={p.status} />
                  <button className={btnGhost} onClick={() => updateParticipantsList(participants.filter(x => x.id !== p.id))}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )

  const renderTeams = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={teamDraft.name ?? ''} onChange={e => setTeamDraft({ ...teamDraft, name: e.target.value })} className={inputCls} placeholder="Nome da equipe" />
          <input value={teamDraft.leader ?? ''} onChange={e => setTeamDraft({ ...teamDraft, leader: e.target.value })} className={inputCls} placeholder="Líder responsável" />
          <div className="md:col-span-2"><textarea value={teamDraft.objective ?? ''} onChange={e => setTeamDraft({ ...teamDraft, objective: e.target.value })} className={inputCls} rows={2} placeholder="Objetivo / descrição" /></div>
          <div className="md:col-span-2"><textarea value={teamDraft.members ?? ''} onChange={e => setTeamDraft({ ...teamDraft, members: e.target.value })} className={inputCls} rows={2} placeholder="Integrantes (nome / função)" /></div>
          <div className="md:col-span-2"><textarea value={teamDraft.functions ?? ''} onChange={e => setTeamDraft({ ...teamDraft, functions: e.target.value })} className={inputCls} rows={2} placeholder="Funções e atribuições" /></div>
          <div className="md:col-span-2"><textarea value={teamDraft.tasks ?? ''} onChange={e => setTeamDraft({ ...teamDraft, tasks: e.target.value })} className={inputCls} rows={2} placeholder="Tarefas associadas" /></div>
        </div>
        <div className="mt-3 flex justify-end"><button className={btnPrimary} onClick={addTeam}>Adicionar equipe</button></div>
      </div>

      <SectionCard title="Equipes do retiro">
        <div className="space-y-3">
          {selectedTeams.length === 0 && <EmptyState text="Nenhuma equipe cadastrada." />}
          {selectedTeams.map(team => (
            <div key={team.id} className="rounded-lg border border-line bg-card2 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{team.name}</div>
                <button className={btnGhost} onClick={() => updateTeamsList(teams.filter(t => t.id !== team.id))}><Trash2 size={14} /></button>
              </div>
              <div className="mt-2 text-xs text-mute">Líder: {team.leader} · Objetivo: {team.objective || '—'}</div>
              <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                <div><span className="text-mute block">Integrantes</span>{team.members || '—'}</div>
                <div><span className="text-mute block">Funções</span>{team.functions || '—'}</div>
                <div className="md:col-span-2"><span className="text-mute block">Tarefas</span>{team.tasks || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderTasks = () => {
    const [filterResponsible, setFilterResponsible] = useState('')
    const [filterPriority, setFilterPriority] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterTeam, setFilterTeam] = useState('')

    const taskRows = selectedTasks.filter(task => (
      (!filterResponsible || task.responsible === filterResponsible) &&
      (!filterPriority || task.priority === filterPriority) &&
      (!filterStatus || task.status === filterStatus) &&
      (!filterTeam || task.area === filterTeam)
    ))

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={taskDraft.title ?? ''} onChange={e => setTaskDraft({ ...taskDraft, title: e.target.value })} className={inputCls} placeholder="Título" />
            <input value={taskDraft.responsible ?? ''} onChange={e => setTaskDraft({ ...taskDraft, responsible: e.target.value })} className={inputCls} placeholder="Responsável" />
            <input value={taskDraft.area ?? ''} onChange={e => setTaskDraft({ ...taskDraft, area: e.target.value })} className={inputCls} placeholder="Equipe / área" />
            <input type="date" value={taskDraft.dueDate ?? ''} onChange={e => setTaskDraft({ ...taskDraft, dueDate: e.target.value })} className={inputCls} />
            <select value={taskDraft.priority ?? 'Normal'} onChange={e => setTaskDraft({ ...taskDraft, priority: e.target.value })} className={inputCls}>{TASK_PRIORITY.map(p => <option key={p} value={p}>{p}</option>)}</select>
            <select value={taskDraft.status ?? 'A fazer'} onChange={e => setTaskDraft({ ...taskDraft, status: e.target.value })} className={inputCls}>{TASK_STATUS.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <div className="md:col-span-2"><textarea value={taskDraft.description ?? ''} onChange={e => setTaskDraft({ ...taskDraft, description: e.target.value })} rows={2} className={inputCls} placeholder="Descrição" /></div>
            <div className="md:col-span-2"><textarea value={taskDraft.notes ?? ''} onChange={e => setTaskDraft({ ...taskDraft, notes: e.target.value })} rows={2} className={inputCls} placeholder="Observações" /></div>
          </div>
          <div className="mt-3 flex justify-end"><button className={btnPrimary} onClick={addTask}>Adicionar tarefa</button></div>
        </div>

        <SectionCard title="Checklist e filtros">
          <div className="mb-4 flex flex-wrap gap-2">
            <select value={filterResponsible} onChange={e => setFilterResponsible(e.target.value)} className={inputCls + ' !w-auto'}><option value="">Responsável: todos</option>{Array.from(new Set(selectedTasks.map(t => t.responsible))).map(value => <option key={value} value={value}>{value}</option>)}</select>
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className={inputCls + ' !w-auto'}><option value="">Equipe: todas</option>{Array.from(new Set(selectedTasks.map(t => t.area))).filter(Boolean).map(value => <option key={value} value={value}>{value}</option>)}</select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={inputCls + ' !w-auto'}><option value="">Prioridade: todas</option>{TASK_PRIORITY.map(value => <option key={value} value={value}>{value}</option>)}</select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls + ' !w-auto'}><option value="">Status: todos</option>{TASK_STATUS.map(value => <option key={value} value={value}>{value}</option>)}</select>
          </div>
          <div className="space-y-2">
            {taskRows.length === 0 && <EmptyState text="Nenhuma tarefa no filtro atual." />}
            {taskRows.map(task => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-mute">{task.area || 'Sem área'} · {task.responsible} · Prazo {fmtDate(task.dueDate) || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={task.status} />
                  <StatusBadge value={task.priority} />
                  <button className={btnGhost} onClick={() => updateTasksList(tasks.filter(t => t.id !== task.id))}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    )
  }

  const renderMaterials = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={itemDraft.name ?? ''} onChange={e => setItemDraft({ ...itemDraft, name: e.target.value })} className={inputCls} placeholder="Nome do material" />
          <input value={itemDraft.responsible ?? ''} onChange={e => setItemDraft({ ...itemDraft, responsible: e.target.value })} className={inputCls} placeholder="Responsável" />
          <input value={itemDraft.qtyNeeded ?? ''} onChange={e => setItemDraft({ ...itemDraft, qtyNeeded: e.target.value })} className={inputCls} placeholder="Quantidade necessária" />
          <input value={itemDraft.qtyAvailable ?? ''} onChange={e => setItemDraft({ ...itemDraft, qtyAvailable: e.target.value })} className={inputCls} placeholder="Quantidade disponível" />
          <select value={itemDraft.status ?? 'Pendente'} onChange={e => setItemDraft({ ...itemDraft, status: e.target.value })} className={inputCls}>{ITEM_STATUS.map(status => <option key={status} value={status}>{status}</option>)}</select>
          <input value={itemDraft.description ?? ''} onChange={e => setItemDraft({ ...itemDraft, description: e.target.value })} className={inputCls} placeholder="Descrição breve" />
          <div className="md:col-span-2"><textarea value={itemDraft.observations ?? ''} onChange={e => setItemDraft({ ...itemDraft, observations: e.target.value })} rows={2} className={inputCls} placeholder="Observações" /></div>
        </div>
        <div className="mt-3 flex justify-end"><button className={btnPrimary} onClick={addItem}>Adicionar item</button></div>
      </div>

      <SectionCard title="Itens e recursos">
        <div className="space-y-3">
          {selectedItems.length === 0 && <EmptyState text="Nenhum material cadastrado." />}
          {selectedItems.map(item => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card2 p-3">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-mute">Necessário: {item.qtyNeeded || '0'} · Disponível: {item.qtyAvailable || '0'} · {item.responsible || 'Sem responsável'}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={item.status} />
                <button className={btnGhost} onClick={() => updateItemsList(items.filter(i => i.id !== item.id))}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderBudget = () => {
    if (!selected) return <EmptyState text="Selecione um retiro." />
    return (
      <div className="space-y-4">
        {!canAccessFinance && <div className="rounded-lg border border-warn/50 bg-warn/10 p-3 text-sm text-warn">Acesso financeiro bloqueado para este perfil. A demonstração exige permissão de tesouraria ou coordenação.</div>}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Orçamento previsto" value={fmtBRL(selected.budgetPlanned || '0')} hint="Previsto" icon={<ClipboardList size={18} />} accent="#22D3EE" />
          <StatCard label="Orçamento aprovado" value={fmtBRL(selected.budgetApproved || '0')} hint="Aprovação simulada" icon={<CheckCircle2 size={18} />} accent="#34D399" />
          <StatCard label="Realizado" value={fmtBRL(selected.budgetActual || '0')} hint="Execução real" icon={<Wallet size={18} />} accent="#FBBF24" />
        </div>

        <SectionCard title="Prestação de contas e conferência">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-line bg-card2 p-3">
              <div className="text-xs text-mute">Receitas e despesas reais</div>
              <div className="mt-2 flex items-center justify-between"><span>Receitas</span><strong className="text-ok">{fmtBRL(selected.budgetActual || '0')}</strong></div>
              <div className="mt-1 flex items-center justify-between"><span>Despesas</span><strong className="text-err">{fmtBRL((parseFloat(selected.budgetActual || '0') * 0.62).toFixed(2))}</strong></div>
            </div>
            <div className="rounded-lg border border-line bg-card2 p-3">
              <div className="text-xs text-mute">Diferença entre previsto e realizado</div>
              <div className="mt-2 text-xl font-semibold text-accent">{fmtBRL((parseFloat(selected.budgetActual || '0') - parseFloat(selected.budgetPlanned || '0')).toFixed(2))}</div>
              <div className="mt-1 text-xs text-mute">A aprovação final e consolidação são simulações apenas.</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {FINANCIAL_STATUSES.map(status => (
              <button key={status} className={`rounded-full border px-3 py-1.5 text-xs ${selected.financialStatus === status ? 'border-accent bg-card text-accent' : 'border-line text-mute hover:bg-card2'}`} onClick={() => {
                if (!canAccessFinance) return
                updateRetreatList(retreats.map(r => r.id === selected.id ? { ...r, financialStatus: status } : r))
              }}>{status}</button>
            ))}
          </div>
        </SectionCard>
      </div>
    )
  }

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={documentDraft.title ?? ''} onChange={e => setDocumentDraft({ ...documentDraft, title: e.target.value })} className={inputCls} placeholder="Título" />
          <input value={documentDraft.responsible ?? ''} onChange={e => setDocumentDraft({ ...documentDraft, responsible: e.target.value })} className={inputCls} placeholder="Responsável" />
          <select value={documentDraft.category ?? 'Programação'} onChange={e => setDocumentDraft({ ...documentDraft, category: e.target.value })} className={inputCls}>{['Programação', 'Orientações', 'Autorizações', 'Listas', 'Comprovantes', 'Relatório final'].map(v => <option key={v} value={v}>{v}</option>)}</select>
          <input type="date" value={documentDraft.date ?? ''} onChange={e => setDocumentDraft({ ...documentDraft, date: e.target.value })} className={inputCls} />
          <select value={documentDraft.access ?? 'Interno'} onChange={e => setDocumentDraft({ ...documentDraft, access: e.target.value })} className={inputCls}>{DOCUMENT_CLASS.map(v => <option key={v} value={v}>{v}</option>)}</select>
          <input value={documentDraft.file ?? 'Simulação local'} onChange={e => setDocumentDraft({ ...documentDraft, file: e.target.value })} className={inputCls} placeholder="Arquivo / registro associado" />
          <div className="md:col-span-2"><textarea value={documentDraft.description ?? ''} onChange={e => setDocumentDraft({ ...documentDraft, description: e.target.value })} rows={2} className={inputCls} placeholder="Descrição" /></div>
        </div>
        <div className="mt-3 flex justify-end"><button className={btnPrimary} onClick={addDocument}>Adicionar documento</button></div>
      </div>

      <SectionCard title="Documentos vinculados">
        <div className="space-y-3">
          {selectedDocuments.length === 0 && <EmptyState text="Nenhum documento vinculado." />}
          {selectedDocuments.map(doc => (
            <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card2 p-3">
              <div>
                <div className="font-medium">{doc.title}</div>
                <div className="text-xs text-mute">{doc.category} · {doc.responsible} · {fmtDate(doc.date) || 'Sem data'}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={doc.access} />
                <button className={btnGhost} onClick={() => updateDocumentsList(documents.filter(d => d.id !== doc.id))}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderAttendance = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Presentes" value={selectedAttendances.filter(a => a.status === 'Presente').length} hint="na lista" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Ausentes" value={selectedAttendances.filter(a => a.status === 'Ausente').length} hint="faltaram" icon={<XCircle size={18} />} />
        <StatCard label="Pendentes" value={selectedAttendances.filter(a => a.status === 'Pendente').length} hint="sem registro" icon={<CircleDashed size={18} />} />
      </div>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <select value={attendanceDraft.participantId ?? ''} onChange={e => {
            const member = selectedParticipants.find(p => p.id === e.target.value)
            setAttendanceDraft({ ...attendanceDraft, participantId: e.target.value, participantName: member?.name || attendanceDraft.participantName })
          }} className={inputCls}>
            <option value="">Selecione participante</option>
            {selectedParticipants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={attendanceDraft.status ?? 'Pendente'} onChange={e => setAttendanceDraft({ ...attendanceDraft, status: e.target.value })} className={inputCls}>
            <option value="Pendente">Pendente</option>
            <option value="Presente">Presente</option>
            <option value="Ausente">Ausente</option>
            <option value="Justificado">Justificado</option>
          </select>
          <div className="md:col-span-2"><textarea value={attendanceDraft.justification ?? ''} onChange={e => setAttendanceDraft({ ...attendanceDraft, justification: e.target.value })} rows={2} className={inputCls} placeholder="Justificativa / observação" /></div>
        </div>
        <div className="mt-3 flex justify-end"><button className={btnPrimary} onClick={addAttendance}>Registrar presença</button></div>
      </div>

      <SectionCard title="Resumo por participante">
        <div className="space-y-2">
          {selectedAttendances.length === 0 && <EmptyState text="Nenhum registro de presença." />}
          {selectedAttendances.map(row => (
            <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card2 p-3">
              <div>
                <div className="font-medium">{row.participantName}</div>
                <div className="text-xs text-mute">{row.justification || 'Sem justificativa'}</div>
              </div>
              <StatusBadge value={row.status} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderReport = () => (
    <div className="space-y-4">
      <SectionCard title="Resumo final do retiro">
        <textarea value={report?.summary ?? ''} onChange={e => setReport({ ...report, summary: e.target.value })} rows={10} className={inputCls} placeholder="Descreva atividades realizadas, presença, pendências e observações finais." />
      </SectionCard>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="mb-1 block text-xs text-mute">Participantes</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm">{participantSummary.confirmed}/{participantSummary.total} confirmados</div></div>
          <div><label className="mb-1 block text-xs text-mute">Tarefas</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm">{taskSummary.completed} concluídas · {taskSummary.pending} pendentes</div></div>
          <div><label className="mb-1 block text-xs text-mute">Prestação de contas</label><div className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm">{selected?.financialStatus || 'Em preparação'}</div></div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className={btnPrimary} onClick={() => { if (!requirePermission('concluir relatório final')) return; say('Relatório final simulado como concluído, sem apagar o histórico.'); }}>Concluir relatório</button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (tab) {
      case 'Visão geral': return renderOverview()
      case 'Cronograma': return renderSchedule()
      case 'Participantes': return renderParticipants()
      case 'Equipes': return renderTeams()
      case 'Tarefas': return renderTasks()
      case 'Logística e materiais': return renderMaterials()
      case 'Orçamento e prestação de contas': return renderBudget()
      case 'Documentos': return renderDocuments()
      case 'Presenças': return renderAttendance()
      case 'Relatório final': return renderReport()
      default: return null
    }
  }

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Retiros"
        desc="organização completa de retiros com cronograma, equipes, logística, orçamento e relatórios."
        action={
          <div className="flex gap-2">
            {selected && <button className={btnGhost} onClick={() => openRetreatForm(selected)}>Editar</button>}
            <button className={btnPrimary} onClick={() => openRetreatForm()}><Plus size={16} />Novo retiro</button>
          </div>
        }
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_2fr]">
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Search size={15} />Busca</div>
          <div className="space-y-3">
            <input value={search} onChange={e => setSearch(e.target.value)} className={inputCls} placeholder="Buscar por nome, tema ou responsável" />
            <div className="grid gap-2 sm:grid-cols-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls}><option value="">Status: todos</option>{RETREAT_STATUSES.map(value => <option key={value} value={value}>{value}</option>)}</select>
              <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className={inputCls}><option value="">Período: todos</option><option value="próximos">Próximos</option><option value="passados">Passados</option></select>
              <select value={responsibleFilter} onChange={e => setResponsibleFilter(e.target.value)} className={inputCls}><option value="">Responsável: todos</option>{responsibleOptions.map(value => <option key={value} value={value}>{value}</option>)}</select>
              <div className="rounded-lg border border-line bg-card2 px-3 py-2 text-xs text-mute flex items-center justify-center">{visibleRetreats.length} retiros</div>
            </div>
          </div>

          <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {visibleRetreats.length === 0 && <EmptyState text="Nenhum retiro encontrado." />}
            {visibleRetreats.map(retreat => (
              <button key={retreat.id} onClick={() => setSelectedId(retreat.id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === retreat.id ? 'border-accent bg-card2' : 'border-line bg-card hover:bg-card2'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{retreat.name}</div>
                  <StatusBadge value={retreat.status} />
                </div>
                <div className="mt-2 space-y-1 text-xs text-mute">
                  <div className="flex items-center gap-1"><CalendarDays size={12} />{fmtDate(retreat.startDate)} → {fmtDate(retreat.endDate)}</div>
                  <div className="flex items-center gap-1"><MapPinned size={12} />{retreat.location}</div>
                  <div className="flex items-center gap-1"><UsersRound size={12} />{retreat.responsible}</div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-mute">
                  <span>{participants.filter(p => p.retreatId === retreat.id).length} cad.</span>
                  <span>{participants.filter(p => p.retreatId === retreat.id && p.status === 'Confirmado').length} confirmados</span>
                  <span>{tasks.filter(t => t.retreatId === retreat.id && t.status !== 'Concluída').length} pend.</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card p-4">
          {selected ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-mute">Retiro em destaque</div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button className={btnGhost} onClick={() => setDeleteRetreat(selected)}><Trash2 size={14} />Cancelar</button>
                  <button className={btnPrimary} onClick={() => openRetreatForm(selected)}><Pencil size={14} />Editar</button>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                <StatusBadge value={selected.status} />
                <StatusBadge value={selected.financialStatus || 'Em preparação'} />
                <span className="rounded-full border border-line bg-card2 px-2 py-0.5 text-mute">{selected.location}</span>
                <span className="rounded-full border border-line bg-card2 px-2 py-0.5 text-mute">{selected.responsible}</span>
              </div>

              <Tabs tabs={[...RETREAT_TABS]} active={tab} onChange={(value: string) => setTab(value as (typeof RETREAT_TABS)[number])} />
              {renderTabContent()}
            </>
          ) : (
            <EmptyState text="Selecione um retiro para visualizar detalhes." />
          )}
        </div>
      </div>

      {editRetreat && (
        <Modal title={retreats.some(r => r.id === editRetreat.id) ? 'Editar retiro' : 'Novo retiro'} onClose={() => setEditRetreat(null)} wide>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2"><input value={editRetreat.name ?? ''} onChange={e => setEditRetreat({ ...editRetreat, name: e.target.value })} className={inputCls} placeholder="Nome do retiro" /></div>
            <input value={editRetreat.theme ?? ''} onChange={e => setEditRetreat({ ...editRetreat, theme: e.target.value })} className={inputCls} placeholder="Tema" />
            <input value={editRetreat.responsible ?? ''} onChange={e => setEditRetreat({ ...editRetreat, responsible: e.target.value })} className={inputCls} placeholder="Responsável geral" />
            <input type="date" value={editRetreat.startDate ?? ''} onChange={e => setEditRetreat({ ...editRetreat, startDate: e.target.value })} className={inputCls} />
            <input type="date" value={editRetreat.endDate ?? ''} onChange={e => setEditRetreat({ ...editRetreat, endDate: e.target.value })} className={inputCls} />
            <input type="time" value={editRetreat.startTime ?? ''} onChange={e => setEditRetreat({ ...editRetreat, startTime: e.target.value })} className={inputCls} />
            <input type="time" value={editRetreat.endTime ?? ''} onChange={e => setEditRetreat({ ...editRetreat, endTime: e.target.value })} className={inputCls} />
            <div className="md:col-span-2"><input value={editRetreat.location ?? ''} onChange={e => setEditRetreat({ ...editRetreat, location: e.target.value })} className={inputCls} placeholder="Local" /></div>
            <input value={editRetreat.targetAudience ?? ''} onChange={e => setEditRetreat({ ...editRetreat, targetAudience: e.target.value })} className={inputCls} placeholder="Público-alvo" />
            <input value={editRetreat.capacity ?? ''} onChange={e => setEditRetreat({ ...editRetreat, capacity: e.target.value })} className={inputCls} placeholder="Capacidade prevista" />
            <select value={editRetreat.status ?? 'Planejamento'} onChange={e => setEditRetreat({ ...editRetreat, status: e.target.value })} className={inputCls}>{RETREAT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <select value={editRetreat.financialStatus ?? 'Em preparação'} onChange={e => setEditRetreat({ ...editRetreat, financialStatus: e.target.value })} className={inputCls}>{FINANCIAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <div className="md:col-span-2"><textarea value={editRetreat.objective ?? ''} onChange={e => setEditRetreat({ ...editRetreat, objective: e.target.value })} rows={2} className={inputCls} placeholder="Objetivo" /></div>
            <div className="md:col-span-2"><textarea value={editRetreat.description ?? ''} onChange={e => setEditRetreat({ ...editRetreat, description: e.target.value })} rows={2} className={inputCls} placeholder="Descrição" /></div>
            <div className="md:col-span-2"><textarea value={editRetreat.notes ?? ''} onChange={e => setEditRetreat({ ...editRetreat, notes: e.target.value })} rows={2} className={inputCls} placeholder="Observações organizacionais autorizadas" /></div>
            <input value={editRetreat.budgetPlanned ?? '0'} onChange={e => setEditRetreat({ ...editRetreat, budgetPlanned: e.target.value })} className={inputCls} placeholder="Orçamento previsto" />
            <input value={editRetreat.budgetApproved ?? '0'} onChange={e => setEditRetreat({ ...editRetreat, budgetApproved: e.target.value })} className={inputCls} placeholder="Orçamento aprovado" />
            <input value={editRetreat.budgetActual ?? '0'} onChange={e => setEditRetreat({ ...editRetreat, budgetActual: e.target.value })} className={inputCls} placeholder="Orçamento realizado" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            {Object.keys(errors).length > 0 && <span className="mr-auto text-xs text-err">Corrija os campos marcados.</span>}
            <button className={btnGhost} onClick={() => setEditRetreat(null)}>Cancelar</button>
            <button className={btnPrimary} onClick={saveRetreatDraft}>Salvar</button>
          </div>
        </Modal>
      )}

      {deleteRetreat && (
        <ConfirmDialog
          text={`Deseja cancelar o retiro “${deleteRetreat.name}”? O histórico e os registros associados permanecerão disponíveis.`}
          confirmLabel="Cancelar retiro"
          onOk={handleCancelRetreat}
          onCancel={() => setDeleteRetreat(null)}
          danger
        />
      )}

      <Toast msg={toast} />
    </>
  )
}
