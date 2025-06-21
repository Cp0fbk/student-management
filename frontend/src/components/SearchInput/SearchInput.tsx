import type { Student } from '@/types/Student'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import useDebounce from '@/hooks/useDebounce'

interface SearchInputProps {
  onDebouncedChange: (value: string) => void
  results: Student[]
  onSelectResult: (student: Student) => void
  delay?: number
  isLoading?: boolean
}

const SearchInput = ({
  onDebouncedChange,
  results,
  onSelectResult,
  delay = 500,
  isLoading = false
}: SearchInputProps) => {
  const [value, setValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Sử dụng useDebounce để debounce value
  const debouncedValue = useDebounce(value, delay)

  // Chỉ gọi API khi debouncedValue thay đổi
  useEffect(() => {
    onDebouncedChange(debouncedValue)
  }, [debouncedValue, onDebouncedChange])

  // Show dropdown when we have results and input is focused
  useEffect(() => {
    setShowDropdown(results.length > 0 && value.trim() !== '')
  }, [results, value])

  const handleSelectStudent = (student: Student) => {
    onSelectResult(student)
    setValue('') // Clear input after selection
    setShowDropdown(false)
  }

  return (
    <div className='relative w-full md:w-[600px]'>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          setTimeout(() => setShowDropdown(false), 150)
        }}
        onFocus={() => {
          if (results.length > 0 && value.trim() !== '') {
            setShowDropdown(true)
          }
        }}
        placeholder='Enter Student ID or Name...'
        className='w-full'
      />

      {showDropdown && (
        <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-y-auto'>
          {isLoading ? (
            <div className='px-4 py-2 text-sm text-gray-500 italic'>Loading...</div>
          ) : results.length > 0 ? (
            results.map((student) => (
              <div
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className='px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-b-0'
              >
                <div className='font-medium'>{student.name}</div>
                <div className='text-xs text-gray-500'>
                  ID: {student.id} • {student.email}
                </div>
              </div>
            ))
          ) : (
            <div className='px-4 py-2 text-sm text-gray-500'>No results found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchInput
