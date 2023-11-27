import { gql } from '@apollo/client'

export const ADD_TODO = gql`
  mutation ($text: String!) {
    createTodo(text: $text) {
      id
      text
      completed
    }
  }
`

export const UPDATE_TODO = gql`
  mutation ($todoId: ID!, $text: String!, $completed: Boolean) {
    updateTodo(todoId: $todoId, text: $text, completed: $completed) {
      id
      text
      completed
    }
  }
`

export const DELETE_TODO = gql`
  mutation ($todoId: ID!) {
    deleteTodo(todoId: $todoId) {
      id
      text
      completed
      user {
        id
        name
      }
    }
  }
`
