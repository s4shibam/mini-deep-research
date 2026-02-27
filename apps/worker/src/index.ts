import { Worker } from '@temporalio/worker'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import * as activities from './activities/index'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function run() {
  // Note: Main workflow worker with ALL activities
  // Note: This worker handles workflows and has access to all activities
  const deepResearchWorker = await Worker.create({
    workflowsPath: resolve(__dirname, './workflows'),
    activities,
    taskQueue: 'deep-research',
    maxConcurrentActivityTaskExecutions: 100
  })

  console.log('✓ Mini Deep Research Worker started on task queue: deep-research')
  console.log('  - Registered activities:', Object.keys(activities).join(', '))
  console.log('  - Workflows path:', resolve(__dirname, './workflows'))

  await deepResearchWorker.run()
}

run().catch((error) => {
  console.error('❌ Worker failed to start:', error)
  process.exit(1)
})
