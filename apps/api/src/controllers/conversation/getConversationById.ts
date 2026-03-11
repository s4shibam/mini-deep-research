import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import type { ConversationWithMessages } from '@repo/types';

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findUnique({
      where: { id: id as string },
      include: {
        messages: {
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Not found' });
    }

    const payload: ConversationWithMessages = {
      id: conversation.id,
      status: conversation.status,
      loaderText: conversation.loaderText ?? null,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map((message: any) => ({
        id: message.id,
        sender: message.sender,
        index: message.index,
        content:
          message.content as ConversationWithMessages['messages'][number]['content'],
        createdAt: message.createdAt.toISOString(),
      })),
    };

    res.json(payload);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
