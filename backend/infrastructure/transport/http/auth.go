package http

import (
	"fmt"
	"net/http"
	"strings"

	"os"

	"github.com/andrezz-b/stem24-phishing-tracker/application"
	helpers "github.com/andrezz-b/stem24-phishing-tracker/shared"
	"github.com/andrezz-b/stem24-phishing-tracker/shared/exceptions"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// NewAuth constructor for aUTH
func NewAuth(authApp *application.Auth, controller Controller) *Auth {
	return &Auth{
		Controller: controller,
		authApp:    authApp,
	}
}

// Auth ....
type Auth struct {
	Controller
	authApp *application.Auth
}

func (ac *Auth) RefreshToken(ctx *gin.Context) {
	var request struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := ctx.ShouldBindJSON(&request); err != nil {
		exception := exceptions.UnprocessableEntity(ac.ValidationErrors(err.(validator.ValidationErrors)), "")
		ctx.JSON(exception.Status(), exception.ToDto())
		return
	}

	// Verify the refresh token
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	token, err := jwt.Parse(request.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(refreshSecret), nil
	})

	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "fail", "message": "Invalid refresh token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "fail", "message": "Invalid refresh token"})
		return
	}

	// Generate a new JWT token
	jwtToken, _, err := ac.authApp.GenerateTokens(claims["id"].(string))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "fail", "message": "Failed to generate token"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "jwt_token": jwtToken})
}

func (ac *Auth) SignUpUser(ctx *gin.Context) {
	var request application.RegisterUserInput

	if err := ctx.ShouldBindJSON(&request); err != nil {
		exception := exceptions.UnprocessableEntity(ac.ValidationErrors(err.(validator.ValidationErrors)), "")
		ctx.JSON(exception.Status(), exception.ToDto())
		return
	}

	requestContext, appErr := ac.BuildRequestContext(ctx)
	if appErr != nil {
		ctx.JSON(appErr.Status(), appErr.ToDto())
		return
	}

	_, appErr = ac.authApp.CreateUser(requestContext, &request)
	if appErr != nil {
		if appErr.Data() != nil && strings.Contains(helpers.ToJsonString(appErr.Data), "duplicate key value violates unique") {
			ctx.JSON(http.StatusConflict, gin.H{"status": "fail", "message": "Email already exist, please use another email address"})
			return
		}
		ctx.JSON(appErr.Status(), appErr.ToDto())
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"status": "success", "message": "Registered successfully, please login"})
}

func (ac *Auth) LoginUser(ctx *gin.Context) {
	var request application.LoginUserInput
	if err := ctx.ShouldBindJSON(&request); err != nil {
		exception := exceptions.UnprocessableEntity(ac.ValidationErrors(err.(validator.ValidationErrors)), "")
		ctx.JSON(exception.Status(), exception.ToDto())
		return
	}

	requestContext, appErr := ac.BuildRequestContext(ctx)
	if appErr != nil {
		ctx.JSON(appErr.Status(), appErr.ToDto())
		return
	}

	user, appErr := ac.authApp.LoginUser(requestContext, &request)
	if appErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
		return
	}

	// Generate JWT and refresh tokens
	jwtToken, refreshToken, err := ac.authApp.GenerateTokens(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "fail", "message": "Failed to generate tokens"})
		return
	}

	userResponse := gin.H{
		"id":            user.ID,
		"name":          user.Name,
		"email":         user.Email,
		"otp_enabled":   user.Otp_enabled,
		"jwt_token":     jwtToken,
		"refresh_token": refreshToken,
	}
	ctx.JSON(http.StatusOK, gin.H{"status": "success", "user": userResponse})
}

func (ac *Auth) GenerateOTP(ctx *gin.Context) {
	var request *application.OTPInput

	if err := ctx.ShouldBindJSON(&request); err != nil {
		exception := exceptions.UnprocessableEntity(ac.ValidationErrors(err.(validator.ValidationErrors)), "")
		ctx.JSON(exception.Status(), exception.ToDto())
		return
	}

	requestContext, appErr := ac.BuildRequestContext(ctx)
	if appErr != nil {
		ctx.JSON(appErr.Status(), appErr.ToDto())
		return
	}

	user, appErr := ac.authApp.GenerateOTP(requestContext, request)
	if appErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
		return
	}

	otpResponse := gin.H{
		"base32":      user.Otp_secret,
		"otpauth_url": user.Otp_auth_url,
	}
	ctx.JSON(http.StatusOK, otpResponse)
}

func (ac *Auth) VerifyOTP(ctx *gin.Context) {
	var request *application.OTPInput

	if err := ctx.ShouldBindJSON(&request); err != nil {
		exception := exceptions.UnprocessableEntity(ac.ValidationErrors(err.(validator.ValidationErrors)), "")
		ctx.JSON(exception.Status(), exception.ToDto())
		return
	}

	requestContext, appErr := ac.BuildRequestContext(ctx)
	if appErr != nil {
		ctx.JSON(appErr.Status(), appErr.ToDto())
		return
	}

	user, appErr := ac.authApp.VerifyOTP(requestContext, request)
	if appErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
		return
	}

	userResponse := gin.H{
		"id":          user.ID,
		"name":        user.Name,
		"email":       user.Email,
		"otp_enabled": user.Otp_enabled,
	}
	ctx.JSON(http.StatusOK, gin.H{"otp_verified": true, "user": userResponse})
}

func (ac *Auth) ValidateOTP(ctx *gin.Context) {
	var request *application.OTPInput

	if err := ctx.ShouldBindJSON(&request); err != nil {
		exception := exceptions.UnprocessableEntity(ac.ValidationErrors(err.(validator.ValidationErrors)), "")
		ctx.JSON(exception.Status(), exception.ToDto())
		return
	}

	requestContext, appErr := ac.BuildRequestContext(ctx)
	if appErr != nil {
		ctx.JSON(appErr.Status(), appErr.ToDto())
		return
	}

	_, appErr = ac.authApp.ValidateOTP(requestContext, request)
	if appErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"otp_valid": true})
}

func (ac *Auth) DisableOTP(ctx *gin.Context) {
	var request *application.OTPInput

	if err := ctx.ShouldBindJSON(&request); err != nil {
		exception := exceptions.UnprocessableEntity(ac.ValidationErrors(err.(validator.ValidationErrors)), "")
		ctx.JSON(exception.Status(), exception.ToDto())
		return
	}

	requestContext, appErr := ac.BuildRequestContext(ctx)
	if appErr != nil {
		ctx.JSON(appErr.Status(), appErr.ToDto())
		return
	}
	user, appErr := ac.authApp.DisableOTP(requestContext, request)
	if appErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
		return
	}

	userResponse := gin.H{
		"id":          user.ID,
		"name":        user.Name,
		"email":       user.Email,
		"otp_enabled": user.Otp_enabled,
	}
	ctx.JSON(http.StatusOK, gin.H{"otp_disabled": true, "user": userResponse})
}
