package service

import (
	"encoding/json"
	"os"
	"student-management/model"
)

type StudentService interface {
	GetAll() []model.Student
	GetByID(id int64) (*model.Student, bool)
	PutByID(id int64, student model.StudentUpdate) bool
}

type studentService struct {
	students []model.Student
}

func NewStudentService (path string) StudentService {
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	var students []model.Student
	err = json.Unmarshal(data, &students) 
	if err != nil {
		panic(err)
	}
	
	return &studentService{students: students}
}

func (s *studentService) GetAll() []model.Student {
	return s.students
}

func (s *studentService) GetByID (id int64) (*model.Student, bool) {
	for _, student := range s.students {
		if student.ID == id {
			return &student, true
		}
	}
	return nil, false
}

func (s *studentService) PutByID(id int64, student model.StudentUpdate) bool {
	for i, stu := range s.students {
		if stu.ID == id {
			if student.Name != nil {
				s.students[i].Name = *student.Name
			}
			if student.Email != nil {
				s.students[i].Email = *student.Email
				
			}
			if student.Dob != nil {
				s.students[i].Dob = *student.Dob
			}
			if student.Gpa != nil {
				s.students[i].Gpa = *student.Gpa
			}

			return true
		}
	}
	return false
}