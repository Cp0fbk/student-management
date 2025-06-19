package model

import (
	"time"
)

type Student struct {
	ID    int64     `json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
	Dob   time.Time `json:"dob"`
	Gpa   float64   `json:"gpa"`
}


