import type { Row } from '../types'
import { SUBS } from './groups'

/* ─── Equipes ─────────────────────────────────────────────── */
export const TEAM_ROWS: Row[] = [
  { id: 't1', name: 'Coordenação', leader: 'Ana Beatriz Lima', desc: 'Planeja e acompanha as atividades da comunidade.' },
  { id: 't2', name: 'Comunicação', leader: 'Bruno Carvalho', desc: 'Redes sociais, avisos e registro dos encontros.' },
  { id: 't3', name: 'Acolhida', leader: 'Camila Souza', desc: 'Recebe os jovens e visitantes com carinho.' },
  { id: 't4', name: 'Oração e liturgia', leader: 'Daniel Ferreira', desc: 'Prepara momentos de oração, terço e adoração.' },
  { id: 't5', name: 'Esportes', leader: 'Eduarda Martins', desc: 'Integração por meio de atividades esportivas.' },
]

/* ─── Encontros ───────────────────────────────────────────── */
export const MEETINGS: Row[] = [
  { id: 'e1', title: 'Encontro de discipulado', date: '2026-10-17', time: '19:00', place: 'Salão paroquial', category: 'Formação', leader: 'Daniel Ferreira', status: 'Agendado' },
  { id: 'e2', title: 'Momento de oração', date: '2026-10-21', time: '20:00', place: 'Capela', category: 'Oração', leader: 'Daniel Ferreira', status: 'Agendado' },
  { id: 'e3', title: 'Reunião de equipe', date: '2026-10-24', time: '15:00', place: 'Sala 2', category: 'Organização', leader: 'Ana Beatriz Lima', status: 'Agendado' },
  { id: 'e4', title: 'Encontro semanal', date: '2026-10-10', time: '19:00', place: 'Salão paroquial', category: 'Formação', leader: 'Ana Beatriz Lima', status: 'Realizado' },
  { id: 'e5', title: 'Retiro de formação', date: '2026-11-05', time: '08:00', place: 'Paróquia São José', category: 'Formação', leader: 'Rafael Mendes', status: 'Agendado' },
]

/* ─── Membros ─────────────────────────────────────────────── */
const names = [
  'Ana Beatriz Lima','Bruno Carvalho','Camila Souza','Daniel Ferreira','Eduarda Martins',
  'Felipe Rocha','Gabriela Alves','Henrique Costa','Isabela Ribeiro','João Pedro Nunes',
  'Larissa Duarte','Mateus Barros','Natália Pires','Otávio Reis','Paula Menezes',
  'Rafaela Dias','Samuel Teixeira','Talita Moura','Vinícius Araújo','Yasmin Cardoso',
]
export const MEMBERS: Row[] = names.map((name, i) => {
  const sub = SUBS[i % 10]
  return {
    id: 'm' + (i + 1), name, group: sub.group, sub: sub.id,
    phone: `(61) 9${8000 + i * 37}-${1000 + i * 91}`,
    birth: `200${i % 7}-0${(i % 9) + 1}-1${i % 9}`,
    joined: `2024-0${(i % 9) + 1}-0${(i % 8) + 1}`,
    status: i % 7 === 6 ? 'Inativo' : i % 7 === 5 ? 'Visitante' : 'Ativo',
  }
})

/* ─── Eventos ─────────────────────────────────────────────── */
export const EVENTS: Row[] = [
  { id: 'ev1', title: 'Retiro de Kairós 2026', date: '2026-11-15', endDate: '2026-11-17', place: 'Sítio Sagrada Família', category: 'Retiro', responsible: 'Ana Beatriz Lima', status: 'Planejamento', budget: '3500', participants: '45' },
  { id: 'ev2', title: 'Festa de Natal', date: '2026-12-20', endDate: '2026-12-20', place: 'Paróquia São José', category: 'Celebração', responsible: 'Camila Souza', status: 'Planejamento', budget: '1200', participants: '80' },
  { id: 'ev3', title: 'Caminhada da Páscoa', date: '2026-04-10', endDate: '2026-04-10', place: 'Parque da Cidade', category: 'Evangelização', responsible: 'Daniel Ferreira', status: 'Concluído', budget: '600', participants: '120' },
  { id: 'ev4', title: 'Acampamento de Verão', date: '2026-01-08', endDate: '2026-01-12', place: 'Chácara Boa Nova', category: 'Retiro', responsible: 'Rafael Mendes', status: 'Concluído', budget: '5000', participants: '60' },
]

