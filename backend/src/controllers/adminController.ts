import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../utils/logger';

export const getAllMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.status(200).json({ data: messages });
  } catch (error) {
    logger.error('Error fetching all messages (Admin)', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

export const toggleBanMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    
    if (typeof isBanned !== 'boolean') {
      res.status(400).json({ message: 'Field isBanned harus boolean.' });
      return;
    }

    const messageToUpdate = await prisma.message.findUnique({
      where: { id: Number(id) }
    });

    if (!messageToUpdate) {
      res.status(404).json({ message: 'Pesan tidak ditemukan.' });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: { id: Number(id) },
      data: { isBanned },
    });

    // Notify connected users (sender & receiver) real-time
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${messageToUpdate.senderId}`)
        .to(`user_${messageToUpdate.receiverId}`)
        .emit('messageStatusUpdated', updatedMessage);
    }

    logger.info(`Message ID ${id} ban status updated to ${isBanned} by admin ${req.user?.id}`);

    res.status(200).json({ message: 'Status ban pesan berhasil diupdate', data: updatedMessage });
  } catch (error) {
    logger.error('Error updating ban status', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
