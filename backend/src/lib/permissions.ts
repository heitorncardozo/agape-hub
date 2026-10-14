import type { UserProfile } from '../types.js'

export function canManageSystem(user?: UserProfile) {
  if (!user) return false
  return user.role === 'coordenacao' || user.isCreator === true
}

export function canManageSubdivisao(user?: UserProfile, subdivisao?: string) {
  if (!user) return false
  if (canManageSystem(user)) return true
  if (!subdivisao) return false
  return user.role === 'lideranca' && user.subdivisao === subdivisao
}

export function canAccessFinancial(user?: UserProfile) {
  if (!user) return false
  if (canManageSystem(user)) return true
  return user.role === 'tesouraria'
}
