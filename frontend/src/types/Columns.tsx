import type { ColumnDef } from '@tanstack/react-table'
import type { Student } from './Student'

export const columns: ColumnDef<Student>[] = [
  { accessorKey: 'id', header: 'MSSV' },
  { accessorKey: 'name', header: 'Họ và tên' },
  {
    accessorKey: 'dob',
    header: 'Ngày sinh',
    cell: ({ row }) => {
      const isoString = row.getValue<string>('dob') // đảm bảo là string ISO
      const date = new Date(isoString)

      const formatted = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)

      return <span>{formatted}</span>
    }
  },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'gpa', header: 'GPA' }
]
