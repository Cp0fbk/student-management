package service

import (
	"encoding/json"
	"os"
	"student-management/model"
)

type StudentService interface {
	GetAll() []model.Student
	GetByID(id int64) (*model.Student, bool)
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