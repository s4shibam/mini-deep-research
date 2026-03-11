import { Router } from 'express';
import {
  createMessage,
  getConversationById,
  getConversations,
} from '../controllers/conversation';

const router = Router();

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.post('/:id/messages', createMessage);

export { router as conversationRouter };
