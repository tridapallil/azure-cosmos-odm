import { userRepository } from '../repositories/user.repository'
import { UserModel } from '../models/user.model'

export const getUsers = async (): Promise<UserModel[]> => {
  const users = await userRepository.query({
    select: {
      id: true,
      name: true,
      email: true,
    },
    where: {
      _and: {
        id: {
          _neq: '2'
        }
      }
    },
    orderBy: { name: 'ASC' },
  })
  return users
}