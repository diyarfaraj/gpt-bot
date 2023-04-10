import { CosmosClient } from '@azure/cosmos';

const endpoint = process.env.COSMOS_DB_ENDPOINT || '';
const key = process.env.COSMOS_DB_KEY || '';

const client = new CosmosClient({ endpoint, key });

export default client;
