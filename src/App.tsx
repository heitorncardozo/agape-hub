import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import RequireAuth from './components/RequireAuth'
import DashboardPage from './pages/DashboardPage'
import AttendancePage from './pages/AttendancePage'
import MembersPage from './pages/MembersPage'
import EventsPage from './pages/EventsPage'
import DocumentsPage from './pages/DocumentsPage'
import FinancialPage from './pages/FinancialPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'
import RetreatsPage from './pages/RetreatsPage'
import LoginPage from './pages/LoginPage'
import { MeetingsPage, TeamsPage, TasksPage } from './pages/pages'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<DashboardPage />} />
        <Route path="membros" element={<MembersPage />} />
        <Route path="equipes" element={<TeamsPage />} />
        <Route path="encontros" element={<MeetingsPage />} />
        <Route path="eventos" element={<EventsPage />} />
        <Route path="retiros" element={<RetreatsPage />} />
        <Route path="presencas" element={<AttendancePage />} />
        <Route path="financeiro" element={<FinancialPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="tarefas" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
