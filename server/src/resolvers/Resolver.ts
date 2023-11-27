import { createUser, login } from './Mutation'

const resolvers = {
  Mutation: {
    createUser,
    login,
  },
}

export default resolvers
