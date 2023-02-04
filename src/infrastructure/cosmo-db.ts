import { CosmosClient } from '@azure/cosmos'

let client: CosmosClient

export const connect = async () => {
  if (client) {
    return client
  }
  try {
    client = new CosmosClient({
      endpoint: '',
      key: '',
    })
    await client.databases.createIfNotExists({ id: 'databaseId' })
    return client
  } catch (err) {
    console.log(err)
    throw new Error(JSON.stringify(err))
  }
}
