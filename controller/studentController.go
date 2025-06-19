package controller

import (
	"strconv"
	"student-management/model"
	"student-management/service"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/mvc"
)

type StudentController struct {
	Service service.StudentService
}

// GET /students?page=0?limit=10
func (c *StudentController) Get(ctx iris.Context) mvc.Result {
	pageStr := ctx.URLParamDefault("page", "0")
	limitStr := ctx.URLParamDefault("limit", "10")

	page, err1 := strconv.Atoi(pageStr)
	limit, err2 := strconv.Atoi(limitStr)

	if err1 != nil || err2 != nil || page < 0 || limit < 1 {
		return mvc.Response{Code: 400, Content: []byte("Invalid page or limit")}
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
