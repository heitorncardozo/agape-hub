// Contexto simulado de perfil de usuário logado.
// O app usa essa camada para conhecer o perfil atual do usuário autenticado.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, UserProfile } from '../types'

const PROFILES: Record<Profile, UserProfile> = {
  coordenacao: {
    id: 'u1', name: 'Rafael Mendes', role: 'Coordenador', profile: 'coordenacao',
    subs: [], canAccessFinancial: true,
  },
  lideranca: {
    id: 'u2', name: 'Ana Beatriz Lima', role: 'Líder – Kairós / Kenosis', profile: 'lideranca',
    subs: ['kairos', 'kenosis'], canAccessFinancial: false,
  },
  tesouraria: {
    id: 'u3', name: 'Bruno Carvalho', role: 'Tesoureiro', profile: 'tesouraria',
    subs: [], canAccessFinancial: true,
  },
  membro: {
    id: 'u6', name: 'Eduarda Martins', role: 'Membro', profile: 'membro',
    subs: [], canAccessFinancial: false,
  },
}

interface ProfileCtx {
  user: UserProfile
  setProfile: (p: Profile) => void
}

const Ctx = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>('coordenacao')
  const [supabaseUser, setSupabaseUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setSupabaseUser(null)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!error && data) {
        setSupabaseUser({
          id: data.user_id,
          name: data.name || session.user.email || 'Usuário',
          role: data.role || 'membro',
          profile: data.role || 'membro',
          subs: [],
          canAccessFinancial: Boolean(data.is_creator || data.role === 'coordenacao'),
          email: session.user.email || data.email,
          isCreator: Boolean(data.is_creator),
          isActive: data.is_active ?? true,
        })
        return
      }

      setSupabaseUser({
        id: session.user.id,
        name: session.user.email || 'Usuário',
        role: 'coordenacao',
        profile: 'coordenacao',
        subs: [],
        canAccessFinancial: true,
        email: session.user.email || '',
        isCreator: true,
        isActive: true,
      })
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const currentUser = supabaseUser ?? PROFILES[profile]

  return <Ctx.Provider value={{ user: currentUser, setProfile }}>{children}</Ctx.Provider>
}

export function useProfile() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useProfile must be inside ProfileProvider')
  return c
}
