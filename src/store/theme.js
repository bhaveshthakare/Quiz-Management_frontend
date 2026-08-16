import { create } from 'zustand'

const initial = localStorage.getItem('quiz_theme') === 'dark'

export const useTheme = create((set) => ({
  dark: initial,
  toggle: () =>
    set((state) => {
      const next = !state.dark
      localStorage.setItem('quiz_theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return { dark: next }
    }),
  init: () => {
    document.documentElement.classList.toggle('dark', initial)
  },
}))