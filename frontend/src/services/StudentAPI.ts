import clientAxios from './ClientAxios'
import type { Student } from '../types/Student'

interface PaginatedStudents {
  data: Student[]
  total: number
  page: number
  limit: number
}

interface Response {
  data?: Student[]
}

export const getStudents = async (page: number, limit: number, sortOrder: string): Promise<PaginatedStudents> => {
  const sort = sortOrder === 'none' ? '' : sortOrder
  const response = await clientAxios.get(`/students?sort=${sort}&page=${page}&limit=${limit}`)
  return response.data
}

export const getStudentById = async (id: string): Promise<Student> => {
  const response = await clientAxios.get(`/students/${id}`)
  return response.data
}

export const createStudent = async (data: Partial<Student>): Promise<Student> => {
  const response = await clientAxios.post('/students', data)
  return response.data
}

export const updateStudent = async (data: Omit<Student, 'id'>, id: number) => {
  const response = await clientAxios.put(`/students/${id}`, data)
  return response.data
}

export const deleteStudent = async (id: string): Promise<{ message: string }> => {
  const response = await clientAxios.delete(`/students/${id}`)
  return response.data
}

export const searchStudents = async (query: string): Promise<Response> => {
  const body = {
    query: query
  }
  const response = await clientAxios.post(`/students/search`, body)
  return response
}
