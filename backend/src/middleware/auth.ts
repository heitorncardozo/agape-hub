import type { NextFunction, Request, Response } from 'express'
import { auth, db } from '../config/firebase.js'
import type { UserProfile } from '../types.js'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    if (!token) {
      return res.status(401).json({ message: 'Token não informado.' })
    }

    const decoded = await auth.verifyIdToken(token)
    const profileSnap = await db.collection('users').doc(decoded.uid).get()

    if (!profileSnap.exists) {
      return res.status(403).json({ message: 'Usuário não encontrado no perfil do sistema.' })
    }

    const profile = profileSnap.data() as Partial<UserProfile>

    req.user = {
      uid: decoded.uid,
      email: decoded.email || profile.email || '',
      name: profile.name || decoded.name || 'Usuário',
      role: (profile.role as UserProfile['role']) || 'membro',
      isCreator: Boolean(profile.isCreator),
      isActive: profile.isActive ?? true,
      subdivisao: profile.subdivisao,
      createdAt: profile.createdAt,
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.', details: String(error) })
  }
}
