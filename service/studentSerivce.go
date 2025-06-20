package service

import (
	"encoding/json"
	"os"
	"sort"
	"student-management/model"
)

type StudentService interface {
	GetAll() []model.Student
	GetByID(id int64) (*model.Student, bool)
	PutByID(id int64, student model.StudentUpdate) bool
	Post(student model.Student) bool
	DeleteByID(id int64) bool
	SaveToFile() error
	SortByGPA(order string)
}

type studentService struct {
	students []model.Student
	filePath string
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
	
	return &studentService{
		students: students,
		filePath: path,
	}
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
			s.SaveToFile()
			return true
		}
	}
	return false
}

func (s *studentService) Post(student model.Student) bool {
	s.students = append(s.students, student)
	err := s.SaveToFile()
	return err == nil
}

func (s *studentService) DeleteByID(id int64) bool {
	for i, stu := range s.students {
		if stu.ID == id {
			s.students = append(s.students[:i], s.students[i+1:]...)
			s.SaveToFile()
			return true
		}
	}
	return false
}

func (s *studentService) SaveToFile() error {
	data, err := json.MarshalIndent(s.students, "", "  ")
	if err != nil {
		return err
	}

	err = os.WriteFile(s.filePath, data, 0644)
	if err != nil {
		return err
	}

	return nil
}

func (s *studentService) SortByGPA(order string) {
	sort.Slice(s.students, func(i, j int) bool {
		if order == "asc" {
			return s.students[i].Gpa < s.students[j].Gpa
		}
		return s.students[i].Gpa > s.students[j].Gpa
	})
}