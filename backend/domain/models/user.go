package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"html"
	"strings"
)

const (
	UserModelName = "user"
)

type User struct {
	Model
	Name     string `gorm:"type:varchar(255);not null"`
	Email    string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"`
	// OTP
	Otp_enabled  bool `gorm:"default:false;"`
	Otp_verified bool `gorm:"default:false;"`
	Otp_secret   string
	Otp_auth_url string
	// JWT
	RoleID uint `gorm:"not null;DEFAULT:3" json:"role_id"`
	Role   Role `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

// HASH PASSWORD BEFORE SAVING
func (user *User) BeforeSave(*gorm.DB) error {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(passwordHash)
	user.Name = html.EscapeString(strings.TrimSpace(user.Name))
	return nil
}

func NewUserNoOtp(name string, email string, password string) *User {
	return &User{
		Name:     name,
		Email:    email,
		Password: password,
	}
}

func (user *User) ValidateUserPassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
}
