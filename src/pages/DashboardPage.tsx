import {
  Users, CheckCircle2, CalendarDays, MapPin, GraduationCap, HeartHandshake,
  DollarSign, CalendarCheck, TrendingUp, TrendingDown, AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCollection, loadAll } from '../services/dataService'
import { MEMBERS, MEETINGS, EVENTS, TRANSACTIONS } from '../data/mockData'
import { SUBS, GROUPS } from '../data/groups'
import { btnPrimary, ColorBadge, PageHeader, StatCard, StatusBadge, fmtBRL, fmtDate } from '../components/ui'
import { useProfile } from '../services/profileContext'
import type { Attendance } from '../types'

export default function DashboardPage() {
  const { user } = useProfile()
  const [members] = useCollection('members_v2', MEMBERS)
  const [meets] = useCollection('meetings', MEETINGS)
  const [events] = useCollection('events', EVENTS)
  const [transactions] = useCollection('transactions', TRANSACTIONS)
  const att = loadAll<Attendance>('attendance', {})

  const done = meets.filter(m => m.status === 'Realizado').sort((a, b) => b.date.localeCompare(a.date))[0]
  const present = done ? Object.values(att[done.id] ?? {}).filter(s => s === 'Presente').length : 0
  const next = meets.filter(m => m.status === 'Agendado').sort((a, b) => a.date.localeCompare(b.date))

  const myMembers = user.profile === 'lideranca' && user.subs.length
    ? members.filter(m => user.subs.includes(m.sub))
    : members
  const myEvents = events.slice(0, 3)

  const totalIn = transactions.filter(t => t.type === 'entrada' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalOut = transactions.filter(t => t.type === 'saída' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)
  const pending = transactions.filter(t => t.status === 'Pendente').length

  return (
    <>
      <PageHeader
        title={`Olá, ${user.name.split(' ')[0]}!`}
        desc={`${user.role} — Acompanhe o que acontece na comunidade Ágape.`}
        action={<Link to="/encontros" className={btnPrimary}><CalendarDays size={16} aria-hidden />+ Novo encontro</Link>}
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={user.profile === 'lideranca' ? 'Membros da subdivisão' : 'Total de membros'} value={myMembers.length} hint="Cursistas e servos" icon={<Users size={18} />} />
        <StatCard label="Cursistas" value={myMembers.filter(m => m.group === 'cursista').length} hint="5 subdivisões" icon={<GraduationCap size={18} />} />
        <StatCard label="Servos" value={myMembers.filter(m => m.group === 'servo').length} hint="5 subdivisões" icon={<HeartHandshake size={18} />} />
        <StatCard label="Presenças – último encontro" value={present} hint={done ? `${done.title} · ${fmtDate(done.date)}` : 'Sem encontros'} icon={<CheckCircle2 size={18} />} />
      </div>

      {/* Financial quick view (only for authorized) */}
      {user.canAccessFinancial && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Entradas confirmadas" value={fmtBRL(totalIn)} hint="Caixa geral" icon={<TrendingUp size={18} />} accent="#34D399" />
          <StatCard label="Saídas confirmadas" value={fmtBRL(totalOut)} hint="Caixa geral" icon={<TrendingDown size={18} />} accent="#F87171" />
          <StatCard label="Transações pendentes" value={pending} hint="Aguardando conferência" icon={<AlertCircle size={18} />} accent="#FBBF24" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subdivisões */}
        {user.profile !== 'membro' && (
          <section className="rounded-xl border border-line bg-card p-4">
            <h2 className="mb-3 font-medium">Subdivisões</h2>
            {(['cursista', 'servo'] as const).map(gr => (
              <div key={gr} className="mb-3 last:mb-0">
                <div className="mb-2 text-xs text-mute">{GROUPS[gr].label}s</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                  {SUBS.filter(s => s.group === gr && (user.profile !== 'lideranca' || user.subs.length === 0 || user.subs.includes(s.id))).map(s => (
                    <div key={s.id} style={{ borderLeftColor: s.color }} className="rounded-lg border border-line border-l-4 bg-card2 p-3">
                      <ColorBadge label={s.label} color={s.color} />
                      <div className="mt-2 text-xl font-semibold">{members.filter(m => m.sub === s.id).length}</div>
                      <div className="text-xs text-mute">membros</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Próximos encontros */}
        <section className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-3 font-medium">Próximos encontros</h2>
          <ul className="space-y-3">
            {next.slice(0, 4).map(m => (
              <li key={m.id} className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-card2 text-sm font-semibold text-accent">{fmtDate(m.date).slice(0, 5)}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{m.title}</div>
                  <div className="flex items-center gap-1 text-xs text-mute"><MapPin size={12} aria-hidden />{m.time} · {m.place}</div>
                </div>
                <StatusBadge value={m.status} />
              </li>
            ))}
            {next.length === 0 && <li className="text-sm text-mute">Nenhum encontro agendado.</li>}
          </ul>
        </section>

        {/* Eventos recentes */}
        <section className="rounded-xl border border-line bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Eventos</h2>
            <Link to="/eventos" className="text-xs text-accent hover:underline">Ver todos</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {myEvents.map(ev => (
              <div key={ev.id} className="rounded-lg border border-line bg-card2 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <CalendarCheck size={14} className="text-accent shrink-0" />
                  <span className="truncate text-sm font-medium">{ev.title}</span>
                </div>
                <div className="text-xs text-mute">{fmtDate(ev.date)}</div>
                <div className="mt-2"><StatusBadge value={ev.status} /></div>
                {user.canAccessFinancial && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-mute">
                    <DollarSign size={12} /> Orç. {fmtBRL(ev.budget)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
