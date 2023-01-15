import { CosmosClient } from '@azure/cosmos'

let client: CosmosClient

export const connect = async () => {
  if (client) {
    return client
  }
  try {
    client = new CosmosClient({
      endpoint: 'COSMO_CLIENT_URL',
      key: 'COSMO_CLIENT_KEY',
    })
    await client.databases.createIfNotExists({ id: 'databaseId' })
    return client
  } catch (err) {
    console.log(err)
    throw new Error(JSON.stringify(err))
  }
}
