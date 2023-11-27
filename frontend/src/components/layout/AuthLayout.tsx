import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <main className="h-screen w-screen">
      <Outlet />
    </main>
  )
}

export default AuthLayout
