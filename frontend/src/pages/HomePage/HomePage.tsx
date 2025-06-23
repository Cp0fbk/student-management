import Page from '../../components/DataTable/Page'
import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import { ModalProvider } from '@/contexts/ModalContext'
import StudentModal from '@/components/StudentModal/StudentModal'
import { useModal } from '@/contexts/ModalContext'
import { createStudent, updateStudent } from '@/services/StudentAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Student, StudentWithOptionalId } from '@/types/Student'

// Component to handle modal logic (must be inside ModalProvider)
const ModalHandler = () => {
  const { isModalOpen, closeModal, selectedStudent } = useModal()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      closeModal()
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
      closeModal()
      toast.success('Sinh viên đã được cập nhật thành công!')
    },
    onError: (error) => {
      console.error('Failed to update student:', error)
      toast.error('Không thể cập nhật sinh viên. Vui lòng thử lại!')
    }
  })

  const handleSubmit = async (student: StudentWithOptionalId) => {
    if (student.id !== undefined) {
      // Update existing student
      const { id, ...studentData } = student
      updateMutation.mutate({ data: studentData, id })
    } else {
      // Create new student
      createMutation.mutate(student)
    }
  }

  return (
    <StudentModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onSubmit={handleSubmit}
      initialData={selectedStudent}
      isLoading={createMutation.isPending || updateMutation.isPending}
    />
  )
}

const HomePage = () => {
  return (
    <ModalProvider>
      <div>
        <Header />
        <div className='md:min-h-[calc(100vh-52px-56px)] bg-gray-100'>
          <Page />
        </div>
        <Footer />
        <ModalHandler />
      </div>
    </ModalProvider>
  )
}

export default HomePage
