import { supabase } from '../lib/supabase'

export type AppRole = 'coordenacao' | 'lideranca' | 'tesouraria' | 'membro'

export interface SupabaseUserProfile {
  id: string
  user_id: string
  email: string
  name: string
  role: AppRole
  is_creator: boolean
  is_active: boolean
  created_at?: string
}

export async function signUpWithEmail(email: string, password: string, profile: Partial<SupabaseUserProfile>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  if (!data.user) throw new Error('Usuário não foi criado no Supabase.')

  const payload = {
    user_id: data.user.id,
    email,
    name: profile.name || 'Usuário',
    role: profile.role || 'membro',
    is_creator: Boolean(profile.is_creator),
    is_active: true,
  }

  const { error: profileError } = await supabase.from('profiles').insert(payload)
  if (profileError) throw profileError

  return data.user
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function getCurrentUserProfile(uid: string): Promise<SupabaseUserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle()

  if (error) throw error
  return data as SupabaseUserProfile | null
}

export function listenToAuthState(callback: (user: any | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
