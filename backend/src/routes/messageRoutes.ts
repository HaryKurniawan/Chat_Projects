import { Router } from 'express';
import { getUsers, getConversation } from '../controllers/messageController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);
router.get('/users', getUsers);
router.get('/:contactId', getConversation);

export default router;
