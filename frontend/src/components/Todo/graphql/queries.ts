import { gql } from '@apollo/client'

export const GET_TODOS = gql`
  query Todos {
    todos {
      id
      text
      completed
      updatedAt
      user {
        id
        name
      }
    }
  }
`
