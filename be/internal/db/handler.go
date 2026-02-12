package db

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"biomu/backend/internal/firebase"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

type Handler struct {
	fb *firebase.App
}

func NewHandler(fb *firebase.App) *Handler {
	return &Handler{fb: fb}
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// GET /api/db/{collection}
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := r.Context()

	collectionName := r.PathValue("collection")
	if collectionName == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "collection is required"})
		return
	}

	sortBy := r.URL.Query().Get("sortBy")
	order := r.URL.Query().Get("order")
	if order == "" {
		order = "asc"
	}

	col := h.fb.DB.Collection(collectionName)
	q := col.Query
	if sortBy != "" {
		dir := firestore.Asc
		if strings.ToLower(order) == "desc" {
			dir = firestore.Desc
		}
		q = q.OrderBy(sortBy, dir)
	}

	it := q.Documents(ctx)
	defer it.Stop()

	var out []map[string]any
	for {
		doc, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("db list %s: %v", collectionName, err)
			h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load data"})
			return
		}
		data := doc.Data()
		data["id"] = doc.Ref.ID
		out = append(out, data)
	}

	h.writeJSON(w, http.StatusOK, out)
}

// GET /api/db/{collection}/{id}
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := r.Context()

	collectionName := r.PathValue("collection")
	id := r.PathValue("id")
	if collectionName == "" || id == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "collection and id are required"})
		return
	}

	doc, err := h.fb.DB.Collection(collectionName).Doc(id).Get(ctx)
	if err != nil {
		log.Printf("db get %s/%s: %v", collectionName, id, err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load data"})
		return
	}
	data := doc.Data()
	data["id"] = doc.Ref.ID
	h.writeJSON(w, http.StatusOK, data)
}

// POST /api/db/{collection}
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := r.Context()

	collectionName := r.PathValue("collection")
	if collectionName == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "collection is required"})
		return
	}

	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}

	now := time.Now()
	if _, ok := payload["createdAt"]; !ok {
		payload["createdAt"] = now
	}
	payload["updatedAt"] = now

	ref, _, err := h.fb.DB.Collection(collectionName).Add(ctx, payload)
	if err != nil {
		log.Printf("db create %s: %v", collectionName, err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create document"})
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{"id": ref.ID})
}

// PATCH /api/db/{collection}/{id}
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch && r.Method != http.MethodPut {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := r.Context()

	collectionName := r.PathValue("collection")
	id := r.PathValue("id")
	if collectionName == "" || id == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "collection and id are required"})
		return
	}

	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}
	payload["updatedAt"] = time.Now()

	var updates []firestore.Update
	for k, v := range payload {
		updates = append(updates, firestore.Update{Path: k, Value: v})
	}

	_, err := h.fb.DB.Collection(collectionName).Doc(id).Update(ctx, updates)
	if err != nil {
		log.Printf("db update %s/%s: %v", collectionName, id, err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update document"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DELETE /api/db/{collection}/{id}
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := r.Context()

	collectionName := r.PathValue("collection")
	id := r.PathValue("id")
	if collectionName == "" || id == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "collection and id are required"})
		return
	}

	_, err := h.fb.DB.Collection(collectionName).Doc(id).Delete(ctx)
	if err != nil {
		log.Printf("db delete %s/%s: %v", collectionName, id, err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete document"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

