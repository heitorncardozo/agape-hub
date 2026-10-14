// Todos os registros têm id estável (compatível com IDs de documentos do Firestore).
export type Row = { id: string } & Record<string, string>
export type Attendance = Record<string, Record<string, 'Presente' | 'Ausente' | 'Justificado'>>

export type Profile = 'coordenacao' | 'lideranca' | 'tesouraria' | 'membro'

export interface UserProfile {
  id: string
  name: string
  role: string
  profile: Profile
  subs: string[] // IDs das subdivisões autorizadas (vazio = todas ou nenhuma)
  canAccessFinancial: boolean
  email?: string
  isCreator?: boolean
  isActive?: boolean
}
