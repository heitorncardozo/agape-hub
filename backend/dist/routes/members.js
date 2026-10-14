import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/firebase.js';
import { canManageSystem } from '../lib/permissions.js';
const router = Router();
const memberSchema = z.object({
    name: z.string().min(2),
    group: z.enum(['cursista', 'servo']),
    sub: z.string().min(1),
    phone: z.string().min(6),
    birth: z.string().min(6),
    joined: z.string().min(6),
    status: z.enum(['Ativo', 'Visitante', 'Inativo']).default('Ativo'),
});
router.get('/', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    const snapshot = await db.collection('members').orderBy('name').get();
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (!canManageSystem(req.user)) {
        return res.json(members.filter(member => member.sub === req.user?.subdivisao || member.group === req.user?.role));
    }
    return res.json(members);
});
router.post('/', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    if (!canManageSystem(req.user))
        return res.status(403).json({ message: 'Acesso negado.' });
    const parsed = memberSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.issues });
    }
    const member = {
        ...parsed.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection('members').add(member);
    return res.status(201).json({ id: ref.id, ...member });
});
router.put('/:id', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    if (!canManageSystem(req.user))
        return res.status(403).json({ message: 'Acesso negado.' });
    const parsed = memberSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.issues });
    }
    const payload = {
        ...parsed.data,
        updatedAt: new Date().toISOString(),
    };
    await db.collection('members').doc(req.params.id).set(payload, { merge: true });
    return res.json({ id: req.params.id, ...payload });
});
router.delete('/:id', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado.' });
    if (!canManageSystem(req.user))
        return res.status(403).json({ message: 'Acesso negado.' });
    await db.collection('members').doc(req.params.id).delete();
    return res.json({ message: 'Membro removido.' });
});
export default router;
