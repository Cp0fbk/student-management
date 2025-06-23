package model
import (
	"time"
)

type StudentUpdate struct {
	Name  *string    `json:"name"`
	Email *string    `json:"email"`
	Dob   *time.Time `json:"dob"`
	Gpa   *float64   `json:"gpa"`
}
