import { Request, Response } from 'express';
import { prisma, ConversationStatus, MessageSender } from '@repo/database';
import { WorkflowExecutionAlreadyStartedError } from '@temporalio/client';
import { getTemporalClient } from '../../lib/temporal';

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return res.status(400).json({ error: 'Message text required' });
    }

    const existing = await prisma.conversation.findUnique({
      where: { id: id as string },
      select: { status: true },
    });

    if (
      existing?.status === ConversationStatus.processing ||
      existing?.status === ConversationStatus.pending
    ) {
      return res.status(409).json({ error: 'Conversation is already processing' });
    }

    if (existing?.status === ConversationStatus.failed) {
      return res.status(409).json({ error: 'Conversation failed and is locked' });
    }

    const conversation = await prisma.conversation.upsert({
      where: { id: id as string },
      create: {
        id: id as string,
        status: ConversationStatus.pending,
        workflowId: id as string,
        loaderText: null,
      },
      update: {
        status: ConversationStatus.pending,
        loaderText: null,
      },
    });

    const lastMessage = await prisma.message.findFirst({
      where: { conversationId: conversation.id },
      orderBy: { index: 'desc' },
      select: { index: true },
    });

    const nextIndex = (lastMessage?.index ?? -1) + 1;

    await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        conversationId: conversation.id,
        sender: MessageSender.human,
        index: nextIndex,
        content: [{ type: 'text', text }],
      },
    });

    const client = await getTemporalClient();

    try {
      await client.workflow.start('deepResearchWorkflow', {
        taskQueue: 'deep-research',
        workflowId: conversation.id,
        args: [
          {
            conversationId: conversation.id,
            query: text,
          },
        ],
      });
    } catch (error) {
      if (!(error instanceof WorkflowExecutionAlreadyStartedError)) {
        throw error;
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
