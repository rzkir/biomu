package firebase

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"

	"cloud.google.com/go/firestore"
)

type App struct {
	Auth *auth.Client
	DB   *firestore.Client
}

func Init(ctx context.Context) (*App, error) {
	// Prefer GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)
	if path := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); path != "" {
		opt := option.WithCredentialsFile(path)
		app, err := firebase.NewApp(ctx, nil, opt)
		if err != nil {
			return nil, err
		}
		return bindApp(ctx, app)
	}

	// Else build credentials from env (e.g. FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID)
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	if projectID == "" {
		projectID = os.Getenv("FIREBASE_PROJECT_ID")
	}
	if projectID == "" {
		return nil, fmt.Errorf("missing Firebase project id: set FIREBASE_PROJECT_ID (recommended) or FIREBASE_PROJECT_ID")
	}

	privateKey := os.Getenv("FIREBASE_PRIVATE_KEY")
	clientEmail := os.Getenv("FIREBASE_CLIENT_EMAIL")
	if privateKey == "" || clientEmail == "" {
		return nil, fmt.Errorf("missing Firebase admin credentials: set GOOGLE_APPLICATION_CREDENTIALS or (FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)")
	}
	privateKey = strings.ReplaceAll(privateKey, "\\n", "\n")

	creds := map[string]string{
		"type":                        "service_account",
		"project_id":                  projectID,
		"private_key_id":              os.Getenv("FIREBASE_PRIVATE_KEY_ID"),
		"private_key":                 privateKey,
		"client_email":                clientEmail,
		"client_id":                   os.Getenv("FIREBASE_CLIENT_ID"),
		"auth_uri":                    "https://accounts.google.com/o/oauth2/auth",
		"token_uri":                   "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url":       "",
	}
	jsonBytes, _ := json.Marshal(creds)
	opt := option.WithCredentialsJSON(jsonBytes)
	app, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: projectID}, opt)
	if err != nil {
		return nil, err
	}
	return bindApp(ctx, app)
}

func bindApp(ctx context.Context, app *firebase.App) (*App, error) {
	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}
	db, err := app.Firestore(ctx)
	if err != nil {
		return nil, err
	}
	return &App{Auth: authClient, DB: db}, nil
}
