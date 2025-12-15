import { Router } from 'express';
import { SweetsController } from '../controllers/sweets.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const sweetsController = new SweetsController();

// All routes require authentication
router.use(authMiddleware);

// Public authenticated routes
router.get('/', (req, res) => sweetsController.getAll(req, res));
router.get('/search', (req, res) => sweetsController.search(req, res));

// Admin only routes
router.post('/', adminMiddleware, (req, res) => sweetsController.create(req, res));
router.put('/:id', adminMiddleware, (req, res) => sweetsController.update(req, res));
router.delete('/:id', adminMiddleware, (req, res) => sweetsController.delete(req, res));

// Purchase and restock routes
router.post('/:id/purchase', (req, res) => sweetsController.purchase(req, res));
router.post('/:id/restock', adminMiddleware, (req, res) => sweetsController.restock(req, res));

export default router;