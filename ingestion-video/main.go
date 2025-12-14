package main

import (
    "context"
    "log"
    "os"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
)

type AppContext struct {
    DB *pgx.Conn
}

func main() {
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        dbURL = "postgres://roadsense:roadsense@postgres:5432/roadsense?sslmode=disable"
    }

    ctx := context.Background()
    conn, err := pgx.Connect(ctx, dbURL)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }

    appCtx := &AppContext{DB: conn}
    app := fiber.New()

    app.Post("/video/upload", appCtx.UploadVideo)
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"status": "ok"})
    })

    log.Println("IngestionVideo microservice running on port 8080")
    log.Fatal(app.Listen(":8080"))
}

func (a *AppContext) UploadVideo(c *fiber.Ctx) error {
    file, err := c.FormFile("file")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "File is required",
        })
    }

    videoID := uuid.New()

    _, err = a.DB.Exec(
        context.Background(),
        `INSERT INTO videos (id, filename, uploaded_at, source_type)
         VALUES ($1, $2, $3, $4)`,
        videoID, file.Filename, time.Now(), "dashcam",
    )
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "DB insert failed",
        })
    }

    return c.JSON(fiber.Map{
        "video_id": videoID,
        "filename": file.Filename,
        "status":   "video registered",
    })
}
