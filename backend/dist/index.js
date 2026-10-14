import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import membersRoutes from './routes/members.js';
import retreatsRoutes from './routes/retreats.js';
dotenv.config();
const app = express();
const port = Number(process.env.PORT || 4000);
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'agape-hub-backend' });
});
app.use('/api/auth', requireAuth, authRoutes);
app.use('/api/members', requireAuth, membersRoutes);
app.use('/api/retreats', requireAuth, retreatsRoutes);
app.use((err, _req, res) => {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});
app.listen(port, () => {
    console.log(`API Agape Hub rodando em http://localhost:${port}`);
});
export default app;
