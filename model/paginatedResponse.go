package model

type PaginatedResponse [T any] struct {
	Data       []T `json:"data"`
	Total      int `json:"total"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	TotalPages int `json:"totalPages"`
}
