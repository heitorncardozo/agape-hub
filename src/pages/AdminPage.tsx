import { useState } from 'react'
import { Plus, Pencil, Trash2, Shield, User, Key } from 'lucide-react'
import type { Row } from '../types'
import { useCollection } from '../services/dataService'
import { USERS, AUDIT_LOGS } from '../data/mockData'
import { useProfile } from '../services/profileContext'
import {
  Avatar, btnGhost, btnPrimary, ColorBadge, ConfirmDialog, DemoBanner,
  EmptyState, inputCls, Modal, PageHeader, StatCard, StatusBadge, Tabs, Toast, fmtDate,
} from '../components/ui'
import { Navigate } from 'react-router-dom'

const ROLES = ['Coordenação', 'Liderança', 'Tesouraria', 'Membro']

const emptyUser = (): Row => ({
  id: crypto.randomUUID(), name: '', email: '', role: 'Membro',
  subs: '', status: 'Ativo', lastAccess: '',
})

export default function AdminPage() {
  const { user } = useProfile()
  if (user.profile !== 'coordenacao') return <Navigate to="/" replace />

  const [users, upsertUser, removeUser] = useCollection('users', USERS)
  const [tab, setTab] = useState('Usuários')
  const [edit, setEdit] = useState<Row | null>(null), [del, setDel] = useState<Row | null>(null)
  const [toast, setToast] = useState(''), [errs, setErrs] = useState<Record<string, string>>({})

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const submit = () => {
    if (!edit) return
    const er: Record<string, string> = {}
    if (!edit.name?.trim()) er.name = 'Campo obrigatório'
    if (!edit.email?.trim()) er.email = 'Campo obrigatório'
    setErrs(er); if (Object.keys(er).length) return
    upsertUser(edit); setEdit(null); say('Usuário salvo localmente')
  }

  const roleColors: Record<string, string> = {
    'Coordenação': '#22D3EE', 'Liderança': '#9333EA',
    'Tesouraria': '#34D399', 'Membro': '#94A3B8',
  }

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Administração"
        desc="Gestão de usuários, perfis, permissões e auditoria. Somente coordenação."
        action={
          tab === 'Usuários'
            ? <button className={btnPrimary} onClick={() => { setErrs({}); setEdit(emptyUser()) }}><Plus size={16} />Novo usuário</button>
            : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total de usuários" value={users.length} hint="Contas registradas" icon={<User size={18} />} />
        <StatCard label="Coordenação" value={users.filter(u => u.role === 'Coordenação').length} hint="Acesso global" icon={<Shield size={18} />} accent="#22D3EE" />
        <StatCard label="Lideranças" value={users.filter(u => u.role === 'Liderança').length} hint="Por subdivisão" icon={<Key size={18} />} accent="#9333EA" />
        <StatCard label="Tesouraria" value={users.filter(u => u.role === 'Tesouraria').length} hint="Acesso financeiro" icon={<Shield size={18} />} accent="#34D399" />
      </div>

      <Tabs tabs={['Usuários', 'Permissões', 'Auditoria']} active={tab} onChange={setTab} />

      {/* ─── USUÁRIOS ─── */}
      {tab === 'Usuários' && (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          {users.length === 0 ? <EmptyState text="Nenhum usuário." /> : (
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-line text-xs text-mute">
                <tr>{['Usuário', 'E-mail', 'Perfil', 'Subdivisões', 'Situação', 'Último acesso', 'Ações'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-line last:border-0 hover:bg-card2/50">
                    <td className="px-4 py-3"><span className="flex items-center gap-3"><Avatar name={u.name} />{u.name}</span></td>
                    <td className="px-4 py-3 text-mute">{u.email}</td>
                    <td className="px-4 py-3"><ColorBadge label={u.role} color={roleColors[u.role] ?? '#94A3B8'} /></td>
                    <td className="px-4 py-3 text-xs text-mute">{u.subs || 'Todas / N/A'}</td>
                    <td className="px-4 py-3"><StatusBadge value={u.status} /></td>
                    <td className="px-4 py-3 text-mute">{fmtDate(u.lastAccess)}</td>
                    <td className="px-4 py-3">
                      <button aria-label={`Editar ${u.name}`} className="rounded p-2 hover:bg-card2" onClick={() => { setErrs({}); setEdit(u) }}><Pencil size={14} /></button>
                      <button aria-label={`Excluir ${u.name}`} className="rounded p-2 text-err hover:bg-card2" onClick={() => setDel(u)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── PERMISSÕES ─── */}
      {tab === 'Permissões' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-warn/30 bg-warn/10 p-4 text-sm text-warn">
            ⚠ As permissões abaixo são <strong>simuladas para fins de demonstração visual</strong>. Não representam controle de acesso real ou segurança implementada.
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-xs text-mute">
                <tr>
                  <th className="px-4 py-3 text-left">Perfil</th>
                  {['Dashboard', 'Membros', 'Encontros', 'Eventos', 'Presenças', 'Financeiro', 'Equipes', 'Documentos', 'Relatórios', 'Admin'].map(m =>
                    <th key={m} className="px-3 py-3 text-center font-medium">{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Coordenação', color: '#22D3EE', access: [true, true, true, true, true, true, true, true, true, true] },
                  { role: 'Liderança', color: '#9333EA', access: [true, '⬩', true, true, true, false, true, true, '⬩', false] },
                  { role: 'Tesouraria', color: '#34D399', access: [true, false, false, false, false, true, false, false, true, false] },
                  { role: 'Membro', color: '#94A3B8', access: [true, false, '👁', '👁', false, false, false, '👁', false, false] },
                ].map(({ role, color, access }) => (
                  <tr key={role} className="border-b border-line last:border-0">
                    <td className="px-4 py-3"><ColorBadge label={role} color={color} /></td>
                    {access.map((a, i) => (
                      <td key={i} className="px-3 py-3 text-center text-sm">
                        {a === true ? <span className="text-ok">✓</span> : a === false ? <span className="text-mute">—</span> : <span className="text-warn text-xs">{a}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-line px-4 py-3 text-xs text-mute space-x-4">
              <span>✓ = acesso completo</span>
              <span>⬩ = acesso parcial (subdivisões autorizadas)</span>
              <span>👁 = somente leitura</span>
              <span>— = sem acesso</span>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-4 text-sm">
            <h3 className="mb-2 font-medium">Regras de negócio aplicadas</h3>
            <ul className="space-y-1 text-mute text-xs list-disc pl-4">
              <li>Financeiro acessível apenas à Coordenação e Tesouraria (ou usuários explicitamente autorizados).</li>
              <li>Lideranças veem apenas membros e dados das subdivisões autorizadas.</li>
              <li>Coordenação tem visão global de todos os módulos e subdivisões.</li>
              <li>Administração restrita à Coordenação.</li>
              <li>Comunicados não aparecem no menu principal (fora do escopo desta versão).</li>
            </ul>
          </div>
        </div>
      )}

      {/* ─── AUDITORIA ─── */}
      {tab === 'Auditoria' && (
        <div className="space-y-2">
          {AUDIT_LOGS.map(log => (
            <div key={log.id} className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <span className="font-medium">{log.user}</span>
                <span className="text-mute"> {log.action}: </span>
                <span className="italic">{log.target}</span>
              </div>
              <ColorBadge label={log.module} color="#22D3EE" />
              <span className="text-xs text-mute shrink-0">{log.at}</span>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <Modal title={users.some(u => u.id === edit.id) ? 'Editar usuário' : 'Novo usuário'} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <div>
              <label htmlFor="u-name" className="mb-1 block text-sm">Nome completo *</label>
              <input id="u-name" className={inputCls + (errs.name ? ' !border-err' : '')} value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
              {errs.name && <p className="mt-1 text-xs text-err">⚠ {errs.name}</p>}
            </div>
            <div>
              <label htmlFor="u-email" className="mb-1 block text-sm">E-mail *</label>
              <input id="u-email" type="email" className={inputCls + (errs.email ? ' !border-err' : '')} value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} />
              {errs.email && <p className="mt-1 text-xs text-err">⚠ {errs.email}</p>}
            </div>
            <div>
              <label htmlFor="u-role" className="mb-1 block text-sm">Perfil</label>
              <select id="u-role" className={inputCls} value={edit.role} onChange={e => setEdit({ ...edit, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="u-subs" className="mb-1 block text-sm">Subdivisões autorizadas</label>
              <input id="u-subs" placeholder="Ex: kairos,kenosis (vazio = todas ou N/A)" className={inputCls} value={edit.subs} onChange={e => setEdit({ ...edit, subs: e.target.value })} />
            </div>
            <div>
              <label htmlFor="u-status" className="mb-1 block text-sm">Situação</label>
              <select id="u-status" className={inputCls} value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
                <option>Ativo</option><option>Inativo</option>
              </select>
            </div>
            <p className="text-xs text-mute rounded-lg border border-line bg-card2 px-3 py-2">⚠ Permissões simuladas — sem autenticação real nesta versão.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button>
              <button className={btnPrimary} onClick={submit}>Salvar</button>
            </div>
          </div>
        </Modal>
      )}
      {del && <ConfirmDialog text={`Excluir "${del.name}"?`} onCancel={() => setDel(null)} onOk={() => { removeUser(del.id); setDel(null); say('Usuário excluído') }} />}
      <Toast msg={toast} />
    </>
  )
}
