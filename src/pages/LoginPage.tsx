import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('raquel@agape.com')
  const [password, setPassword] = useState('raquel123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (data.session) {
        const target = (location.state as { from?: string } | null)?.from || '/'
        navigate(target, { replace: true })
        return
      }
      setReady(true)
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session) {
        const target = (location.state as { from?: string } | null)?.from || '/'
        navigate(target, { replace: true })
      } else {
        setReady(true)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [location.state, navigate])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signInError) {
      setError(signInError.message || 'Não foi possível entrar.')
      return
    }

    const target = (location.state as { from?: string } | null)?.from || '/'
    navigate(target, { replace: true })
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-fg">
        <div className="text-sm text-mute">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl border border-line bg-card2 text-accent">
            <span className="text-xl">❤</span>
          </div>
          <h1 className="text-3xl font-semibold text-fg">Ágape Hub</h1>
          <p className="mt-2 text-sm text-mute">Entre com suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-mute">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-fg outline-none transition focus:border-accent"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-mute">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-fg outline-none transition focus:border-accent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
