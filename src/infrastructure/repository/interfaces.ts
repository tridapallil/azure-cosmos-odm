export interface MountQueryParams {
  select?: object
  where?: object
  orderBy?: object
  groupBy?: string[]
}

export interface QueryParams {
  select: string
  where: string
  orderBy: string
  groupBy: string
}

export interface Where {
  _and?: any
  _or?: any
}
