import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UsersRound, CalendarDays, CheckCircle2,
  Menu, Search, Heart, CalendarCheck, DollarSign, FolderOpen,
  BarChart3, Settings, MapPinned, type LucideIcon,
} from 'lucide-react'
import { Avatar } from './ui'
import { useProfile } from '../services/profileContext'

type NavItem = readonly [string, string, LucideIcon, boolean]
type NavGroup = readonly [string, readonly NavItem[]]

const ALL_GROUPS: NavGroup[] = [
  ['VISÃO GERAL', [
    ['/', 'Dashboard', LayoutDashboard, false],
  ]],
  ['COMUNIDADE', [
    ['/membros', 'Membros', Users, false],
    ['/equipes', 'Equipes', UsersRound, false],
  ]],
  ['ORGANIZAÇÃO', [
    ['/encontros', 'Encontros', CalendarDays, false],
    ['/eventos', 'Eventos', CalendarCheck, false],
    ['/retiros', 'Retiros', MapPinned, false],
    ['/presencas', 'Presenças', CheckCircle2, false],
  ]],
  ['FINANCEIRO', [
    ['/financeiro', 'Financeiro', DollarSign, true],
  ]],
  ['CONTEÚDO', [
    ['/documentos', 'Documentos', FolderOpen, false],
    ['/relatorios', 'Relatórios', BarChart3, false],
  ]],
  ['ADMIN', [
    ['/admin', 'Administração', Settings, false],
  ]],
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useProfile()

  const visibleGroups = ALL_GROUPS.map(([g, items]) => [
    g,
    items.filter(([, , , financialOnly]) => !financialOnly || user.canAccessFinancial),
  ] as const).filter(([, items]) => items.length > 0)

  const title = visibleGroups
    .flatMap(([, items]) => items)
    .find(([to]) => pathname === to || (pathname.startsWith(to) && to !== '/'))?.[1] ?? 'Ágape Hub'

  return (
    <div className="min-h-screen">
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-side p-4 transition-transform lg:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card text-accent">
            <Heart size={18} aria-hidden />
          </span>
          <div>
            <div className="font-semibold leading-tight">Ágape Hub</div>
            <div className="text-xs text-mute">Uma comunidade de amor</div>
          </div>
        </div>

        <nav aria-label="Principal" className="flex-1 space-y-5 overflow-y-auto">
          {visibleGroups.map(([g, items]) => (
            <div key={g}>
              <div className="mb-1 px-3 text-[11px] tracking-wider text-mute">{g}</div>
              {items.map(([to, label, Icon]) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm transition ${isActive ? 'border-accent bg-card2 text-fg' : 'border-transparent text-mute hover:bg-card'}`}>
                  <Icon size={17} aria-hidden />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex w-full items-center gap-3 rounded-lg p-2">
            <Avatar name={user.name} />
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm">{user.name}</div>
              <div className="truncate text-xs text-mute">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur">
          <button className="rounded p-2 hover:bg-card lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="text-sm text-mute">Ágape / <span className="text-fg">{title}</span></div>
          <div className="relative ml-auto hidden w-64 sm:block">
            <Search size={15} className="absolute left-3 top-2.5 text-mute" aria-hidden />
            <input aria-label="Pesquisar" placeholder="Pesquisar…"
              className="w-full rounded-lg border border-line bg-card py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none transition" />
          </div>
          <Avatar name={user.name} />
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
