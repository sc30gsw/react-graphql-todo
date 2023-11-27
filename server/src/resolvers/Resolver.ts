import {
  createUser,
  login,
  createTodo,
  updateTodo,
  deleteTodo,
} from './Mutation'
import { todos } from './Query'

const resolvers = {
  Query: {
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