/* ─── Tarefas ─────────────────────────────────────────────── */
export const TASKS: Row[] = [
  { id: 'tk1', title: 'Reservar salão paroquial', eventId: 'ev1', responsible: 'Ana Beatriz Lima', dueDate: '2026-10-20', status: 'Concluída', priority: 'Alta' },
  { id: 'tk2', title: 'Comprar materiais de dinâmica', eventId: 'ev1', responsible: 'Bruno Carvalho', dueDate: '2026-10-25', status: 'Em andamento', priority: 'Normal' },
  { id: 'tk3', title: 'Preparar palestra de abertura', eventId: 'ev1', responsible: 'Daniel Ferreira', dueDate: '2026-11-01', status: 'Pendente', priority: 'Alta' },
  { id: 'tk4', title: 'Organizar divulgação', eventId: 'ev1', responsible: 'Rafaela Dias', dueDate: '2026-10-18', status: 'Em andamento', priority: 'Normal' },
  { id: 'tk5', title: 'Orçar cardápio', eventId: 'ev2', responsible: 'Camila Souza', dueDate: '2026-11-15', status: 'Pendente', priority: 'Normal' },
  { id: 'tk6', title: 'Preparar decoração natalina', eventId: 'ev2', responsible: 'Gabriela Alves', dueDate: '2026-12-01', status: 'Pendente', priority: 'Baixa' },
]

/* ─── Documentos ──────────────────────────────────────────── */
export const DOCUMENTS: Row[] = [
  { id: 'd1', title: 'Regulamento interno 2026', category: 'Regulamento', eventId: '', uploadedBy: 'Rafael Mendes', uploadedAt: '2026-01-10', size: '124 KB', status: 'Ativo' },
  { id: 'd2', title: 'Ata da reunião – Outubro', category: 'Ata', eventId: 'e3', uploadedBy: 'Ana Beatriz Lima', uploadedAt: '2026-10-10', size: '48 KB', status: 'Ativo' },
  { id: 'd3', title: 'Orçamento Retiro Kairós', category: 'Financeiro', eventId: 'ev1', uploadedBy: 'Bruno Carvalho', uploadedAt: '2026-10-12', size: '87 KB', status: 'Ativo' },
  { id: 'd4', title: 'Lista de participantes – Caminhada', category: 'Lista', eventId: 'ev3', uploadedBy: 'Daniel Ferreira', uploadedAt: '2026-04-05', size: '32 KB', status: 'Arquivado' },
  { id: 'd5', title: 'Manual do servo voluntário', category: 'Formação', eventId: '', uploadedBy: 'Rafael Mendes', uploadedAt: '2026-03-01', size: '215 KB', status: 'Ativo' },
]

/* ─── Financeiro – Caixa geral ───────────────────────────── */
export const TRANSACTIONS: Row[] = [
  { id: 'tr1', description: 'Dízimo – Outubro', type: 'entrada', category: 'Dízimo', amount: '1850.00', date: '2026-10-05', status: 'Confirmado', eventId: '', paymentMethod: 'PIX', receipt: '' },
  { id: 'tr2', description: 'Oferta retiro Kairós', type: 'entrada', category: 'Oferta', amount: '620.00', date: '2026-10-07', status: 'Confirmado', eventId: 'ev1', paymentMethod: 'Dinheiro', receipt: '' },
  { id: 'tr3', description: 'Aluguel do sítio', type: 'saída', category: 'Locação', amount: '1200.00', date: '2026-10-09', status: 'Confirmado', eventId: 'ev1', paymentMethod: 'Transferência', receipt: 'comprovante-aluguel.pdf' },
  { id: 'tr4', description: 'Materiais gráficos', type: 'saída', category: 'Material', amount: '180.00', date: '2026-10-11', status: 'Pendente', eventId: 'ev1', paymentMethod: 'PIX', receipt: '' },
  { id: 'tr5', description: 'Doação campanha Natal', type: 'entrada', category: 'Doação', amount: '350.00', date: '2026-10-12', status: 'Confirmado', eventId: 'ev2', paymentMethod: 'PIX', receipt: '' },
  { id: 'tr6', description: 'Compra de materiais', type: 'saída', category: 'Material', amount: '95.00', date: '2026-10-13', status: 'Pendente', eventId: '', paymentMethod: 'Dinheiro', receipt: '' },
  { id: 'tr7', description: 'Oferta mensal servos', type: 'entrada', category: 'Oferta', amount: '430.00', date: '2026-10-01', status: 'Confirmado', eventId: '', paymentMethod: 'PIX', receipt: '' },
  { id: 'tr8', description: 'Alimentação retiro', type: 'saída', category: 'Alimentação', amount: '480.00', date: '2026-10-14', status: 'Aprovado', eventId: 'ev1', paymentMethod: 'Transferência', receipt: '' },
]

