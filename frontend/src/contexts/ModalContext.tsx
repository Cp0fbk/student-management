import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Student } from '@/types/Student'

type ModalContextType = {
  // Modal visibility
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void

  // Student data for editing
  selectedStudent: Student | null
  setSelectedStudent: (student: Student | null) => void

  // Helper methods
  openModalWithStudent: (student: Student) => void
  openModalForNew: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null) // Clear student when closing
  }

  const openModalWithStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const openModalForNew = () => {
    setSelectedStudent(null)
    setIsModalOpen(true)
  }

  return (
    <ModalContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        selectedStudent,
        setSelectedStudent,
        openModalWithStudent,
        openModalForNew
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
