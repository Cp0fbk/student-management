package main

import (
	"student-management/controller"
	"student-management/service"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/mvc"
)

func main () {
	app := iris.New()

	studentService := service.NewStudentService("./database/data.json")

	mvcApp := mvc.New(app.Party("/students"))
	mvcApp.Register(studentService)
	mvcApp.Handle(new(controller.StudentController))

	app.Listen(":8080")

}