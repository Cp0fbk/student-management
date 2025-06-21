import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import type { Student } from '@/types/Student'

interface StudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (student: Student) => void
  initialData?: Student | null
  isLoading?: boolean
}

const StudentModal = ({ isOpen, onClose, onSubmit, initialData, isLoading = false }: StudentModalProps) => {
  const [name, setName] = useState('')
  const [DOB, setDOB] = useState('')
  const [GPA, setGPA] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setDOB(initialData.dob || '')
      setGPA(initialData.gpa?.toString() || '')
      setEmail(initialData.email || '')
    } else {
      setName('')
      setDOB('')
      setGPA('')
      setEmail('')
    }
    // Reset errors when modal opens/closes or data changes
    setErrors({})
  }, [initialData, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Tên sinh viên là bắt buộc'
    }

    if (!DOB.trim()) {
      newErrors.DOB = 'Ngày sinh là bắt buộc'
    }

    if (!GPA.trim()) {
      newErrors.GPA = 'GPA là bắt buộc'
    } else {
      const gpaValue = parseFloat(GPA)
      if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4) {
        newErrors.GPA = 'GPA phải là số từ 0 đến 4'
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = 'Email không hợp lệ'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const date = new Date(DOB)
    const timestamp = date.toISOString()

    const payload: Student = {
      id: initialData?.id,
      name: name.trim(),
      dob: timestamp,
      gpa: parseFloat(GPA),
      email: email.trim()
    }

    onSubmit(payload)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div>
            <label className='text-sm font-medium'>
              Tên sinh viên <span className='text-red-500'>*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder='Nhập tên sinh viên'
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name}</p>}
          </div>

          <div>
            <label className='text-sm font-medium'>
              Ngày sinh <span className='text-red-500'>*</span>
            </label>
            <Input
              type='date'
              value={DOB ? DOB.slice(0, 10) : ''}
              onChange={(e) => setDOB(e.target.value)}
              disabled={isLoading}
              className={errors.DOB ? 'border-red-500' : ''}
            />
            {errors.DOB && <p className='text-sm text-red-500 mt-1'>{errors.DOB}</p>}
          </div>

          <div>
            <label className='text-sm font-medium'>
              GPA <span className='text-red-500'>*</span>
            </label>
            <Input
              type='number'
              step='0.01'
              min='0'
              max='4'
              value={GPA}
              onChange={(e) => setGPA(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder='0.00 - 4.00'
              disabled={isLoading}
              className={errors.GPA ? 'border-red-500' : ''}
            />
            {errors.GPA && <p className='text-sm text-red-500 mt-1'>{errors.GPA}</p>}
          </div>

          <div>
            <label className='text-sm font-medium'>
              Email <span className='text-red-500'>*</span>
            </label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder='student@example.com'
              disabled={isLoading}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className='text-sm text-red-500 mt-1'>{errors.email}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className='animate-spin mr-2'>⏳</span>
                {initialData ? 'Đang lưu...' : 'Đang thêm...'}
              </>
            ) : initialData ? (
              'Lưu thay đổi'
            ) : (
              'Thêm sinh viên'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StudentModal
