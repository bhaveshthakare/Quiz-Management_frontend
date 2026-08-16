import { create } from 'zustand'
import client from '../api/client'

const storedUser = JSON.parse(localStorage.getItem('quiz_user') || 'null')

export const useAuth = create((set) => ({
  user: storedUser,
  isAuthenticated: !!storedUser,
  isAdmin: storedUser?.role === 'ADMIN',

  login: async (email, password) => {
    const { data } = await client.post('/api/auth/login', { email, password })
    localStorage.setItem('quiz_token', data.token)
    localStorage.setItem('quiz_user', JSON.stringify(data))
    set({ user: data, isAuthenticated: true, isAdmin: data.role === 'ADMIN' })
    return data
  },

  register: async (name, email, password) => {
    const { data } = await client.post('/api/auth/register', { name, email, password })
    localStorage.setItem('quiz_token', data.token)
    localStorage.setItem('quiz_user', JSON.stringify(data))
    set({ user: data, isAuthenticated: true, isAdmin: false })
    return data
  },

  logout: () => {
    localStorage.removeItem('quiz_token')
    localStorage.removeItem('quiz_user')
    set({ user: null, isAuthenticated: false, isAdmin: false })
  },
}))