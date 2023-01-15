import { AppConfigurationClient } from '@azure/app-configuration'

let client: AppConfigurationClient
const cache = new Map()

async function cached<T> (key: string) {
  try {
    if (cache.has(key)) {
      return cache.get(key) as T
    }
    if (!client) {
      client = new AppConfigurationClient(process.env.AZURE_APP_CONFIG_ENDPOINT!)
    }
    const { value } = await client.getConfigurationSetting({ key })
    cache.set(key, value)
    return value as T
  } catch (err: any) {
    const { message, stack, statusCode } = err
    console.debug({ key, message, stack, statusCode })
    return undefined as T
  }
}

export const config = {
  get isProd () {
    return process.env.NODE_ENV === 'production'
  },
  get secretsManagerKeyVaultName () {
    return cached<string>('secrets-manager-key-vault-name')
  },
  db: {
    get host () {
      return cached<string>('db.host')
    },
    get authKey () {
      return cached<string>('db.authKey')
    },
    get databaseId () {
      return cached<string>('db.databaseId')
    },
  },
}
