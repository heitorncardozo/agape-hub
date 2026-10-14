import { useEffect, useState, type ReactNode } from 'react'
import { X, Inbox } from 'lucide-react'

export const inputCls = 'w-full rounded-lg border border-line bg-card2 px-3 py-2 text-sm text-fg placeholder:text-mute focus:border-accent focus:outline-none transition'
export const btnPrimary = 'inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:opacity-90 transition'
export const btnGhost = 'inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:bg-card2 transition disabled:opacity-40'
export const btnDanger = 'inline-flex items-center gap-2 rounded-lg bg-err px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition'

export const Avatar = ({ name, size = 8 }: { name: string; size?: number }) =>
  <span aria-hidden className={`grid h-${size} w-${size} shrink-0 place-items-center rounded-full bg-card2 border border-line text-xs font-medium text-accent`}>{name.split(' ').slice(0, 2).map(s => s[0]).join('')}</span>

const tone: Record<string, string> = {
  Ativo: 'text-ok', Presente: 'text-ok', Realizado: 'text-ok', Concluído: 'text-ok',
  Confirmado: 'text-ok', Aprovado: 'text-ok', Consolidado: 'text-ok', Pago: 'text-ok', Recebido: 'text-ok',
  Normal: 'text-mute', Arquivado: 'text-mute', Inativo: 'text-mute',
  Visitante: 'text-warn', Importante: 'text-warn', Justificado: 'text-warn', Parcial: 'text-warn',
  'Em andamento': 'text-warn', 'Pendente verificação': 'text-warn',
  Agendado: 'text-accent', Planejamento: 'text-accent', Registro: 'text-accent',
  Pendente: 'text-warn',
  Ausente: 'text-err', Urgente: 'text-err', Cancelado: 'text-err', Bloqueado: 'text-err',
  Concluída: 'text-ok',
}

export const StatusBadge = ({ value }: { value: string }) =>
  <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-card2 px-2 py-0.5 text-xs ${tone[value] ?? 'text-mute'}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />{value}
  </span>

export const PageHeader = ({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) =>
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div><h1 className="text-xl font-semibold">{title}</h1><p className="text-sm text-mute">{desc}</p></div>
    {action}
  </div>

export const StatCard = ({ label, value, hint, icon, accent }: { label: string; value: ReactNode; hint: string; icon: ReactNode; accent?: string }) =>
  <div className="rounded-xl border border-line bg-card p-4">
    <div className="flex items-center justify-between text-sm text-mute">{label}
      <span style={accent ? { color: accent } : undefined} className={accent ? '' : 'text-accent'}>{icon}</span>
    </div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    <div className="text-xs text-mute">{hint}</div>
  </div>

export const EmptyState = ({ text }: { text: string }) =>
  <div className="flex flex-col items-center gap-2 p-10 text-sm text-mute"><Inbox size={28} aria-hidden />{text}</div>

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal aria-label={title} onClick={e => e.stopPropagation()}
        className={`max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto rounded-2xl border border-line bg-card p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded p-1 hover:bg-card2"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const ConfirmDialog = ({ text, onOk, onCancel, confirmLabel = 'Excluir', danger = true }:
  { text: string; onOk: () => void; onCancel: () => void; confirmLabel?: string; danger?: boolean }) =>
  <Modal title="Confirmar ação" onClose={onCancel}>
    <p className="mb-5 text-sm text-mute">{text}</p>
    <div className="flex justify-end gap-2">
      <button className={btnGhost} onClick={onCancel}>Cancelar</button>
      <button className={danger ? btnDanger : btnPrimary} onClick={onOk}>{confirmLabel}</button>
    </div>
  </Modal>

export const Toast = ({ msg }: { msg: string }) =>
  msg ? <div role="status" className="fixed bottom-4 right-4 z-[60] rounded-lg border border-line bg-card2 px-4 py-2 text-sm text-ok shadow-lg">✓ {msg}</div> : null

export const ColorBadge = ({ label, color }: { label: string; color: string }) =>
  <span style={{ color, borderColor: color + '66', background: color + '1F' }}
    className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">{label}</span>

export const DemoBanner = () =>
  <div className="mb-4 flex items-center gap-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">
    <span className="shrink-0">⚠</span>
    Dados simulados — demonstração visual. Nenhuma informação é salva em servidor.
  </div>

export const SectionCard = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) =>
  <section className="rounded-xl border border-line bg-card p-4">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-medium">{title}</h2>
      {action}
    </div>
    {children}
  </section>

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="mb-4 flex gap-1 rounded-lg border border-line bg-card2 p-1 overflow-x-auto">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition ${active === t ? 'bg-card text-fg shadow' : 'text-mute hover:text-fg'}`}>
          {t}
        </button>
      ))}
    </div>
  )
}

export const fmtBRL = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return isNaN(n) ? 'R$ 0,00' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const fmtDate = (d: string) => d ? d.split('-').reverse().join('/') : ''
