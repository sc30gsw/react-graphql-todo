import React from 'react'
import { User } from '../generated/graphql'
import { useNavigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'

type HeaderProps = {
  user: User
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate()
  const client = useApolloClient()

  const logout = () => {
    sessionStorage.removeItem('token')
    // キャッシュクリア
    client.clearStore()
    navigate('/login')
  }

  return (
    <div className="h-[10vh] fixed w-screen flex justify-between items-center border-b-2 border-gray-300">
      <div className="w-1/2">
        <h1 className="ml-10 font-bold text-xl text-indigo-500">
          <a
            href="/"
            className="cursor-pointer hover:brightness-150 transition duration-200"
          >
            Todo App
          </a>
        </h1>
      </div>
      <div
        className="w-1/2 flex justify-end gap-5
      "
      >
        <h2 className="font-bold text-xl">{user.name}</h2>
        <h2
          onClick={logout}
          className="font-bold text-xl mr-10 cursor-pointer hover:opacity-70 transition duration-200"
        >
          Logout
        </h2>
      </div>
    </div>
  )
}

export default Header
