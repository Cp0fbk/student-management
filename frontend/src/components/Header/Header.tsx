import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import type { Student } from '@/types/Student'
import { useCallback, useState } from 'react'
import Logo from '@/assets/svg/Logo'
import Noti from '@/assets/svg/Noti'
import Bell from '@/assets/svg/Bell'
import { searchStudents } from '@/services/StudentAPI'
import { useModal } from '@/contexts/ModalContext'
import SearchInput from '../SearchInput/SearchInput' // Assuming SearchInput is in the same folder

const Header = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const { openModalWithStudent } = useModal()

  const handleSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await searchStudents(value)
      const students: Student[] = response.data || []
      setSearchResults(students)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSelectStudent = (student: Student) => {
    openModalWithStudent(student)
    setSearchResults([]) // Clear search results after selection
  }

  return (
    <div className='flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 px-4 md:px-10 py-3 shadow-xl'>
      {/* Logo */}
      <div className='flex items-center gap-3 cursor-pointer'>
        <Logo />
        <h1 className='text-lg font-bold'>LMS</h1>
      </div>

      {/* Search Input */}
      <SearchInput
        onDebouncedChange={handleSearch}
        results={searchResults}
        onSelectResult={handleSelectStudent}
        isLoading={isLoading}
      />

      {/* User Info */}
      <div className='flex items-center gap-3 cursor-pointer'>
        <Noti />
        <Bell />
        <div className='flex items-center gap-2'>
          <Avatar>
            <AvatarImage src='https://github.com/shadcn.png' className='w-6 rounded-full' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='hidden md:block font-medium'>Chính Trần</div>
        </div>
      </div>
    </div>
  )
}

export default Header
