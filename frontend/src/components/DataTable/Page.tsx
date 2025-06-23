import { useState } from 'react'
import { type Student } from '@/types/Student'
import { DataTable } from './DataTable'
import { getStudents, createStudent, updateStudent, deleteStudent } from '@/services/StudentAPI'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { columns } from '@/types/Columns'
import { toast } from 'sonner'
import { useModal } from '@/contexts/ModalContext'
import { SelectSort } from '../Select/SelectSort'

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState('none')
  const queryClient = useQueryClient()
  const { openModalWithStudent, openModalForNew } = useModal()

  // Fetch students from API
  const {
    data: studentsData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['students', currentPage, sortOrder],
    queryFn: () => getStudents(currentPage, 10, sortOrder),
    staleTime: 5 * 60 * 1000
  })

  // Mutations remain the same...
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('Sinh viên đã được tạo thành công!')
    },
    onError: (error) => {
      console.error('Failed to create student:', error)
      toast.error('Không thể tạo sinh viên. Vui lòng thử lại!')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ data, id }: { data: Omit<Student, 'id'>; id: number }) => updateStudent(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('Sinh viên đã được cập nhật thành công!')
    },
    onError: (error) => {
      console.error('Failed to update student:', error)
      toast.error('Không thể cập nhật sinh viên. Vui lòng thử lại!')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('Sinh viên đã được xóa thành công!')
    },
    onError: (error) => {
      console.error('Failed to delete student:', error)
      toast.error('Không thể xóa sinh viên. Vui lòng thử lại!')
    }
  })

  const handleEditStudent = (student: Student) => {
    openModalWithStudent(student)
  }

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa sinh viên này không?')) {
      deleteMutation.mutate(studentId.toString())
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='text-lg'>Loading data...</div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className='flex flex-col justify-center items-center h-64 space-y-4'>
        <div className='text-lg text-red-600'>Can't load data of student</div>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    )
  }

  return (
    <div>
      <div className='flex items-center justify-between mt-6 px-28'>
        <h2 className='font-bold text-3xl'>List Student</h2>
        <div className='flex items-center gap-4'>
          <SelectSort value={sortOrder} onChange={setSortOrder} />
          <Button onClick={openModalForNew} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Add Student'}
          </Button>
        </div>
      </div>

      <div className='container mx-auto py-10'>
        <DataTable
          columns={columns}
          data={studentsData?.data || []}
          total={studentsData?.total || 0}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  )
}
