// Fonte única de grupos e subdivisões. A cor vem daqui, nunca do registro do membro.
export type Group = 'cursista' | 'servo'
export type SubId = 'kairos' | 'kenosis' | 'kyrios' | 'maranata' | 'agnus-dei' | 'cafarnaum' | 'belem' | 'jerusalem' | 'nazare' | 'emaus'
export const GROUPS: Record<Group, { label: string; color: string }> = { cursista: { label: 'Cursista', color: '#22D3EE' }, servo: { label: 'Servo', color: '#9333EA' } }
export const SUBS: { id: SubId; label: string; group: Group; color: string }[] = [
  { id: 'kairos', label: 'Kairós', group: 'cursista', color: '#2563EB' }, { id: 'kenosis', label: 'Kenosis', group: 'cursista', color: '#F97316' },
  { id: 'kyrios', label: 'Kyrios', group: 'cursista', color: '#22C55E' }, { id: 'maranata', label: 'Maranata', group: 'cursista', color: '#EF4444' },
  { id: 'agnus-dei', label: 'Agnus Dei', group: 'cursista', color: '#EAB308' },
  { id: 'cafarnaum', label: 'Cafarnaum', group: 'servo', color: '#9333EA' }, { id: 'belem', label: 'Belém', group: 'servo', color: '#A855F7' },
  { id: 'jerusalem', label: 'Jerusalém', group: 'servo', color: '#7E22CE' }, { id: 'nazare', label: 'Nazaré', group: 'servo', color: '#B26BF2' },
  { id: 'emaus', label: 'Emaús', group: 'servo', color: '#8B3FD9' }]
export const subOf = (id: string) => SUBS.find(s => s.id === id)
export const subsOf = (g: string) => SUBS.filter(s => s.group === g)
