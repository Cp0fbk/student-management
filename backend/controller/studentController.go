package controller

import (
	"encoding/json"
	"strconv"
	"strings"
	"student-management/model"
	"student-management/service"
	"time"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/mvc"
)

type StudentController struct {
	Service service.StudentService
}

// GET /students?page=0?limit=10?sort=order
func (c *StudentController) Get(ctx iris.Context) mvc.Result {
	pageStr := ctx.URLParamDefault("page", "0")
	limitStr := ctx.URLParamDefault("limit", "10")
	sortOrder := ctx.URLParamDefault("sort", "")

	page, err1 := strconv.Atoi(pageStr)
	limit, err2 := strconv.Atoi(limitStr)

	if err1 != nil || err2 != nil || page < 0 || limit < 1 {
		return mvc.Response{Code: 400, Content: []byte("Invalid page or limit")}
	}
	if sortOrder != "" && sortOrder != "asc" && sortOrder != "desc" {
		return mvc.Response{
			Code:    400,
			Content: []byte("Invalid sort order, must be 'asc' or 'desc'"),
		}
	}

	students := c.Service.GetAll()
	if sortOrder == "asc" || sortOrder == "desc" {
		students = c.Service.SortByGPA(sortOrder)
	}

	total := len(students)
	totalPages := (total + limit - 1) / limit

	start := page * limit
	if start > total {
		start = total
	}
	end := start + limit
	if end > total {
		end = total
	}
	paginated := students[start:end]

	response := model.PaginatedResponse[model.Student]{
		Data:       paginated,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}
	return mvc.Response{Object: response}
}

// GET /students/{:id}
func (c *StudentController) GetBy(ctx iris.Context, id int64) mvc.Result {
	student, found := c.Service.GetByID(id)

	if id < 221000 || id > 221999 {
		return mvc.Response{Code: 400, Content: []byte("Invalid ID, ID must be between 221000 and 221999")}
	}

	if !found {
		return mvc.Response{Code: 404, Content: []byte("Not found")}
	}
	return mvc.Response{Object: student}
}

// PUT /students/{:id}
func (c *StudentController) PutBy(ctx iris.Context, id int64) mvc.Result {
	_, found := c.Service.GetByID(id)

	if id < 221000 || id > 221999 {
		return mvc.Response{Code: 400, Content: []byte("Invalid ID, ID must be between 221000 and 221999")}
	}

	if !found {
		return mvc.Response{Code: 404, Content: []byte("Not found")}
	}

	var update model.StudentUpdate

	var raw map[string]any
	if err := ctx.ReadJSON(&raw); err != nil {
		return mvc.Response{Code: 400, Content: []byte("Invalid JSON")}
	}
	if _, exists := raw["id"]; exists {
		return mvc.Response{Code: 400, Content: []byte("Cannot update ID field")}
	}

	jsonBytes, _ := json.Marshal(raw)
	if err := json.Unmarshal(jsonBytes, &update); err != nil {
		return mvc.Response{Code: 400, Content: []byte("Invalid request")}
	}

	if update.Email != nil && !strings.Contains(*update.Email, "@") {
		return mvc.Response{Code: 400, Content: []byte("Invalid email format")}
	}

	if update.Gpa != nil && (*update.Gpa < 0.0 || *update.Gpa > 4.0) {
		return mvc.Response{Code: 400, Content: []byte("GPA must be between 0.0 and 4.0")}
	}

	if update.Dob != nil {
		minDob, _ := time.Parse("2006-01-02", "1900-01-01")
		maxDob, _ := time.Parse("2006-01-02", "2007-12-31")
		if update.Dob.Before(minDob) || update.Dob.After(maxDob) {
			return mvc.Response{Code: 400, Content: []byte("Student must be 18 years or older")}
		}
	}

	c.Service.PutByID(id, update)
	return mvc.Response{
		Object: iris.Map{
			"message": "Student updated successfully",
		},
	}
}

// POST /students
func (c *StudentController) Post(ctx iris.Context) mvc.Result {
	var student model.Student
	if err := ctx.ReadJSON(&student); err != nil {
		return mvc.Response{Code: 400, Content: []byte("Invalid request")}
	}

	if !strings.Contains(student.Email, "@") {
		return mvc.Response{Code: 400, Content: []byte("Invalid email format")}
	}

	if student.Gpa < 0.0 || student.Gpa > 4.0 {
		return mvc.Response{Code: 400, Content: []byte("GPA must be between 0.0 and 4.0")}
	}

	minDob, _ := time.Parse("2006-01-02", "1900-01-01")
	maxDob, _ := time.Parse("2006-01-02", "2007-12-31")
	if student.Dob.Before(minDob) || student.Dob.After(maxDob) {
		return mvc.Response{Code: 400, Content: []byte("Student must be 18 years or older")}
	}

	students := c.Service.GetAll()
	for _, existingStudent := range students {
		if existingStudent.ID == student.ID {
			return mvc.Response{Code: 400, Content: []byte("Student with this ID already exists")}
		}
	}

	if c.Service.Post(student) {
		return mvc.Response{
			Code: 201,
			Object: iris.Map{
				"message": "Student created successfully",
			},
		}
	}
	return mvc.Response{Code: 500, Content: []byte("Failed to create student")}
}

// DELETE /students/{:id}
func (c *StudentController) DeleteBy(ctx iris.Context, id int64) mvc.Result {
	if id < 221000 || id > 221999 {
		return mvc.Response{Code: 400, Content: []byte("Invalid ID, ID must be between 221000 and 221999")}
	}

	if c.Service.DeleteByID(id) {
		return mvc.Response{
			Object: iris.Map{
				"message": "Student deleted successfully",
			},
		}
	}
	return mvc.Response{Code: 404, Content: []byte("Not found")}
}

// POST /students/search
func (c *StudentController) PostSearch(ctx iris.Context) mvc.Result {
	var req model.SearchRequest
	if err := ctx.ReadJSON(&req); err != nil || req.Query == "" {
		return mvc.Response{Code: 400, Content: []byte("Missing search query")}
	}

	results := c.Service.SearchBy(req.Query)
	if len(results) == 0 {
		return mvc.Response{
			Code:   404,
			Object: iris.Map{"message": "No students found"},
		}
	}

	return mvc.Response{
		Object: results,
	}
}
