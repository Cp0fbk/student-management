import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/HomePage/HomePage'
import StudentDetail from './pages/Student/StudentDetail'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/students/:id' element={<StudentDetail />} />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