/* ─── Financeiro – Contas ────────────────────────────────── */
export const PAYABLES: Row[] = [
  { id: 'pa1', description: 'Gráfica – impressão de cartilhas', dueDate: '2026-10-20', amount: '320.00', status: 'Pendente', supplier: 'Gráfica Central', eventId: 'ev1' },
  { id: 'pa2', description: 'Lanche – reunião de outubro', dueDate: '2026-10-15', amount: '85.00', status: 'Pago', supplier: 'Padaria São Luís', eventId: '' },
  { id: 'pa3', description: 'Aluguel de som e luz', dueDate: '2026-11-05', amount: '750.00', status: 'Pendente', supplier: 'Som & Eventos', eventId: 'ev2' },
]
export const RECEIVABLES: Row[] = [
  { id: 're1', description: 'Inscrição retiro – lote 1', dueDate: '2026-10-10', amount: '900.00', status: 'Recebido', payer: 'Participantes', eventId: 'ev1' },
  { id: 're2', description: 'Inscrição retiro – lote 2', dueDate: '2026-10-25', amount: '600.00', status: 'Pendente', payer: 'Participantes', eventId: 'ev1' },
  { id: 're3', description: 'Campanha Natal – meta', dueDate: '2026-12-10', amount: '1500.00', status: 'Em andamento', payer: 'Comunidade', eventId: 'ev2' },
]

/* ─── Financeiro – Orçamentos ────────────────────────────── */
export const BUDGETS: Row[] = [
  { id: 'bu1', eventId: 'ev1', category: 'Locação', planned: '1200.00', approved: '1200.00', actual: '1200.00', status: 'Aprovado' },
  { id: 'bu2', eventId: 'ev1', category: 'Alimentação', planned: '600.00', approved: '500.00', actual: '480.00', status: 'Aprovado' },
  { id: 'bu3', eventId: 'ev1', category: 'Material', planned: '300.00', approved: '250.00', actual: '180.00', status: 'Parcial' },
  { id: 'bu4', eventId: 'ev1', category: 'Transporte', planned: '400.00', approved: '0.00', actual: '0.00', status: 'Pendente' },
  { id: 'bu5', eventId: 'ev2', category: 'Decoração', planned: '400.00', approved: '0.00', actual: '0.00', status: 'Pendente' },
  { id: 'bu6', eventId: 'ev2', category: 'Alimentação', planned: '800.00', approved: '0.00', actual: '0.00', status: 'Pendente' },
]

/* ─── Financeiro – Prestação de contas ───────────────────── */
export const ACCOUNTABILITY: Row[] = [
  { id: 'ac1', eventId: 'ev4', description: 'Acampamento de Verão – prestação final', submittedBy: 'Rafael Mendes', submittedAt: '2026-01-15', status: 'Consolidado', totalExpenses: '4820.00', totalReceipts: '4600.00', notes: 'Saldo remanescente devolvido ao caixa' },
  { id: 'ac2', eventId: 'ev3', description: 'Caminhada da Páscoa – prestação final', submittedBy: 'Daniel Ferreira', submittedAt: '2026-04-12', status: 'Aprovado', totalExpenses: '580.00', totalReceipts: '580.00', notes: '' },
  { id: 'ac3', eventId: 'ev1', description: 'Retiro Kairós 2026 – relatório parcial', submittedBy: 'Ana Beatriz Lima', submittedAt: '2026-10-14', status: 'Registro', totalExpenses: '1860.00', totalReceipts: '1520.00', notes: 'Aguardando fechar inscrições' },
]

