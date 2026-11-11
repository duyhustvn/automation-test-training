# ==========================================
# Stage 1: Build static Go binary
# ==========================================
FROM golang:alpine AS builder

WORKDIR /app

# Tải trước dependencies (tận dụng Docker layer cache)
COPY go.mod go.sum ./
RUN go mod download

# Sao chép mã nguồn và biên dịch static binary
COPY src/ ./src/
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./src

# ==========================================
# Stage 2: Minimal runtime image
# ==========================================
FROM alpine:3.20

WORKDIR /app

# Cài đặt chứng chỉ CA và curl phục vụ healthcheck
RUN apk --no-cache add ca-certificates curl

# Tạo user không đặc quyền vì lý do bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Sao chép binary từ stage builder
COPY --from=builder /app/server /app/server

# Chuyển sang non-root user
USER appuser

# Khai báo cổng mặc định
EXPOSE 3000

ENV PORT=3000 \
    MONGO_URI=mongodb://mongo:27017

# Kiểm tra tình trạng sức khỏe của ứng dụng
HEALTHCHECK --interval=5s --timeout=3s --retries=5 --start-period=3s \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["/app/server"]
