package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string `json:"username" bson:"username"`
	Password string `json:"password" bson:"password"`
}

type Response struct {
	Message string `json:"message,omitempty"`
	Token   string `json:"token,omitempty"`
	Error   string `json:"error,omitempty"`
}

var userCollection *mongo.Collection

func main() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Lỗi kết nối MongoDB: %v", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Không thể ping tới MongoDB: %v", err)
	}
	fmt.Println("✅ Đã kết nối thành công tới MongoDB")

	userCollection = client.Database("training_db").Collection("users")

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/register", registerHandler)
	http.HandleFunc("/api/login", loginHandler)
	http.HandleFunc("/api/users", usersHandler) // Phục vụ clean-up dữ liệu khi test

	port := ":3000"
	fmt.Printf("🚀 Server đang chạy tại http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	sendJSON(w, http.StatusOK, Response{Message: "OK"})
}

func sendJSON(w http.ResponseWriter, status int, res Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(res)
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, Response{Error: "Phương thức không được hỗ trợ"})
		return
	}

	var req User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Password == "" {
		sendJSON(w, http.StatusBadRequest, Response{Error: "Username và password không được để trống"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Kiểm tra xem username đã tồn tại chưa
	count, err := userCollection.CountDocuments(ctx, bson.M{"username": req.Username})
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, Response{Error: "Lỗi kiểm tra dữ liệu"})
		return
	}
	if count > 0 {
		sendJSON(w, http.StatusConflict, Response{Error: "Tài khoản đã tồn tại"})
		return
	}

	// Hash password trước khi lưu vào MongoDB
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, Response{Error: "Lỗi mã hóa mật khẩu"})
		return
	}

	_, err = userCollection.InsertOne(ctx, User{
		Username: req.Username,
		Password: string(hashedPassword),
	})
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, Response{Error: "Lỗi lưu người dùng vào database"})
		return
	}

	sendJSON(w, http.StatusCreated, Response{Message: "Đăng ký thành công"})
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, Response{Error: "Phương thức không được hỗ trợ"})
		return
	}

	var req User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Password == "" {
		sendJSON(w, http.StatusBadRequest, Response{Error: "Username và password không được để trống"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user User
	err := userCollection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&user)
	if err != nil {
		sendJSON(w, http.StatusUnauthorized, Response{Error: "Tài khoản hoặc mật khẩu không chính xác"})
		return
	}

	// So sánh mật khẩu đã hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		sendJSON(w, http.StatusUnauthorized, Response{Error: "Tài khoản hoặc mật khẩu không chính xác"})
		return
	}

	// Trả về token mẫu phục vụ test
	fakeToken := fmt.Sprintf("mock-token-%s-%d", user.Username, time.Now().Unix())
	sendJSON(w, http.StatusOK, Response{
		Message: "Đăng nhập thành công",
		Token:   fakeToken,
	})
}

// Endpoint hỗ trợ dọn dẹp dữ liệu test (DELETE /api/users?username=xxx hoặc DELETE /api/users để xóa toàn bộ)
func usersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		sendJSON(w, http.StatusMethodNotAllowed, Response{Error: "Phương thức không được hỗ trợ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	username := r.URL.Query().Get("username")
	filter := bson.M{}
	if username != "" {
		filter = bson.M{"username": username}
	}

	_, err := userCollection.DeleteMany(ctx, filter)
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, Response{Error: "Lỗi xóa dữ liệu"})
		return
	}

	sendJSON(w, http.StatusOK, Response{Message: "Đã dọn dẹp dữ liệu"})
}
