import {
  createUser,
  login,
  createTodo,
  updateTodo,
  deleteTodo,
} from './Mutation'

const resolvers = {
  Mutation: {
    createUser,
    login,
    createTodo,
    updateTodo,
    deleteTodo,
  },
}

export default resolvers
