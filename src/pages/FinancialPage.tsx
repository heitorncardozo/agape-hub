import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, AlertCircle, Plus, Pencil, Trash2,
  Search, CheckCircle2, Clock, FileCheck, ReceiptText,
} from 'lucide-react'
import type { Row } from '../types'
import { useCollection } from '../services/dataService'
import { useProfile } from '../services/profileContext'
import { TRANSACTIONS, EVENTS, PAYABLES, RECEIVABLES, BUDGETS, ACCOUNTABILITY, DONATIONS } from '../data/mockData'
import {
  btnGhost, btnPrimary, ColorBadge, ConfirmDialog, DemoBanner, EmptyState,
  inputCls, Modal, PageHeader, StatCard, StatusBadge, Tabs, Toast, fmtBRL, fmtDate, SectionCard,
} from '../components/ui'
import { Navigate } from 'react-router-dom'

const TX_TYPES = ['entrada', 'saída']
const TX_CATS = ['Dízimo', 'Oferta', 'Doação', 'Locação', 'Material', 'Alimentação', 'Transporte', 'Serviços', 'Outro']
const TX_STATUSES = ['Pendente', 'Confirmado', 'Aprovado']
const TX_METHODS = ['PIX', 'Dinheiro', 'Transferência', 'Cartão', 'Outro']
const ACCOUNTABILITY_STATUSES = ['Registro', 'Conferência', 'Aprovado', 'Consolidado']

const emptyTx = (): Row => ({
  id: crypto.randomUUID(), description: '', type: 'entrada', category: 'Oferta',
  amount: '', date: new Date().toISOString().slice(0, 10),
  status: 'Pendente', eventId: '', paymentMethod: 'PIX', receipt: '',
})

