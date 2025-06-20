package service

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"sort"
	"strings"
	"student-management/model"
	"time"
)

type StudentService interface {
	GetAll() []model.Student
	GetByID(id int64) (*model.Student, bool)
	PutByID(id int64, student model.StudentUpdate) bool
	Post(student model.Student) bool
	DeleteByID(id int64) bool
	SaveToFile() error
	SortByGPA(order string) []model.Student
	SearchBy(data string) []model.Student
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
func (s *studentService) generateUniqueID() int64 {
	rand.Seed(time.Now().UnixNano())
	const prefix = 221
	var id int64

	exists := func(id int64) bool {
		for _, stu := range s.students {
			if stu.ID == id {
				return true
			}
		}
		return false
	}

	for {
		suffix := rand.Intn(1000) 
		id = int64(prefix*1000 + suffix)
		if !exists(id) {
			break
		}
	}
	return id
}

func (s *studentService) Post(student model.Student) bool {
	student.ID = s.generateUniqueID()
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

func (s *studentService) SortByGPA(order string) []model.Student {
	sortedStudents := make([]model.Student, len(s.students))
	copy(sortedStudents, s.students)

	if order == "asc" {
		sort.Slice(sortedStudents, func(i, j int) bool {
			return sortedStudents[i].Gpa < sortedStudents[j].Gpa
		})
	} else if order == "desc" {
		sort.Slice(sortedStudents, func(i, j int) bool {
			return sortedStudents[i].Gpa > sortedStudents[j].Gpa
		})
	}

	return sortedStudents
}
func (s *studentService) SearchBy(query string) []model.Student {
	query = strings.ToLower(query)
	var results []model.Student

	for _, student := range s.students {
		if strings.Contains(strings.ToLower(student.Name), query) ||
			strings.Contains(strings.ToLower(student.Email), query) ||
			strings.Contains(strings.ToLower(student.Dob.Format("2006-01-02")), query) ||
			strings.Contains(strings.ToLower(fmt.Sprintf("%.2f", student.Gpa)), query) ||
			strings.Contains(fmt.Sprintf("%d", student.ID), query) {
			results = append(results, student)
		}
	}
	return results
}
