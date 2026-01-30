import { Connection, Client } from '@temporalio/client'

const globalForTemporal = globalThis as unknown as {
  temporalClient?: Client
}

export async function getTemporalClient() {
  if (globalForTemporal.temporalClient) {
    return globalForTemporal.temporalClient
  }

  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233'
  })
  const client = new Client({ connection })
  globalForTemporal.temporalClient = client
  return client
}
