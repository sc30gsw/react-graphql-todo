import { createUser, login, createTodo } from './Mutation'

const resolvers = {
  Mutation: {
    createUser,
    login,
    createTodo,
  },
}

export default resolvers