export default function FinancialPage() {
  const { user } = useProfile()

  if (!user.canAccessFinancial) return <Navigate to="/" replace />

  const [transactions, upsertTx, removeTx] = useCollection('transactions', TRANSACTIONS)
  const [payables] = useCollection('payables', PAYABLES)
  const [receivables] = useCollection('receivables', RECEIVABLES)
  const [budgets] = useCollection('budgets', BUDGETS)
  const [accountability] = useCollection('accountability', ACCOUNTABILITY)
  const [donations] = useCollection('donations', DONATIONS)
  const [events] = useCollection('events', EVENTS)

  const [tab, setTab] = useState('Visão Geral')
  const [q, setQ] = useState(''), [typeFilter, setTypeFilter] = useState(''), [statusFilter, setStatusFilter] = useState('')
  const [edit, setEdit] = useState<Row | null>(null), [del, setDel] = useState<Row | null>(null)
  const [toast, setToast] = useState(''), [errs, setErrs] = useState<Record<string, string>>({})

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  /* ── computed ── */
  const confirmed = (type: string) => transactions
    .filter(t => t.type === type && t.status === 'Confirmado')
    .reduce((s, t) => s + parseFloat(t.amount || '0'), 0)
  const totalIn = confirmed('entrada')
  const totalOut = confirmed('saída')
  const balance = totalIn - totalOut
  const pendingCount = transactions.filter(t => t.status === 'Pendente').length

  const shownTx = transactions.filter(t =>
    (!typeFilter || t.type === typeFilter) &&
    (!statusFilter || t.status === statusFilter) &&
    (t.description + t.category).toLowerCase().includes(q.toLowerCase())
  ).sort((a, b) => b.date.localeCompare(a.date))

  const getEvent = (id: string) => events.find(e => e.id === id)?.title ?? ''

  /* ── budget helpers ── */
  const totalBudgetPlanned = (eid: string) => budgets.filter(b => b.eventId === eid).reduce((s, b) => s + parseFloat(b.planned || '0'), 0)
  const totalBudgetActual = (eid: string) => budgets.filter(b => b.eventId === eid).reduce((s, b) => s + parseFloat(b.actual || '0'), 0)
  /* Event transactions (not duplicated in general cash — they share the same array but are segmented by eventId) */
  const eventTxTotal = (eid: string, type: string) => transactions
    .filter(t => t.eventId === eid && t.type === type && t.status === 'Confirmado')
    .reduce((s, t) => s + parseFloat(t.amount || '0'), 0)

  /* ── submit ── */
  const submit = () => {
    if (!edit) return
    const er: Record<string, string> = {}
    if (!edit.description?.trim()) er.description = 'Campo obrigatório'
    if (!edit.amount || parseFloat(edit.amount) <= 0) er.amount = 'Valor inválido'
    setErrs(er); if (Object.keys(er).length) return
    upsertTx(edit); setEdit(null); say('Transação salva localmente')
  }

  const TABS = ['Visão Geral', 'Caixa Geral', 'Por Evento', 'Contas', 'Orçamentos', 'Prestação de Contas', 'Doações']

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Financeiro"
        desc="Controle financeiro da comunidade — coordenação e tesouraria."
        action={<button className={btnPrimary} onClick={() => { setErrs({}); setEdit(emptyTx()) }}><Plus size={16} />Nova movimentação</button>}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* ─── VISÃO GERAL ─── */}
      {tab === 'Visão Geral' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Saldo real (confirmado)" value={fmtBRL(balance)} hint="Entradas − Saídas confirmadas" icon={<DollarSign size={18} />} accent={balance >= 0 ? '#34D399' : '#F87171'} />
            <StatCard label="Entradas confirmadas" value={fmtBRL(totalIn)} hint="Caixa geral" icon={<TrendingUp size={18} />} accent="#34D399" />
            <StatCard label="Saídas confirmadas" value={fmtBRL(totalOut)} hint="Caixa geral" icon={<TrendingDown size={18} />} accent="#F87171" />
            <StatCard label="Pendentes de conferência" value={pendingCount} hint="Aguardando revisão" icon={<AlertCircle size={18} />} accent="#FBBF24" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Contas a pagar" value={fmtBRL(payables.filter(p => p.status === 'Pendente').reduce((s, p) => s + parseFloat(p.amount), 0))} hint="Valores pendentes" icon={<Clock size={18} />} accent="#F87171" />
            <StatCard label="Contas a receber" value={fmtBRL(receivables.filter(r => r.status === 'Pendente').reduce((s, r) => s + parseFloat(r.amount), 0))} hint="Valores a receber" icon={<CheckCircle2 size={18} />} accent="#34D399" />
            <StatCard label="Total de doações" value={fmtBRL(donations.filter(d => d.status === 'Confirmado').reduce((s, d) => s + parseFloat(d.amount), 0))} hint="Confirmadas" icon={<ReceiptText size={18} />} accent="#22D3EE" />
          </div>

          <SectionCard title="Movimentações recentes">
            <div className="space-y-2">
              {transactions.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg bg-card2 px-3 py-2">
                  <span className={`text-lg ${t.type === 'entrada' ? 'text-ok' : 'text-err'}`}>{t.type === 'entrada' ? '↑' : '↓'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{t.description}</div>
                    <div className="text-xs text-mute">{fmtDate(t.date)} · {t.category}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${t.type === 'entrada' ? 'text-ok' : 'text-err'}`}>{t.type === 'entrada' ? '+' : '-'}{fmtBRL(t.amount)}</div>
                    <StatusBadge value={t.status} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─── CAIXA GERAL ─── */}
      {tab === 'Caixa Geral' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-48 flex-1">
              <Search size={15} className="absolute left-3 top-3 text-mute" />
              <input placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} className={inputCls + ' pl-9'} />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={inputCls + ' !w-auto'}>
              <option value="">Tipo: todos</option>
              {TX_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls + ' !w-auto'}>
              <option value="">Situação: todas</option>
              {TX_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto rounded-xl border border-line bg-card">
            {shownTx.length === 0 ? <EmptyState text="Nenhuma movimentação." /> : (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-line text-xs text-mute">
                  <tr>{['Descrição', 'Tipo', 'Categoria', 'Valor', 'Data', 'Situação', 'Evento', 'Ações'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {shownTx.map(t => (
                    <tr key={t.id} className="border-b border-line last:border-0 hover:bg-card2/50">
                      <td className="px-4 py-3">{t.description}</td>
                      <td className="px-4 py-3"><ColorBadge label={t.type} color={t.type === 'entrada' ? '#34D399' : '#F87171'} /></td>
                      <td className="px-4 py-3 text-mute">{t.category}</td>
                      <td className={`px-4 py-3 font-medium ${t.type === 'entrada' ? 'text-ok' : 'text-err'}`}>{t.type === 'entrada' ? '+' : '-'}{fmtBRL(t.amount)}</td>
                      <td className="px-4 py-3 text-mute">{fmtDate(t.date)}</td>
                      <td className="px-4 py-3"><StatusBadge value={t.status} /></td>
                      <td className="px-4 py-3 text-xs text-mute">{getEvent(t.eventId) || '—'}</td>
                      <td className="px-4 py-3">
                        <button aria-label="Editar" className="rounded p-2 hover:bg-card2" onClick={() => { setErrs({}); setEdit(t) }}><Pencil size={14} /></button>
                        <button aria-label="Excluir" className="rounded p-2 text-err hover:bg-card2" onClick={() => setDel(t)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ─── POR EVENTO ─── */}
      {tab === 'Por Evento' && (
        <div className="space-y-4">
          <p className="text-xs text-mute">Valores por evento são segmentados das movimentações gerais. Não há duplicidade entre os relatórios.</p>
          {events.map(ev => {
            const evIn = eventTxTotal(ev.id, 'entrada')
            const evOut = eventTxTotal(ev.id, 'saída')
            const planned = totalBudgetPlanned(ev.id)
            const actual = totalBudgetActual(ev.id)
            return (
              <SectionCard key={ev.id} title={ev.title}>
                <div className="grid gap-3 sm:grid-cols-4 mb-3">
                  <StatCard label="Entradas" value={fmtBRL(evIn)} hint="Confirmadas" icon={<TrendingUp size={15} />} accent="#34D399" />
                  <StatCard label="Saídas" value={fmtBRL(evOut)} hint="Confirmadas" icon={<TrendingDown size={15} />} accent="#F87171" />
                  <StatCard label="Orç. previsto" value={fmtBRL(planned)} hint="Total planejado" icon={<FileCheck size={15} />} accent="#22D3EE" />
                  <StatCard label="Orç. executado" value={fmtBRL(actual)} hint="Total realizado" icon={<DollarSign size={15} />} accent="#FBBF24" />
                </div>
                <div className="space-y-1">
                  {transactions.filter(t => t.eventId === ev.id).map(t => (
                    <div key={t.id} className="flex items-center gap-2 rounded bg-card2 px-3 py-2 text-xs">
                      <span className={t.type === 'entrada' ? 'text-ok' : 'text-err'}>{t.type === 'entrada' ? '↑' : '↓'}</span>
                      <span className="flex-1">{t.description}</span>
                      <span className={`font-medium ${t.type === 'entrada' ? 'text-ok' : 'text-err'}`}>{fmtBRL(t.amount)}</span>
                      <StatusBadge value={t.status} />
                    </div>
                  ))}
                  {transactions.filter(t => t.eventId === ev.id).length === 0 && <p className="text-xs text-mute">Sem movimentações vinculadas.</p>}
                </div>
              </SectionCard>
            )
          })}
        </div>
      )}

      {/* ─── CONTAS ─── */}
      {tab === 'Contas' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Contas a Pagar">
            <div className="space-y-2">
              {payables.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg bg-card2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{p.description}</div>
                    <div className="text-xs text-mute">{p.supplier} · Vence {fmtDate(p.dueDate)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-err">{fmtBRL(p.amount)}</div>
                    <StatusBadge value={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Contas a Receber">
            <div className="space-y-2">
              {receivables.map(r => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg bg-card2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{r.description}</div>
                    <div className="text-xs text-mute">{r.payer} · Vence {fmtDate(r.dueDate)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-ok">{fmtBRL(r.amount)}</div>
                    <StatusBadge value={r.status} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─── ORÇAMENTOS ─── */}
      {tab === 'Orçamentos' && (
        <div className="space-y-4">
          {events.filter(ev => budgets.some(b => b.eventId === ev.id)).map(ev => (
            <SectionCard key={ev.id} title={`Orçamento — ${ev.title}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-mute border-b border-line">
                    <tr>{['Categoria', 'Previsto', 'Aprovado', 'Realizado', 'Situação'].map(h => <th key={h} className="px-3 py-2 font-medium text-left">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {budgets.filter(b => b.eventId === ev.id).map(b => (
                      <tr key={b.id} className="border-b border-line last:border-0">
                        <td className="px-3 py-2">{b.category}</td>
                        <td className="px-3 py-2 text-mute">{fmtBRL(b.planned)}</td>
                        <td className="px-3 py-2">{fmtBRL(b.approved)}</td>
                        <td className="px-3 py-2 font-medium">{fmtBRL(b.actual)}</td>
                        <td className="px-3 py-2"><StatusBadge value={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-line text-sm font-medium">
                    <tr>
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-mute">{fmtBRL(totalBudgetPlanned(ev.id))}</td>
                      <td className="px-3 py-2">—</td>
                      <td className="px-3 py-2">{fmtBRL(totalBudgetActual(ev.id))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="mt-2 text-xs text-mute">Orçamentos são separados das movimentações reais e não geram duplicidade no caixa geral.</p>
            </SectionCard>
          ))}
        </div>
      )}

      {/* ─── PRESTAÇÃO DE CONTAS ─── */}
      {tab === 'Prestação de Contas' && (
        <div className="space-y-4">
          <p className="text-xs text-mute">Estados: Registro → Conferência → Aprovado → Consolidado. Apenas coordenação pode aprovar e consolidar.</p>
          {accountability.map(ac => {
            const ev = events.find(e => e.id === ac.eventId)
            return (
              <div key={ac.id} className="rounded-xl border border-line bg-card p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{ac.description}</h3>
                    <p className="text-xs text-mute">{ev?.title} · Enviado por {ac.submittedBy} em {fmtDate(ac.submittedAt)}</p>
                  </div>
                  <StatusBadge value={ac.status} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3 mb-3">
                  <div className="rounded-lg bg-card2 p-3">
                    <div className="text-xs text-mute">Total de despesas</div>
                    <div className="font-semibold text-err">{fmtBRL(ac.totalExpenses)}</div>
                  </div>
                  <div className="rounded-lg bg-card2 p-3">
                    <div className="text-xs text-mute">Total de comprovantes</div>
                    <div className="font-semibold text-ok">{fmtBRL(ac.totalReceipts)}</div>
                  </div>
                  <div className="rounded-lg bg-card2 p-3">
                    <div className="text-xs text-mute">Diferença</div>
                    <div className={`font-semibold ${parseFloat(ac.totalReceipts) >= parseFloat(ac.totalExpenses) ? 'text-ok' : 'text-err'}`}>
                      {fmtBRL((parseFloat(ac.totalReceipts) - parseFloat(ac.totalExpenses)).toString())}
                    </div>
                  </div>
                </div>
                {ac.notes && <p className="text-xs text-mute italic">{ac.notes}</p>}
                {user.profile === 'coordenacao' && ac.status !== 'Consolidado' && (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    {ACCOUNTABILITY_STATUSES.indexOf(ac.status) < ACCOUNTABILITY_STATUSES.length - 1 && (
                      <button className={btnPrimary + ' !py-1 text-xs'}>
                        Avançar para {ACCOUNTABILITY_STATUSES[ACCOUNTABILITY_STATUSES.indexOf(ac.status) + 1]}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── DOAÇÕES ─── */}
      {tab === 'Doações' && (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total doações" value={fmtBRL(donations.reduce((s, d) => s + parseFloat(d.amount), 0))} hint="Todas" icon={<ReceiptText size={18} />} />
            <StatCard label="Confirmadas" value={fmtBRL(donations.filter(d => d.status === 'Confirmado').reduce((s, d) => s + parseFloat(d.amount), 0))} hint="Verificadas" icon={<CheckCircle2 size={18} />} accent="#34D399" />
            <StatCard label="Nº de doadores" value={donations.length} hint="Registros" icon={<DollarSign size={18} />} accent="#22D3EE" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-line bg-card">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-line text-xs text-mute">
                <tr>{['Doador', 'Campanha', 'Valor', 'Data', 'Método', 'Situação'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id} className="border-b border-line last:border-0 hover:bg-card2/50">
                    <td className="px-4 py-3">{d.donor}</td>
                    <td className="px-4 py-3 text-mute">{d.campaign}</td>
                    <td className="px-4 py-3 font-medium text-ok">{fmtBRL(d.amount)}</td>
                    <td className="px-4 py-3 text-mute">{fmtDate(d.date)}</td>
                    <td className="px-4 py-3 text-mute">{d.method}</td>
                    <td className="px-4 py-3"><StatusBadge value={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── MODAL NOVA TRANSAÇÃO ─── */}
      {edit && (
        <Modal title={transactions.some(t => t.id === edit.id) ? 'Editar movimentação' : 'Nova movimentação'} onClose={() => setEdit(null)} wide>
          <div className="space-y-3">
            <div>
              <label htmlFor="tx-desc" className="mb-1 block text-sm">Descrição *</label>
              <input id="tx-desc" className={inputCls + (errs.description ? ' !border-err' : '')} value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} />
              {errs.description && <p className="mt-1 text-xs text-err">⚠ {errs.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tx-type" className="mb-1 block text-sm">Tipo *</label>
                <select id="tx-type" className={inputCls} value={edit.type} onChange={e => setEdit({ ...edit, type: e.target.value })}>
                  {TX_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="tx-cat" className="mb-1 block text-sm">Categoria</label>
                <select id="tx-cat" className={inputCls} value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })}>
                  {TX_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tx-amount" className="mb-1 block text-sm">Valor (R$) *</label>
                <input id="tx-amount" type="number" step="0.01" className={inputCls + (errs.amount ? ' !border-err' : '')} value={edit.amount} onChange={e => setEdit({ ...edit, amount: e.target.value })} />
                {errs.amount && <p className="mt-1 text-xs text-err">⚠ {errs.amount}</p>}
              </div>
              <div>
                <label htmlFor="tx-date" className="mb-1 block text-sm">Data</label>
                <input id="tx-date" type="date" className={inputCls} value={edit.date} onChange={e => setEdit({ ...edit, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tx-method" className="mb-1 block text-sm">Método de pagamento</label>
                <select id="tx-method" className={inputCls} value={edit.paymentMethod} onChange={e => setEdit({ ...edit, paymentMethod: e.target.value })}>
                  {TX_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="tx-status" className="mb-1 block text-sm">Situação</label>
                <select id="tx-status" className={inputCls} value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
                  {TX_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="tx-event" className="mb-1 block text-sm">Evento vinculado (opcional)</label>
              <select id="tx-event" className={inputCls} value={edit.eventId} onChange={e => setEdit({ ...edit, eventId: e.target.value })}>
                <option value="">Caixa geral (sem evento)</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
            <p className="rounded-lg border border-line bg-card2 px-3 py-2 text-xs text-mute">
              ⚠ Comprovantes são conferidos manualmente nesta versão. Nenhum arquivo é enviado a um servidor.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button>
              <button className={btnPrimary} onClick={submit}>Salvar</button>
            </div>
          </div>
        </Modal>
      )}

      {del && <ConfirmDialog text={`Excluir "${del.description}"?`} onCancel={() => setDel(null)} onOk={() => { removeTx(del.id); setDel(null); say('Transação excluída') }} />}
      <Toast msg={toast} />
    </>
  )
}
