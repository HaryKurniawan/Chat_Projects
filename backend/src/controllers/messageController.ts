import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../utils/logger';

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ data: users });
  } catch (error) {
    logger.error('Error fetching users', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

export const getConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;

    if (!userId || !contactId) {
      res.status(400).json({ message: 'Invalid request parameters.' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: Number(contactId) },
          { senderId: Number(contactId), receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ data: messages });
  } catch (error) {
    logger.error('Error fetching conversation', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