/* ─── Doações e campanhas ────────────────────────────────── */
export const DONATIONS: Row[] = [
  { id: 'dn1', donor: 'Anônimo', amount: '100.00', date: '2026-10-01', campaign: 'Fundo geral', method: 'PIX', status: 'Confirmado' },
  { id: 'dn2', donor: 'Maria Aparecida', amount: '50.00', date: '2026-10-03', campaign: 'Campanha Natal', method: 'Dinheiro', status: 'Confirmado' },
  { id: 'dn3', donor: 'José Ferreira', amount: '200.00', date: '2026-10-05', campaign: 'Fundo geral', method: 'Transferência', status: 'Confirmado' },
  { id: 'dn4', donor: 'Anônimo', amount: '75.00', date: '2026-10-08', campaign: 'Retiro Kairós', method: 'PIX', status: 'Confirmado' },
  { id: 'dn5', donor: 'Comunidade São José', amount: '500.00', date: '2026-10-10', campaign: 'Fundo geral', method: 'Transferência', status: 'Pendente verificação' },
]

/* ─── Usuários / permissões (simulado) ───────────────────── */
export const USERS: Row[] = [
  { id: 'u1', name: 'Rafael Mendes', email: 'rafael@agapehub.app', role: 'Coordenação', subs: 'todas', status: 'Ativo', lastAccess: '2026-10-14' },
  { id: 'u2', name: 'Ana Beatriz Lima', email: 'ana@agapehub.app', role: 'Liderança', subs: 'kairos,kenosis', status: 'Ativo', lastAccess: '2026-10-13' },
  { id: 'u3', name: 'Bruno Carvalho', email: 'bruno@agapehub.app', role: 'Tesouraria', subs: 'todas', status: 'Ativo', lastAccess: '2026-10-12' },
  { id: 'u4', name: 'Camila Souza', email: 'camila@agapehub.app', role: 'Liderança', subs: 'cafarnaum,belem', status: 'Ativo', lastAccess: '2026-10-11' },
  { id: 'u5', name: 'Daniel Ferreira', email: 'daniel@agapehub.app', role: 'Liderança', subs: 'kyrios', status: 'Ativo', lastAccess: '2026-10-10' },
  { id: 'u6', name: 'Eduarda Martins', email: 'eduarda@agapehub.app', role: 'Membro', subs: '', status: 'Ativo', lastAccess: '2026-10-08' },
  { id: 'u7', name: 'Felipe Rocha', email: 'felipe@agapehub.app', role: 'Membro', subs: '', status: 'Inativo', lastAccess: '2026-08-20' },
]

/* ─── Auditoria ──────────────────────────────────────────── */
export const AUDIT_LOGS: Row[] = [
  { id: 'al1', user: 'Rafael Mendes', action: 'Criou evento', target: 'Retiro de Kairós 2026', at: '2026-10-01 09:15', module: 'Eventos' },
  { id: 'al2', user: 'Ana Beatriz Lima', action: 'Editou membro', target: 'Henrique Costa', at: '2026-10-05 14:32', module: 'Membros' },
  { id: 'al3', user: 'Bruno Carvalho', action: 'Registrou transação', target: 'Dízimo – Outubro', at: '2026-10-05 16:00', module: 'Financeiro' },
  { id: 'al4', user: 'Rafael Mendes', action: 'Aprovou orçamento', target: 'Alimentação – Retiro', at: '2026-10-06 10:20', module: 'Financeiro' },
  { id: 'al5', user: 'Camila Souza', action: 'Registrou presença', target: 'Encontro semanal', at: '2026-10-10 20:45', module: 'Presenças' },
  { id: 'al6', user: 'Daniel Ferreira', action: 'Enviou documento', target: 'Ata da reunião – Outubro', at: '2026-10-10 22:00', module: 'Documentos' },
]

