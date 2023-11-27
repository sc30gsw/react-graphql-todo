import { useNavigate } from 'react-router-dom'
import { GET_USER } from '../components/User/graphql/queries'
import { useQuery } from '@apollo/client'
import { useEffect } from 'react'

const useCheckAuth = () => {
  const navigate = useNavigate()
  const { loading, error, data } = useQuery(GET_USER)

  useEffect(() => {
    const token = sessionStorage.getItem('token')

    if (!token || error || (!loading && !data)) navigate('/login')
  }, [navigate])
}

export default useCheckAuth
