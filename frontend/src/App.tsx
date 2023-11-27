import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignUp from './components/User/SignUp'
import AuthLayout from './components/layout/AuthLayout'
import Login from './components/User/Login'
import AppLayout from './components/layout/AppLayout'
import Home from './components/Home'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route path="signUp" element={<SignUp />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
