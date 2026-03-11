import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import type {
  ConversationSummary,
  MessageContent,
  TextBlock,
} from '@repo/types';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { index: 'asc' },
          take: 1,
        },
      },
    });

    const summaries: ConversationSummary[] = conversations.map((conversation) => {
      const firstMessage = conversation.messages[0];
      const preview =
        typeof firstMessage?.content === 'object' &&
        Array.isArray(firstMessage.content)
          ? (firstMessage.content as MessageContent)
              .map((block) =>
                block.type === 'text' ? (block as TextBlock).text : null
              )
              .find((text): text is string => typeof text === 'string')
          : null;

      return {
        id: conversation.id,
        status: conversation.status,
        preview: preview ?? null,
        createdAt: conversation.createdAt.toISOString(),
      };
    });

    res.json(summaries);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
