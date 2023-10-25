import { Container, ItemDefinition, SqlQuerySpec } from '@azure/cosmos'
import _, { chunk, isEmpty } from 'lodash'
import { connect } from '../cosmo-db'
import { paramsHandler, selectField } from './functions'
import { MountQueryParams, QueryParams } from './interfaces'

export class Repository<Entity extends ItemDefinition> {
  protected tableName = ''
  protected _container!: Container

  private buildOrderBy(params: any): string {
    if (!params) {
      return ''
    }
    const keys = Object.keys(params)
    const orderByQuery = keys.map(key => `${this.tableName}.${key} ${params[key]}`)
    return `ORDER BY ${orderByQuery.join(', ')}`
  }

  private buildGroupBy(columns: string[] | any): string {
    if (!columns) {
      return ''
    }
    const groupByParams = columns.map((column: string) => `${this.tableName}.${column}`)
    return `GROUP BY ${groupByParams.join(', ')}`
  }

  private buildSelect(columns: object | any): string {
    if (!columns) {
      return 'SELECT *'
    }
    const keys = Object.keys(columns)
    const results: any = []
    for (const key of keys) {
      let result = ''
      if (key.startsWith('_')) {
        result = paramsHandler[key as keyof typeof paramsHandler](columns[key], this.tableName, key)
      } else {
        result = selectField({ [key]: columns[key] }, this.tableName)
      }
      results.push(`${result}`)
    }
    return `SELECT ${results.join(', ')}`
  }

  private buildWhere(where: any): string {
    if (isEmpty(where)) {
      return ''
    }
    const keys = Object.keys(where)
    const results: any = []
    for (const key of keys) {
      let result = ''
      if (key.startsWith('_')) {
        result = paramsHandler[key as keyof typeof paramsHandler](where[key], this.tableName, key)
      }
      results.push(`${result}`)
    }
    const builtWhere = results.join(' ')
    return `WHERE ${builtWhere}`
  }

  protected mountQuery(queryParams: MountQueryParams) {
    const defaultValues: QueryParams = {
      select: this.buildSelect(queryParams.select),
      where: this.buildWhere(queryParams.where),
      groupBy: this.buildGroupBy(queryParams.groupBy),
      orderBy: this.buildOrderBy(queryParams.orderBy),
    }
    // eslint-disable-next-line max-len
    return `${defaultValues.select} FROM ${this.tableName} ${defaultValues.where} ${defaultValues.groupBy} ${defaultValues.orderBy}`
  }

  protected async container() {
    if (this._container) {
      return this._container
    }
    const client = await connect()
    await client.database('databaseId').containers.createIfNotExists({ id: this.tableName })
    this._container = client.database('databaseId').container(this.tableName)
    return this._container
  }

  async create(item: Entity): Promise<Entity> {
    const entity: Entity = item
    const container = await this.container()
    await container.items.create(entity)
    return item
  }

  async find(id: string): Promise<Entity | undefined> {
    const container = await this.container()
    const { resource: result } = await container.item(id).read<Entity>()
    return result
  }

  async list(): Promise<Entity[]> {
    const container = await this.container()
    const { resources: result } = await container.items.readAll().fetchAll()
    return result as Entity[]
  }

  async listQuery(query: string | SqlQuerySpec): Promise<Entity[]> {
    const container = await this.container()
    const { resources: result } = await container.items.query(query).fetchAll()
    return result as Entity[]
  }

  async query(queryParams: MountQueryParams): Promise<Entity[]> {
    const container = await this.container()
    const query = this.mountQuery(queryParams)
    const { resources: result } = await container.items.query({ query }).fetchAll()
    return result as Entity[]
  }

  async bulkReplace(items: Entity[]): Promise<any> {
    const container = await this.container()
    const inputs: any[] = items.map((item: Entity) => ({
      operationType: 'Replace',
      id: item.id,
      resourceBody: item,
    }))
    const result = await container.items.bulk(inputs)
    return result
  }

  async bulkUpsert(items: Entity[], chunkLimit?: number): Promise<any> {
    const container = await this.container()
    const chunkNumber: number = chunkLimit ?? 50
    const inputs: any[] = items.map((item: Entity) => ({
      operationType: 'Upsert',
      resourceBody: item,
    }))
    const chunks = chunk(inputs, chunkNumber)
    let results: any = []

    for (const chunkToInsert of chunks) {
      const result = await container.items.bulk(chunkToInsert)
      results = [...results, ...result]
    }
    return results
  }

  async bulkDelete(items: Entity[]): Promise<any> {
    const container = await this.container()
    const inputs: any[] = items.map((item: Entity) => ({
      operationType: 'Delete',
      id: item.id,
      resourceBody: item,
    }))
    const result = await container.items.bulk(inputs)
    return result
  }

  async alter(item: Pick<Entity, 'id'> & Partial<Entity>): Promise<Entity | undefined> {
    if (!item.id) {
      throw new Error('Invalid item. Must have an id.')
    }
    const container = await this.container()
    const { resource: result } = await container.item(item.id).read<Entity>()
    await container.item(item.id).replace(_.merge(result, item))
    return result
  }

  async delete(id: string): Promise<Entity | undefined> {
    const container = await this.container()
    const { resource: result } = await container.item(id).delete<Entity>()
    return result
  }
}
