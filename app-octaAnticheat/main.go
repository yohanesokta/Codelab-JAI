package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type StatusResponse struct {
	ActiveWindow string `json:"active_window"`
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}

		log.Printf("Incoming %s request from %s (Origin: %s) for %s", r.Method, r.RemoteAddr, origin, r.URL.Path)

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Private-Network, Access-Control-Request-Private-Network")
		w.Header().Set("Access-Control-Allow-Private-Network", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")
		w.Header().Set("Vary", "Origin, Access-Control-Request-Private-Network")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	activeWindow := getActiveWindowTitle()
	log.Printf("Pengecekan: %s", activeWindow)

	response := StatusResponse{
		ActiveWindow: activeWindow,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/status", enableCORS(handleStatus))
	http.HandleFunc("/ping", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "pong")
	}))

	fmt.Println("OctaAnticheat Go Server running on http://localhost:9012")
	log.Fatal(http.ListenAndServe(":9012", nil))
}
