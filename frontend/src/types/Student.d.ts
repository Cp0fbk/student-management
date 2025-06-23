export interface Student {
  id: number
  name: string
  dob: string
  email: string
  gpa: number
}

export interface StudentWithOptionalId extends Omit<Student, 'id'> {
  id?: number
}
