FROM golang:1.22 AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY . .
RUN go build -o ingestion-video main.go

FROM gcr.io/distroless/base-debian12

WORKDIR /app
COPY --from=builder /app/ingestion-video .
CMD ["./ingestion-video"]