/* ─── Retiros – demo ───────────────────────────────────── */
export const RETREATS: Row[] = [
  {
    id: 'r1',
    name: 'Retiro de Kairós 2026',
    theme: 'Cura, missão e perseverança',
    description: 'Retiro anual de formação e renovação espiritual para lideranças e membros da comunidade.',
    objective: 'Promover escuta espiritual, formação e integração com foco em missão e discipulado.',
    startDate: '2026-11-15',
    startTime: '08:00',
    endDate: '2026-11-17',
    endTime: '18:00',
    location: 'Sítio Sagrada Família',
    responsible: 'Ana Beatriz Lima',
    targetAudience: 'Servos, cursistas e liderança',
    capacity: '60',
    status: 'Preparação',
    notes: 'Entrada de 08h e ajustes de último minuto na estrutura de acolhida.',
    financialStatus: 'Aguardando conferência',
    budgetPlanned: '4200.00',
    budgetApproved: '3600.00',
    budgetActual: '2980.50',
  },
  {
    id: 'r2',
    name: 'Retiro de Renovação – Kenosis',
    theme: 'Descer para servir',
    description: 'Retiro de aprofundamento para líderes de pequenas comunidades e servos ativos.',
    objective: 'Fortalecer a formação espiritual, a oração e a convivência em equipe.',
    startDate: '2026-12-04',
    startTime: '09:00',
    endDate: '2026-12-06',
    endTime: '17:30',
    location: 'Casa de Oração São João',
    responsible: 'Rafael Mendes',
    targetAudience: 'Liderança e servidores',
    capacity: '35',
    status: 'Planejamento',
    notes: 'Ainda em confirmação de transporte e agenda de palestras.',
    financialStatus: 'Em preparação',
    budgetPlanned: '2200.00',
    budgetApproved: '0.00',
    budgetActual: '0.00',
  },
]

export const RETREAT_ACTIVITIES: Row[] = [
  { id: 'ra1', retreatId: 'r1', title: 'Acolhida e inscrição', description: 'Recepção e orientações para chegada dos participantes.', date: '2026-11-15', startTime: '08:00', endTime: '09:00', place: 'Recepção', responsible: 'Camila Souza', notes: 'Entrega de crachás e kit inicial.' },
  { id: 'ra2', retreatId: 'r1', title: 'Momento de oração', description: 'Abertura espiritual e oração de consagração.', date: '2026-11-15', startTime: '09:30', endTime: '10:15', place: 'Capela', responsible: 'Daniel Ferreira', notes: 'Equipe de liturgia em primeira posição.' },
  { id: 'ra3', retreatId: 'r1', title: 'Tarde de dinâmica', description: 'Atividade em grupos com foco em comunicação e acolhida.', date: '2026-11-15', startTime: '15:00', endTime: '17:00', place: 'Salão principal', responsible: 'Ana Beatriz Lima', notes: 'Material preparado.' },
]

export const RETREAT_PARTICIPANTS: Row[] = [
  { id: 'rp1', retreatId: 'r1', name: 'Ana Beatriz Lima', origin: 'Membro', memberId: 'm2', status: 'Confirmado', email: 'ana@agapehub.app', phone: '(61) 99999-0001', notes: 'Responsável geral.' },
  { id: 'rp2', retreatId: 'r1', name: 'Bruno Carvalho', origin: 'Membro', memberId: 'm3', status: 'Confirmado', email: 'bruno@agapehub.app', phone: '(61) 99999-0002', notes: 'Apoio financeiro.' },
  { id: 'rp3', retreatId: 'r1', name: 'Rafael Mendes', origin: 'Membro', memberId: 'm1', status: 'Pré-cadastrado', email: 'rafael@agapehub.app', phone: '(61) 99999-0003', notes: 'Coordenação geral.' },
  { id: 'rp4', retreatId: 'r1', name: 'Maria Helena', origin: 'Externo', memberId: '', status: 'Lista de espera', email: '', phone: '(61) 99999-0004', notes: 'Inscrição pendente de confirmação.' },
]

