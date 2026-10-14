import CrudPage, { type Field } from '../components/CrudPage'
import { MEETINGS, TEAM_ROWS, TASKS } from '../data/mockData'

const sel = (key: string, label: string, options: string[]): Field => ({ key, label, type: 'select', options })

export const TeamsPage = () =>
  <CrudPage
    entity="teams" seed={TEAM_ROWS} title="Equipes" desc="Organize as equipes e seus responsáveis."
    addLabel="Nova equipe" noun="Equipe" cols={['name', 'leader', 'desc']}
    fields={[
      { key: 'name', label: 'Nome da equipe', required: true },
      { key: 'leader', label: 'Responsável', required: true },
      { key: 'desc', label: 'Descrição', type: 'textarea' },
    ]}
  />

export const MeetingsPage = () =>
  <CrudPage
    entity="meetings" seed={MEETINGS} title="Encontros e Calendário"
    desc="Gerencie os encontros da comunidade." addLabel="Novo encontro" noun="Encontro"
    filterKey="category" badges={['status']}
    cols={['title', 'date', 'time', 'place', 'category', 'status']}
    fields={[
      { key: 'title', label: 'Título', required: true },
      { key: 'date', label: 'Data', type: 'date', required: true },
      { key: 'time', label: 'Horário de início', type: 'time', required: true },
      { key: 'place', label: 'Local', required: true },
      sel('category', 'Categoria', ['Formação', 'Oração', 'Organização', 'Social']),
      { key: 'leader', label: 'Responsável' },
      sel('status', 'Situação', ['Agendado', 'Realizado', 'Cancelado']),
    ]}
  />

export const TasksPage = () =>
  <CrudPage
    entity="tasks" seed={TASKS} title="Tarefas" desc="Gerencie as tarefas das equipes e eventos."
    addLabel="Nova tarefa" noun="Tarefa" filterKey="status" badges={['status', 'priority']}
    cols={['title', 'responsible', 'dueDate', 'status', 'priority']}
    fields={[
      { key: 'title', label: 'Título', required: true },
      { key: 'responsible', label: 'Responsável', required: true },
      { key: 'dueDate', label: 'Prazo', type: 'date' },
      sel('status', 'Situação', ['Pendente', 'Em andamento', 'Concluída', 'Bloqueada']),
      sel('priority', 'Prioridade', ['Baixa', 'Normal', 'Alta', 'Urgente']),
    ]}
  />
