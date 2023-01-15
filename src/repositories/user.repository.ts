import { Repository } from '../infrastructure/repository'
import type { UserModel } from '../models/user.model'

class UserRepository extends Repository<UserModel> {
  protected override tableName = 'user'
}

export const userRepository = new UserRepository()
