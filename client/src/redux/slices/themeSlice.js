import { createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('theme')

const initialState = {
  isDark: savedTheme === 'dark'
}

// Apply theme immediately on load
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
      if (state.isDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    },
    initTheme: (state) => {
      if (state.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
})

export const { toggleTheme, initTheme } = themeSlice.actions
export default themeSlice.reducer