export const RETREAT_TEAMS: Row[] = [
  { id: 'rt1', retreatId: 'r1', name: 'Liturgia', objective: 'Preparar momentos de oração e acolhida.', leader: 'Daniel Ferreira', members: 'Daniel, Paula, João', functions: 'Canto, abertura e intercessão', tasks: 'Ritmo da programação e intercessão', status: 'Ativa' },
  { id: 'rt2', retreatId: 'r1', name: 'Cozinha', objective: 'Organizar refeições e banhos de apoio.', leader: 'Camila Souza', members: 'Camila, Talita, Yara', functions: 'Preparação, limpeza e distribuição', tasks: 'Cardápio, alimentos e reposição', status: 'Ativa' },
]

export const RETREAT_TASKS: Row[] = [
  { id: 'rtk1', retreatId: 'r1', title: 'Reservar local do retiro', description: 'Confirmar espaço e infraestrutura.', area: 'Infraestrutura', responsible: 'Ana Beatriz Lima', dueDate: '2026-10-28', priority: 'Alta', status: 'Concluída', notes: 'Reserva confirmada.' },
  { id: 'rtk2', retreatId: 'r1', title: 'Preparar materiais de dinâmica', description: 'Imprimir fichas e deixar kits prontos.', area: 'Comunicação', responsible: 'Bruno Carvalho', dueDate: '2026-11-08', priority: 'Normal', status: 'Em andamento', notes: 'Aguardar revisão final.' },
  { id: 'rtk3', retreatId: 'r1', title: 'Confirmar transporte', description: 'Organizar horários e veículo.', area: 'Logística', responsible: 'Rafael Mendes', dueDate: '2026-11-10', priority: 'Urgente', status: 'A fazer', notes: 'Pendente de contato com parceiro.' },
]

export const RETREAT_ITEMS: Row[] = [
  { id: 'ri1', retreatId: 'r1', name: 'Cafeteira e filtros', description: 'Para área de apoio e café da manhã.', qtyNeeded: '6', qtyAvailable: '4', responsible: 'Cozinha', status: 'Em preparação', observations: 'Faltam 2 itens' },
  { id: 'ri2', retreatId: 'r1', name: 'Colchonetes', description: 'Para alojamento e descanso.', qtyNeeded: '20', qtyAvailable: '18', responsible: 'Infraestrutura', status: 'Parcial', observations: '2 pendentes de disponibilidade' },
  { id: 'ri3', retreatId: 'r1', name: 'Material de dinâmicas', description: 'Papel, canetas e fita.', qtyNeeded: '30', qtyAvailable: '30', responsible: 'Comunicação', status: 'Disponível', observations: 'Em estoque' },
]

export const RETREAT_DOCUMENTS: Row[] = [
  { id: 'rd1', retreatId: 'r1', title: 'Programação do retiro', category: 'Programação', description: 'Cronograma geral e atividades por bloco.', date: '2026-10-14', responsible: 'Ana Beatriz Lima', access: 'Interno', file: 'programacao-r1.pdf' },
  { id: 'rd2', retreatId: 'r1', title: 'Lista de convidados', category: 'Listas', description: 'Relação de participantes confirmados e espera.', date: '2026-10-20', responsible: 'Rafael Mendes', access: 'Restrito', file: 'lista-participantes.xlsx' },
]

export const RETREAT_ATTENDANCE: Row[] = [
  { id: 'ra1a', retreatId: 'r1', participantId: 'rp1', participantName: 'Ana Beatriz Lima', status: 'Presente', justification: '' },
  { id: 'ra2a', retreatId: 'r1', participantId: 'rp2', participantName: 'Bruno Carvalho', status: 'Pendente', justification: '' },
  { id: 'ra3a', retreatId: 'r1', participantId: 'rp3', participantName: 'Rafael Mendes', status: 'Ausente', justification: 'Compromisso de coordenação.' },
]

export const RETREAT_REPORT: Row = {
  id: 'rr1',
  retreatId: 'r1',
  summary: 'Retiro em preparo; cronograma inicial validado, logística em revisão, presença e tarefas em andamento. A prestação de contas ainda depende da conferência do orçamento.',
}
