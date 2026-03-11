import { Client, Connection } from '@temporalio/client';
import { TEMPORAL_ADDRESS } from '../constants';

const globalForTemporal = globalThis as unknown as {
  temporalClient?: Client;
};

export async function getTemporalClient() {
  if (globalForTemporal.temporalClient) {
    return globalForTemporal.temporalClient;
  }

  const connection = await Connection.connect({
    address: TEMPORAL_ADDRESS,
  });
  
  const client = new Client({ connection });
  globalForTemporal.temporalClient = client;
  return client;
}
