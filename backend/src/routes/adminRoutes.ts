import { Router } from 'express';
import { getAllMessages, toggleBanMessage } from '../controllers/adminController';
import { verifyToken } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/adminMiddleware';

const router = Router();

router.use(verifyToken);
router.use(isAdmin);

router.get('/messages', getAllMessages);
router.patch('/messages/:id/ban', toggleBanMessage);

export default router;
