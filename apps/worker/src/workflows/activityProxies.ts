import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities'

// Database and utility activities - fast operations
export const {
  writeMessage,
  updateConversationStatus,
  getNextMessageIndex,
  getConversationTextHistory
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1 seconds',
    backoffCoefficient: 2
  }
})

// LLM activities - can take longer, need more retries
export const { runMainLlmStep, assessResultRelevance } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '2 seconds',
    backoffCoefficient: 2
  }
})

// Web search and fetch activities - external API calls
export const { executeWebSearch, executeFetchWebPage } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '3 minutes',
  retry: {
    maximumAttempts: 2,
    initialInterval: '1 seconds',
    backoffCoefficient: 2
  }
})
