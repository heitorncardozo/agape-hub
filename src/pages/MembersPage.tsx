import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Users, GraduationCap, HeartHandshake, CalendarPlus2 } from 'lucide-react'
import type { Row } from '../types'
import { loadAll, saveAll, useCollection } from '../services/dataService'
import { MEMBERS, RETREATS } from '../data/mockData'
import { GROUPS, subOf, subsOf } from '../data/groups'
import { useProfile } from '../services/profileContext'
import {
  Avatar, btnGhost, btnPrimary, ColorBadge, ConfirmDialog, DemoBanner,
  EmptyState, inputCls, Modal, PageHeader, StatCard, StatusBadge, Toast,
} from '../components/ui'

const empty = (): Row => ({
  id: crypto.randomUUID(), name: '', group: 'cursista', sub: '', phone: '', birth: '', joined: '', status: 'Ativo',
})
const REQ: [string, string][] = [
  ['name', 'Nome completo'], ['group', 'Grupo'], ['sub', 'Subdivisão'],
  ['phone', 'Telefone'], ['birth', 'Data de nascimento'], ['joined', 'Data de entrada'],
]

export default function MembersPage() {
  const { user } = useProfile()
  const navigate = useNavigate()
  const [items, upsert, remove] = useCollection('members_v2', MEMBERS)
  const [q, setQ] = useState(''), [g, setG] = useState(''), [sb, setSb] = useState(''), [page, setPage] = useState(0)
  const [edit, setEdit] = useState<Row | null>(null), [del, setDel] = useState<Row | null>(null), [retreatAction, setRetreatAction] = useState<Row | null>(null)
  const [toast, setToast] = useState(''), [errs, setErrs] = useState<Record<string, string>>({})

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const handleSendToRetreat = (member: Row, retreatId: string) => {
    const retreat = RETREATS.find(item => item.id === retreatId)
    if (!retreat) return

    const participants = loadAll<Row[]>('retreat_participants', [])
    const existing = participants.find(item => item.retreatId === retreat.id && item.memberId === member.id)

    const next = existing
      ? participants.map(item => item.id === existing.id ? { ...item, status: 'Confirmado', group: member.group, notes: 'Confirmado a partir da aba de Membros.' } : item)
      : [...participants, {
          id: crypto.randomUUID(),
          retreatId: retreat.id,
          memberId: member.id,
          name: member.name,
          origin: member.group === 'cursista' ? 'Cursista' : 'Servo',
          group: member.group,
          status: 'Confirmado',
          email: '',
          phone: member.phone,
          notes: 'Confirmado a partir da aba de Membros.',
        }]

    saveAll('retreat_participants', next)
    setRetreatAction(null)
    say(`${member.name} foi confirmado no retiro ${retreat.name}.`)
    navigate('/retiros', { state: { openRetreatId: retreat.id } })
  }

  // Liderança só vê suas subdivisões
  const visibleItems = user.profile === 'lideranca' && user.subs.length
    ? items.filter(m => user.subs.includes(m.sub))
    : items

  const shown = visibleItems
    .filter(m => (!g || m.group === g) && (!sb || m.sub === sb) && m.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const pages = Math.max(1, Math.ceil(shown.length / 8)), cur = shown.slice(page * 8, page * 8 + 8)

  const submit = (e: FormEvent) => {
    e.preventDefault(); if (!edit) return
    const er: Record<string, string> = {}
    REQ.forEach(([k]) => { if (!edit[k]?.trim()) er[k] = 'Campo obrigatório' })
    if (edit.sub && subOf(edit.sub)?.group !== edit.group) er.sub = 'Subdivisão não pertence ao grupo selecionado'
    setErrs(er); if (Object.keys(er).length) return
    upsert(edit); setEdit(null); say('Membro salvo localmente')
  }

  const set = (k: string, v: string) =>
    setEdit(p => p && { ...p, [k]: v, ...(k === 'group' && subOf(p.sub)?.group !== v ? { sub: '' } : {}) })

  const fld = (k: string, label: string, type = 'text') => (
    <div key={k}>
      <label htmlFor={k} className="mb-1 block text-sm">{label} *</label>
      <input id={k} type={type} aria-invalid={!!errs[k]}
        className={inputCls + (errs[k] ? ' !border-err' : '')}
        value={edit![k]} onChange={e => set(k, e.target.value)} />
      {errs[k] && <p className="mt-1 text-xs text-err">⚠ {errs[k]}</p>}
    </div>
  )

  const canEdit = user.profile !== 'membro'

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Membros"
        desc={user.profile === 'lideranca' ? `Membros das suas subdivisões (${user.subs.join(', ')})` : 'Gerencie cursistas e servos da comunidade.'}
        action={canEdit ? <button className={btnPrimary} onClick={() => { setErrs({}); setEdit(empty()) }}><Plus size={16} aria-hidden />Adicionar membro</button> : undefined}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={visibleItems.length} hint="Cadastrados" icon={<Users size={18} />} />
        <StatCard label="Cursistas" value={visibleItems.filter(m => m.group === 'cursista').length} hint="5 subdivisões" icon={<GraduationCap size={18} />} />
        <StatCard label="Servos" value={visibleItems.filter(m => m.group === 'servo').length} hint="5 subdivisões" icon={<HeartHandshake size={18} />} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search size={15} className="absolute left-3 top-3 text-mute" aria-hidden />
          <input aria-label="Buscar por nome" placeholder="Buscar por nome…" value={q}
            onChange={e => { setQ(e.target.value); setPage(0) }} className={inputCls + ' pl-9'} />
        </div>
        <select aria-label="Grupo" value={g} onChange={e => { setG(e.target.value); setSb(''); setPage(0) }} className={inputCls + ' !w-auto'}>
          <option value="">Todos os grupos</option>
          {Object.entries(GROUPS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select aria-label="Subdivisão" value={sb} onChange={e => { setSb(e.target.value); setPage(0) }} className={inputCls + ' !w-auto'}>
          <option value="">Todas as subdivisões</option>
          {(g ? subsOf(g) : [...subsOf('cursista'), ...subsOf('servo')])
            .filter(s => user.profile !== 'lideranca' || user.subs.length === 0 || user.subs.includes(s.id))
            .map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select aria-label="Situação" onChange={e => { setPage(0) }} className={inputCls + ' !w-auto'}>
          <option value="">Todas as situações</option>
          {['Ativo', 'Visitante', 'Inativo'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        {cur.length === 0 ? <EmptyState text="Nenhum membro encontrado." /> : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-mute">
              <tr>{['Nome', 'Grupo', 'Subdivisão', 'Telefone', 'Situação', 'Ações'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {cur.map(m => {
                const s = subOf(m.sub)
                return (
                  <tr key={m.id} className="border-b border-line last:border-0 hover:bg-card2/50">
                    <td className="px-4 py-3"><span className="flex items-center gap-3"><Avatar name={m.name} />{m.name}</span></td>
                    <td className="px-4 py-3"><ColorBadge label={GROUPS[m.group as 'servo']?.label ?? m.group} color={GROUPS[m.group as 'servo']?.color ?? '#94A3B8'} /></td>
                    <td className="px-4 py-3">{s && <ColorBadge label={s.label} color={s.color} />}</td>
                    <td className="px-4 py-3">{m.phone}</td>
                    <td className="px-4 py-3"><StatusBadge value={m.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button aria-label={`Enviar ${m.name} para o retiro`} className="rounded p-2 hover:bg-card2" title="Confirmar no retiro" onClick={() => setRetreatAction(m)}><CalendarPlus2 size={15} /></button>
                        {canEdit && <>
                          <button aria-label={`Editar ${m.name}`} className="rounded p-2 hover:bg-card2" onClick={() => { setErrs({}); setEdit(m) }}><Pencil size={15} /></button>
                          <button aria-label={`Excluir ${m.name}`} className="rounded p-2 text-err hover:bg-card2" onClick={() => setDel(m)}><Trash2 size={15} /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-mute">
        <span>{shown.length} resultado(s)</span>
        <span className="flex items-center gap-2">
          <button className={btnGhost + ' !px-3 !py-1'} disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
          {page + 1}/{pages}
          <button className={btnGhost + ' !px-3 !py-1'} disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Próxima</button>
        </span>
      </div>

      {edit && (
        <Modal title={items.some(i => i.id === edit.id) ? 'Editar membro' : 'Adicionar membro'} onClose={() => setEdit(null)}>
          <form onSubmit={submit} noValidate className="space-y-3">
            {fld('name', 'Nome completo')}
            <div>
              <label htmlFor="group" className="mb-1 block text-sm">Grupo *</label>
              <select id="group" className={inputCls} value={edit.group} onChange={e => set('group', e.target.value)}>
                {Object.entries(GROUPS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sub" className="mb-1 block text-sm">Subdivisão *</label>
              <select id="sub" aria-invalid={!!errs.sub} className={inputCls + (errs.sub ? ' !border-err' : '')} value={edit.sub} onChange={e => set('sub', e.target.value)}>
                <option value="">Selecione…</option>
                {subsOf(edit.group).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              {errs.sub && <p className="mt-1 text-xs text-err">⚠ {errs.sub}</p>}
            </div>
            {fld('phone', 'Telefone')}
            {fld('birth', 'Data de nascimento', 'date')}
            {fld('joined', 'Data de entrada', 'date')}
            <div>
              <label htmlFor="status" className="mb-1 block text-sm">Situação</label>
              <select id="status" className={inputCls} value={edit.status} onChange={e => set('status', e.target.value)}>
                {['Ativo', 'Visitante', 'Inativo'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button>
              <button className={btnPrimary}>Salvar</button>
            </div>
          </form>
        </Modal>
      )}
      {retreatAction && (
        <Modal title={`Confirmar ${retreatAction.name} no retiro`} onClose={() => setRetreatAction(null)}>
          <div className="space-y-3">
            {RETREATS.length === 0 ? <EmptyState text="Nenhum retiro cadastrado." /> : RETREATS.map(retreat => (
              <button key={retreat.id} type="button" className="w-full rounded-xl border border-line bg-card2 p-3 text-left transition hover:border-accent hover:bg-card" onClick={() => handleSendToRetreat(retreatAction, retreat.id)}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{retreat.name}</div>
                    <div className="text-xs text-mute">{retreat.startDate} · {retreat.location}</div>
                  </div>
                  <StatusBadge value={retreat.status} />
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}
      {del && <ConfirmDialog text={`Excluir "${del.name}"? Esta ação não pode ser desfeita.`} onCancel={() => setDel(null)} onOk={() => { remove(del.id); setDel(null); say('Membro excluído') }} />}
      <Toast msg={toast} />
    </>
  )
}
