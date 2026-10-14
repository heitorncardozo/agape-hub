import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/firebase.js';
import { canManageSystem } from '../lib/permissions.js';
const router = Router();
const retreatSchema = z.object({
    name: z.string().min(2),
    theme: z.string().min(2),
    description: z.string().default(''),
    objective: z.string().default(''),
    startDate: z.string(),
    endDate: z.string(),
    startTime: z.string().default('08:00'),
    endTime: z.string().default('18:00'),
    location: z.string().min(2),
    responsible: z.string().min(2),
    targetAudience: z.string().default(''),
    capacity: z.string().default('0'),
    status: z.string().default('Planejamento'),
    notes: z.string().default(''),
    financialStatus: z.string().default('Em preparação'),
    budgetPlanned: z.string().default('0'),
    budgetApproved: z.string().default('0'),
    budgetActual: z.string().default('0'),
});
const participantSchema = z.object({
    name: z.string().min(2),
    retreatId: z.string().min(1),
    memberId: z.string().optional(),
    origin: z.enum(['Cursista', 'Servo', 'Membro', 'Externo']).default('Membro'),
    group: z.enum(['cursista', 'servo']).optional(),
    status: z.enum(['Pré-cadastrado', 'Confirmado', 'Lista de espera', 'Cancelado']).default('Pré-cadastrado'),
    email: z.string().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
});
router.get('/', async (_req, res) => {
    const snapshot = await db.collection('retreats').orderBy('startDate').get();
    const retreats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(retreats);
});
router.post('/', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    if (!canManageSystem(req.user))
        return res.status(403).json({ message: 'Acesso negado.' });
    const parsed = retreatSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.issues });
    }
    const payload = {
        ...parsed.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection('retreats').add(payload);
    return res.status(201).json({ id: ref.id, ...payload });
});
router.get('/:id/participants', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    const snapshot = await db.collection('retreatParticipants')
        .where('retreatId', '==', req.params.id)
        .orderBy('name')
        .get();
    const participants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(participants);
});
router.post('/:id/participants', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    if (!canManageSystem(req.user))
        return res.status(403).json({ message: 'Acesso negado.' });
    const parsed = participantSchema.safeParse({ ...req.body, retreatId: req.params.id });
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.issues });
    }
    const payload = {
        ...parsed.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection('retreatParticipants').add(payload);
    return res.status(201).json({ id: ref.id, ...payload });
});
router.put('/:id/participants/:participantId', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    if (!canManageSystem(req.user))
        return res.status(403).json({ message: 'Acesso negado.' });
    const payload = {
        ...req.body,
        updatedAt: new Date().toISOString(),
    };
    await db.collection('retreatParticipants').doc(req.params.participantId).set(payload, { merge: true });
    return res.json({ id: req.params.participantId, ...payload });
});
export default router;
