// Contexto simulado de perfil de usuário logado.
// O app usa essa camada para conhecer o perfil atual do usuário autenticado.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, UserProfile } from '../types'

const PROFILES: Record<Profile, UserProfile> = {
  coordenacao: {
    id: 'u0', name: 'Usuário', role: 'Coordenador', profile: 'coordenacao',
    subs: [], canAccessFinancial: true,
  },
  lideranca: {
    id: 'u0', name: 'Usuário', role: 'Liderança', profile: 'lideranca',
    subs: [], canAccessFinancial: false,
  },
  tesouraria: {
    id: 'u0', name: 'Usuário', role: 'Tesouraria', profile: 'tesouraria',
    subs: [], canAccessFinancial: true,
  },
  membro: {
    id: 'u0', name: 'Usuário', role: 'Membro', profile: 'membro',
    subs: [], canAccessFinancial: false,
  },
}

interface ProfileCtx {
  user: UserProfile
  setProfile: (p: Profile) => void
  profileLoading: boolean
  profileError: string
}

const Ctx = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>('membro')
  const [supabaseUser, setSupabaseUser] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    let active = true
    let pendingProfileLoad: number | undefined

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (pendingProfileLoad !== undefined) window.clearTimeout(pendingProfileLoad)
      if (!session?.user) {
        setSupabaseUser(null)
        setProfileError('')
        setProfileLoading(false)
        return
      }

      setProfileLoading(true)
      setProfileError('')

      // Query after the auth callback returns to avoid waiting on Supabase's auth lock.
      pendingProfileLoad = window.setTimeout(() => {
        void (async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (!active) return
          if (error) {
            setSupabaseUser(null)
            setProfileError(`Não foi possível carregar seu perfil no Supabase: ${error.message} (${error.code ?? 'sem código'}).`)
            setProfileLoading(false)
            return
          }
          if (!data) {
            setSupabaseUser(null)
            setProfileError('Sua conta autenticou, mas não tem um perfil cadastrado em public.profiles. Cadastre seu perfil antes de salvar dados.')
            setProfileLoading(false)
            return
          }

          const role: Profile = data.is_creator || data.role === 'coordenacao'
            ? 'coordenacao'
            : data.role === 'lideranca' || data.role === 'tesouraria' || data.role === 'membro'
              ? data.role
              : 'membro'
          const isActive = data.is_active === true
          setSupabaseUser({
            id: data.user_id,
            name: data.name || session.user.email || 'Usuário',
            role,
            profile: role,
            subs: [],
            canAccessFinancial: isActive && Boolean(data.is_creator || role === 'coordenacao' || role === 'tesouraria'),
            email: session.user.email || data.email,
            isCreator: Boolean(data.is_creator),
            isActive,
          })
          if (!isActive) setProfileError('Seu perfil no Supabase está inativo. Peça à coordenação para ativá-lo antes de salvar dados.')
          setProfileLoading(false)
        })()
      }, 0)
    })

    return () => {
      active = false
      if (pendingProfileLoad !== undefined) window.clearTimeout(pendingProfileLoad)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const currentUser = supabaseUser ?? PROFILES[profile]

  return <Ctx.Provider value={{ user: currentUser, setProfile, profileLoading, profileError }}>{children}</Ctx.Provider>
}

export function useProfile() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useProfile must be inside ProfileProvider')
  return c
}
