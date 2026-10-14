import { useCollection } from '../services/dataService'
import { MEMBERS, MEETINGS, EVENTS, TRANSACTIONS, AUDIT_LOGS } from '../data/mockData'
import { useProfile } from '../services/profileContext'
import {
  DemoBanner, PageHeader, StatCard, SectionCard, ColorBadge, fmtBRL, fmtDate, Tabs,
} from '../components/ui'
import { useState } from 'react'
import { Users, CalendarDays, DollarSign, TrendingUp, TrendingDown, CheckCircle2, BarChart3 } from 'lucide-react'
import { SUBS, GROUPS } from '../data/groups'
import type { Attendance } from '../types'
import { loadAll } from '../services/dataService'

export default function ReportsPage() {
  const { user } = useProfile()
  const [members] = useCollection('members_v2', MEMBERS)
  const [meets] = useCollection('meetings', MEETINGS)
  const [events] = useCollection('events', EVENTS)
  const [transactions] = useCollection('transactions', TRANSACTIONS)
  const att = loadAll<Attendance>('attendance', {})
  const [tab, setTab] = useState('Membros')

  /* ─── attendance stats ─── */
  const meetWithAtt = meets.filter(m => att[m.id] && Object.keys(att[m.id]).length > 0)
  const avgPresence = meetWithAtt.length === 0 ? 0 : Math.round(
    meetWithAtt.reduce((sum, m) => sum + Object.values(att[m.id]).filter(s => s === 'Presente').length, 0) / meetWithAtt.length
  )

  /* ─── financial summary ─── */
  const totalIn = transactions.filter(t => t.type === 'entrada' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalOut = transactions.filter(t => t.type === 'saída' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)

  const TABS = user.canAccessFinancial ? ['Membros', 'Encontros e Presenças', 'Financeiro', 'Auditoria'] : ['Membros', 'Encontros e Presenças']

  return (
    <>
      <DemoBanner />
      <PageHeader title="Relatórios" desc="Resumos e indicadores consolidados da comunidade." />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* ─── MEMBROS ─── */}
      {tab === 'Membros' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total de membros" value={members.length} hint="Cadastrados" icon={<Users size={18} />} />
            <StatCard label="Ativos" value={members.filter(m => m.status === 'Ativo').length} hint="Situação ativa" icon={<CheckCircle2 size={18} />} accent="#34D399" />
            <StatCard label="Visitantes" value={members.filter(m => m.status === 'Visitante').length} hint="Não confirmados" icon={<Users size={18} />} accent="#FBBF24" />
            <StatCard label="Inativos" value={members.filter(m => m.status === 'Inativo').length} hint="Desligados" icon={<Users size={18} />} accent="#94A3B8" />
          </div>

          <SectionCard title="Membros por subdivisão">
            <div className="space-y-4">
              {(['cursista', 'servo'] as const).map(gr => (
                <div key={gr}>
                  <h3 className="mb-2 text-xs font-medium text-mute">{GROUPS[gr].label}s</h3>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {SUBS.filter(s => s.group === gr).map(s => {
                      const count = members.filter(m => m.sub === s.id).length
                      const active = members.filter(m => m.sub === s.id && m.status === 'Ativo').length
                      return (
                        <div key={s.id} style={{ borderLeftColor: s.color }} className="rounded-lg border border-line border-l-4 bg-card2 p-3">
                          <ColorBadge label={s.label} color={s.color} />
                          <div className="mt-2 text-2xl font-bold">{count}</div>
                          <div className="text-xs text-mute">{active} ativos</div>
                          <div className="mt-1 h-1 rounded-full bg-card overflow-hidden">
                            <div style={{ width: `${count ? (active / count) * 100 : 0}%`, background: s.color }} className="h-full rounded-full transition-all" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─── ENCONTROS ─── */}
      {tab === 'Encontros e Presenças' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total de encontros" value={meets.length} hint="Registrados" icon={<CalendarDays size={18} />} />
            <StatCard label="Realizados" value={meets.filter(m => m.status === 'Realizado').length} hint="Concluídos" icon={<CheckCircle2 size={18} />} accent="#34D399" />
            <StatCard label="Agendados" value={meets.filter(m => m.status === 'Agendado').length} hint="A realizar" icon={<CalendarDays size={18} />} accent="#22D3EE" />
            <StatCard label="Média de presença" value={avgPresence} hint="Por encontro (registrados)" icon={<BarChart3 size={18} />} accent="#FBBF24" />
          </div>

          <SectionCard title="Encontros com presença registrada">
            {meetWithAtt.length === 0 ? <p className="text-sm text-mute">Nenhuma presença registrada ainda.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-mute border-b border-line">
                    <tr>{['Encontro', 'Data', 'Presentes', 'Ausentes', 'Justificados', '% Presença'].map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {meetWithAtt.map(m => {
                      const cur = att[m.id] ?? {}
                      const p = Object.values(cur).filter(s => s === 'Presente').length
                      const a = Object.values(cur).filter(s => s === 'Ausente').length
                      const j = Object.values(cur).filter(s => s === 'Justificado').length
                      const total = p + a + j
                      return (
                        <tr key={m.id} className="border-b border-line last:border-0">
                          <td className="px-3 py-2">{m.title}</td>
                          <td className="px-3 py-2 text-mute">{fmtDate(m.date)}</td>
                          <td className="px-3 py-2 text-ok font-medium">{p}</td>
                          <td className="px-3 py-2 text-err">{a}</td>
                          <td className="px-3 py-2 text-warn">{j}</td>
                          <td className="px-3 py-2 font-medium">{total ? Math.round((p / total) * 100) : 0}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ─── FINANCEIRO ─── */}
      {tab === 'Financeiro' && user.canAccessFinancial && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Entradas (confirmadas)" value={fmtBRL(totalIn)} hint="Caixa geral" icon={<TrendingUp size={18} />} accent="#34D399" />
            <StatCard label="Saídas (confirmadas)" value={fmtBRL(totalOut)} hint="Caixa geral" icon={<TrendingDown size={18} />} accent="#F87171" />
            <StatCard label="Saldo" value={fmtBRL(totalIn - totalOut)} hint="Real confirmado" icon={<DollarSign size={18} />} accent={(totalIn - totalOut) >= 0 ? '#34D399' : '#F87171'} />
          </div>

          <SectionCard title="Movimentações por categoria">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-mute border-b border-line">
                  <tr><th className="px-3 py-2 text-left">Categoria</th><th className="px-3 py-2 text-left">Entradas</th><th className="px-3 py-2 text-left">Saídas</th></tr>
                </thead>
                <tbody>
                  {Array.from(new Set(transactions.map(t => t.category))).map(cat => {
                    const inAmt = transactions.filter(t => t.category === cat && t.type === 'entrada' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)
                    const outAmt = transactions.filter(t => t.category === cat && t.type === 'saída' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)
                    return (
                      <tr key={cat} className="border-b border-line last:border-0">
                        <td className="px-3 py-2">{cat}</td>
                        <td className="px-3 py-2 text-ok">{fmtBRL(inAmt)}</td>
                        <td className="px-3 py-2 text-err">{fmtBRL(outAmt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Financeiro por evento">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-mute border-b border-line">
                  <tr>{['Evento', 'Entradas', 'Saídas', 'Saldo'].map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {events.map(ev => {
                    const evIn = transactions.filter(t => t.eventId === ev.id && t.type === 'entrada' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)
                    const evOut = transactions.filter(t => t.eventId === ev.id && t.type === 'saída' && t.status === 'Confirmado').reduce((s, t) => s + parseFloat(t.amount), 0)
                    return (
                      <tr key={ev.id} className="border-b border-line last:border-0">
                        <td className="px-3 py-2">{ev.title}</td>
                        <td className="px-3 py-2 text-ok">{fmtBRL(evIn)}</td>
                        <td className="px-3 py-2 text-err">{fmtBRL(evOut)}</td>
                        <td className={`px-3 py-2 font-medium ${(evIn - evOut) >= 0 ? 'text-ok' : 'text-err'}`}>{fmtBRL(evIn - evOut)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-mute">Valores por evento não são duplicados no relatório geral (a soma resulta no total do caixa geral).</p>
          </SectionCard>
        </div>
      )}

      {/* ─── AUDITORIA ─── */}
      {tab === 'Auditoria' && user.profile === 'coordenacao' && (
        <SectionCard title="Log de atividades">
          <div className="space-y-2">
            {AUDIT_LOGS.map(log => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg bg-card2 px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{log.user}</span>
                  <span className="text-mute"> {log.action} </span>
                  <span className="italic">{log.target}</span>
                </div>
                <ColorBadge label={log.module} color="#22D3EE" />
                <span className="text-xs text-mute shrink-0">{log.at}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  )
}
