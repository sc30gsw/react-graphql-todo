import {
  createUser,
  login,
  createTodo,
  updateTodo,
  deleteTodo,
} from './Mutation'
import { user, todos } from './Query'

const resolvers = {
  Query: {
    user,
    todos,
  },

  Mutation: {
    createUser,
    login,
    createTodo,
    updateTodo,
    deleteTodo,
  },
}

export default resolvers
