package dto

import (
	"github.com/andrezz-b/stem24-phishing-tracker/domain/models"
	"time"
)

// NewEvent constructor for Event
func NewEvent(event *models.Event) *Event {
	return &Event{
		ID:               event.ID,
		CreatedAt:        event.CreatedAt,
		UpdatedAt:        event.UpdatedAt,
		Name:             event.Name,
		Date:             event.Date,
		Brand:            event.Brand,
		Description:      event.Description,
		MalURL:           event.MalURL,
		MalDomainRegDate: event.MalDomainRegDate,
		DNSRecord:        event.DNSRecord,
		Keywords:         event.Keywords,
		Status:           NewStatus(&event.Status),
		Comments:         NewComments(event.Comments),
	}
}

// Event ....
type Event struct {
	ID               string    `json:"id"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
	Name             string    `json:"name"`
	Date             time.Time `json:"date"`
	Brand            string    `json:"brand"`
	Description      string    `json:"description"`
	MalURL           string    `json:"malUrl"`
	MalDomainRegDate time.Time `json:"malDomainRegDate"`
	DNSRecord        string    `json:"dnsRecord"`
	Keywords         []string  `json:"keywords"`
	Status           *Status   `json:"status"`
	Comments         []*Comment
}
