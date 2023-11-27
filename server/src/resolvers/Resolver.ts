import {
  createUser,
  login,
  createTodo,
  updateTodo,
  deleteTodo,
} from './Mutation'
import { user, todos, todo } from './Query'

const resolvers = {
  Query: {
    user,
    todos,
    todo,
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
