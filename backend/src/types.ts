export type ProfileRole = 'coordenacao' | 'lideranca' | 'tesouraria' | 'membro'

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: ProfileRole
  isCreator: boolean
  isActive: boolean
  subdivisao?: string
  createdAt?: string
}

export interface Member {
  id: string
  name: string
  group: 'cursista' | 'servo'
  sub: string
  phone: string
  birth: string
  joined: string
  status: 'Ativo' | 'Visitante' | 'Inativo'
  createdAt?: string
  updatedAt?: string
}

export interface Retreat {
  id: string
  name: string
  theme: string
  description: string
  objective: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  responsible: string
  targetAudience: string
  capacity: string
  status: string
  notes: string
  financialStatus: string
  budgetPlanned: string
  budgetApproved: string
  budgetActual: string
  createdAt?: string
  updatedAt?: string
}

export interface RetreatParticipant {
  id: string
  retreatId: string
  memberId?: string
  name: string
  origin: 'Cursista' | 'Servo' | 'Membro' | 'Externo'
  group?: 'cursista' | 'servo'
  status: 'Pré-cadastrado' | 'Confirmado' | 'Lista de espera' | 'Cancelado'
  email?: string
  phone?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile
    }
  }
}

export {}
