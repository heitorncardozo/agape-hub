import { useState } from 'react'
import { CheckCircle2, XCircle, Percent } from 'lucide-react'
import { useCollection, useMembers, useStoredValue } from '../services/dataService'
import { MEETINGS } from '../data/mockData'
import { Avatar, ColorBadge, btnPrimary, inputCls, PageHeader, StatCard, Toast } from '../components/ui'
import { GROUPS, subOf, subsOf } from '../data/groups'
import type { Attendance } from '../types'
const S = ['Presente', 'Ausente', 'Justificado'] as const
export default function AttendancePage() {
  const [members, membersLoading, membersError] = useMembers()
  const [meets] = useCollection('meetings', MEETINGS)
  const [all, saveAttendance, attendanceLoading, attendanceError, setAll] = useStoredValue<Attendance>('attendance', {})
  const [mid, setMid] = useState(meets[0]?.id ?? ''), [q, setQ] = useState(''), [ok, setOk] = useState(false), [g, setG] = useState(''), [sb, setSb] = useState('')
  const [saveError, setSaveError] = useState('')
  const cur = all[mid] ?? {}, active = members.filter(m => m.status !== 'Inativo')
  const p = active.filter(m => cur[m.id] === 'Presente').length, a = active.filter(m => cur[m.id] === 'Ausente').length
  const set = (id: string, s: typeof S[number]) => setAll({ ...all, [mid]: { ...cur, [id]: s } })
  return <>
    <PageHeader title="Controle de presenças" desc="Registre a presença dos participantes em cada encontro." action={<button className={btnPrimary} disabled={attendanceLoading || membersLoading} onClick={async () => {
      setSaveError('')
      try {
        await saveAttendance(all)
        setOk(true)
        setTimeout(() => setOk(false), 2200)
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : String(error))
      }
    }}>Salvar alterações</button>} />
    {(attendanceError || membersError || saveError) && <p role="alert" className="mb-4 rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm text-err">{attendanceError || membersError || saveError}</p>}
    <div className="mb-4 flex flex-wrap gap-2"><select aria-label="Encontro" value={mid} onChange={e => setMid(e.target.value)} className={inputCls + ' !w-auto'}>{meets.map(m => <option key={m.id} value={m.id}>{m.title} — {m.date.split('-').reverse().join('/')}</option>)}</select><select aria-label="Grupo" value={g} onChange={e => { setG(e.target.value); setSb('') }} className={inputCls + ' !w-auto'}><option value="">Todos os grupos</option>{Object.entries(GROUPS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select><select aria-label="Subdivisão" value={sb} onChange={e => setSb(e.target.value)} className={inputCls + ' !w-auto'}><option value="">Todas as subdivisões</option>{(g ? subsOf(g) : subsOf('cursista').concat(subsOf('servo'))).map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select><input aria-label="Buscar membro" placeholder="Buscar membro…" value={q} onChange={e => setQ(e.target.value)} className={inputCls + ' !w-auto flex-1'} /></div>
    <div className="mb-4 grid gap-4 sm:grid-cols-3"><StatCard label="Presentes" value={p} hint="marcados" icon={<CheckCircle2 size={18} />} /><StatCard label="Ausentes" value={a} hint="marcados" icon={<XCircle size={18} />} /><StatCard label="Presença" value={`${active.length ? Math.round(p / active.length * 100) : 0}%`} hint={`de ${active.length} membros`} icon={<Percent size={18} />} /></div>
    <div className="rounded-xl border border-line bg-card">{membersLoading || attendanceLoading ? <p className="p-4 text-sm text-mute">Carregando presenças do Supabase...</p> : active.filter(m => (!g || m.group === g) && (!sb || m.sub === sb) && m.name.toLowerCase().includes(q.toLowerCase())).map(m => <div key={m.id} className="flex flex-wrap items-center gap-3 border-b border-line p-3 last:border-0"><Avatar name={m.name} /><div className="min-w-0 flex-1"><div className="truncate text-sm">{m.name}</div><div className="mt-0.5"><ColorBadge label={`${GROUPS[m.group as 'servo'].label} · ${subOf(m.sub)?.label}`} color={subOf(m.sub)?.color ?? '#94A3B8'} /></div></div>
      <div role="group" aria-label={`Presença de ${m.name}`} className="flex gap-1">{S.map(s => <button key={s} aria-pressed={cur[m.id] === s} onClick={() => set(m.id, s)} className={`rounded-lg border px-3 py-1.5 text-xs transition ${cur[m.id] === s ? 'border-accent bg-card2 text-accent' : 'border-line text-mute hover:bg-card2'}`}>{cur[m.id] === s && '✓ '}{s}</button>)}</div></div>)}</div>
    <Toast msg={ok ? 'Presenças salvas no Supabase' : ''} />
  </>
}
