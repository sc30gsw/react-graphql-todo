import React from 'react'

import { Outlet } from 'react-router-dom'
import useCheckAuth from '../../hooks/useCheckAuth'

const AppLayout = () => {
  useCheckAuth()
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default AppLayout
