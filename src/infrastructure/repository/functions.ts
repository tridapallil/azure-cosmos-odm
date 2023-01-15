import { isArray } from 'lodash'

const buildEqual = (value: any): string => {
  return `= ${value._eq}`
}

const buildNotEqual = (value: any): string => {
  return `!= ${value._neq}`
}

const buildGreaterThan = (value: any): string => {
  return `> ${value._gt}`
}

const buildGreaterThanEqual = (value: any): string => {
  return `>= ${value._gte}`
}

const buildLowerThan = (value: any): string => {
  return `< ${value._lt}`
}

const buildLowerThanEqual = (value: any): string => {
  return `<= ${value._lte}`
}

const buildIn = (object: any): string => {
  return `IN (${object._in.join(', ')})`
}

const buildNotIn = (object: any): string => {
  return `NOT IN (${object._nin.join(', ')})`
}

const selectField = (object: any, tableName: string): string => {
  const columnNames = Object.keys(object)
  const [columnName] = columnNames
  if (object[columnName]) {
    const result = `${tableName}.${columnName}`
    return result
  }
  return ''
}

const buildCount = (object: any, tableName: string): string => {
  return `COUNT(${selectField(object, tableName)})`
}

const recursiveCalls = (objects: any, keys: any, tableName: string) => keys.map((key: any) => {
  let result = ''
    if (key.startsWith('_')) {
      result = paramsHandler[key as keyof typeof paramsHandler](objects[key], tableName)
      return result
    }
    const objectKey = Object.keys(objects[key])
    result = paramsHandler[objectKey[0] as keyof typeof paramsHandler](objects[key], tableName)
    return `${tableName}.${key} ${result}`
})

const recursiveArray = (objects: any, tableName: string) => {
  const results = []
  for (const object of objects) {
    const keys = Object.keys(object)
    const newResult = recursiveCalls(object, keys, tableName)
    results.push(newResult)
  }
  return results
}

const buildAnd = (objects: any, tableName: string): string => {
  let results = []
  if (isArray(objects)) {
    results = recursiveArray(objects, tableName)
  } else {
    const keys = Object.keys(objects)
    results = recursiveCalls(objects, keys, tableName)
  }
  const query = results.join(' AND ')
  return `(${query})`
}

const buildOr = (objects: any, tableName: string): string => {
  let results = []
  if (isArray(objects)) {
    results = recursiveArray(objects, tableName)
  } else {
    const keys = Object.keys(objects)
    results = recursiveCalls(objects, keys, tableName)
  }
  const query = results.join(' OR ')
  return `(${query})`
}

const paramsHandler = {
  _or: buildOr,
  _and: buildAnd,
  _in: buildIn,
  _nin: buildNotIn,
  _eq: buildEqual,
  _neq: buildNotEqual,
  _gt: buildGreaterThan,
  _gte: buildGreaterThanEqual,
  _lt: buildLowerThan,
  _lte: buildLowerThanEqual,
  _count: buildCount,
}

export {
  paramsHandler,
  selectField,
}
