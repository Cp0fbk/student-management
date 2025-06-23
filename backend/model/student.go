package model

import (
	"time"
)
type Student struct {
	ID    int64     `json:"id" binding:"required"`
	Name  string    `json:"name" binding:"required"`
	Email string    `json:"email" binding:"required"`
	Dob   time.Time `json:"dob" binding:"required"`
	Gpa   float64   `json:"gpa" binding:"required"`
}





