package controller

import (
	"encoding/json"
	"strconv"
	"student-management/model"
	"student-management/service"

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
	sortOrder := ctx.URLParamDefault("sort", "asc")

	page, err1 := strconv.Atoi(pageStr)
	limit, err2 := strconv.Atoi(limitStr)

	if err1 != nil || err2 != nil || page < 0 || limit < 1 {
		return mvc.Response{Code: 400, Content: []byte("Invalid page or limit")}
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return mvc.Response{Code: 400, Content: []byte("Invalid sort order, must be 'asc' or 'desc'")}
	}

	if sortOrder == "asc" {
		c.Service.SortByGPA("asc")
	} else if sortOrder == "desc" {
		c.Service.SortByGPA("desc")
	}

	students := c.Service.GetAll()
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
	student, found := c.Service.GetByID(id)

	if id < 221000 || id > 221999 {
		return mvc.Response{Code: 400, Content: []byte("Invalid ID, ID must be between 221000 and 221999")}
	}

	if !found {
		return mvc.Response{Code: 404, Content: []byte("Not found")}
	}

	if student != nil {
		// Update the student information
		body, err := ctx.GetBody()
		if err != nil {
			return mvc.Response{Code: 400, Content: []byte("Cannot read body")}
		}
		var raw map[string]interface{}
		if err := json.Unmarshal(body, &raw); err != nil {
			return mvc.Response{Code: 400, Content: []byte("Invalid JSON")}
		}
		if _, exists := raw["id"]; exists {
			return mvc.Response{Code: 400, Content: []byte("Cannot update ID field")}
		}
		var update model.StudentUpdate
		if err := ctx.ReadJSON(&update); err != nil {
			return mvc.Response{Code: 400, Content: []byte("Invalid request")}
		}
		c.Service.PutByID(id, update)
		return mvc.Response{
			Object: iris.Map{
				"message": "Student updated successfully",
			},
		}
	}
	return mvc.Response{Code: 400, Content: []byte("Invalid request")}
}

// POST /students
func (c *StudentController) Post(ctx iris.Context) mvc.Result {
	var student model.Student
	if err := ctx.ReadJSON(&student); err != nil {
		return mvc.Response{Code: 400, Content: []byte("Invalid request")}
	}

	if student.ID < 221000 || student.ID > 221999 {
		return mvc.Response{Code: 400, Content: []byte("Invalid ID, ID must be between 221000 and 221999")}
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
