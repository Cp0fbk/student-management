package main

import (
	"student-management/controller"
	"student-management/service"

	"github.com/kataras/iris/v12"
	"github.com/rs/cors"
	"net/http"
	"github.com/kataras/iris/v12/mvc"
)

func main () {
	app := iris.New()

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	app.WrapRouter(func(w http.ResponseWriter, r *http.Request, router http.HandlerFunc) {
		c.Handler(router).ServeHTTP(w, r)
	})

	studentService := service.NewStudentService("./database/data.json")

	mvcApp := mvc.New(app.Party("/students"))
	mvcApp.Register(studentService)
	mvcApp.Handle(new(controller.StudentController))

	app.Listen(":8080")

}