import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/firebase.js';
import { canManageSystem } from '../lib/permissions.js';
const router = Router();
const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(['coordenacao', 'lideranca', 'tesouraria', 'membro']),
    subdivisao: z.string().optional(),
    isCreator: z.boolean().optional().default(false),
});
router.get('/me', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado.' });
    }
    const snapshot = await db.collection('users').doc(req.user.uid).get();
    const user = snapshot.data() || {};
    return res.json({
        uid: req.user.uid,
        email: req.user.email,
        name: user.name || req.user.name,
        role: user.role || req.user.role,
        isCreator: Boolean(user.isCreator),
        isActive: user.isActive ?? true,
        subdivisao: user.subdivisao || req.user.subdivisao,
        canManageSystem: canManageSystem({ ...req.user, role: user.role || req.user.role }),
    });
});
router.post('/profile', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado.' });
    }
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.issues });
    }
    const payload = {
        uid: req.user.uid,
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        subdivisao: parsed.data.subdivisao || '',
        isCreator: Boolean(parsed.data.isCreator),
        isActive: true,
        createdAt: new Date().toISOString(),
    };
    await db.collection('users').doc(req.user.uid).set(payload, { merge: true });
    return res.status(201).json({ message: 'Perfil criado com sucesso.', user: payload });
});
export default router;
