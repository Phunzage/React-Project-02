package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// TrendingMovie 对应数据库中的表结构
type TrendingMovie struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	SearchTerm string `gorm:"uniqueIndex" json:"searchTerm"` // 关键词设为唯一索引
	Count      int    `json:"count"`
	MovieID    int    `json:"movie_id"`
	PosterURL  string `json:"poster_url"`
}

// UpdateRequest 前端发送的请求数据结构
type UpdateRequest struct {
	SearchTerm string `json:"searchTerm"`
	MovieID    int    `json:"movie_id"`
	PosterURL  string `json:"poster_url"`
}

func main() {
	// 配置 PostgreSQL 数据库连接
	dsn := "host=localhost user=postgres password=3143 dbname=moviedb port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("无法连接到数据库:", err)
	}

	// 自动迁移模式，自动在 PostgreSQL 中建表
	db.AutoMigrate(&TrendingMovie{})

	r := gin.Default()

	// 配置跨域(CORS)，允许 React 前端访问
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // 允许所有源，开发环境用
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		// GET /api/trending：获取前 5 个最热门的搜索记录
		api.GET("/trending", func(c *gin.Context) {
			var movies []TrendingMovie
			// 对应 Appwrite 的 OrderDesc("count") 和 Limit(5)
			db.Order("count desc").Limit(5).Find(&movies)
			c.JSON(http.StatusOK, movies)
		})

		// POST /api/trending：更新或创建搜索统计
		api.POST("/trending", func(c *gin.Context) {
			var req UpdateRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
				return
			}

			var movie TrendingMovie
			// 查找是否已经有该 searchTerm
			result := db.Where("search_term = ?", req.SearchTerm).First(&movie)

			if result.Error != nil && result.Error == gorm.ErrRecordNotFound {
				// 对应 Appwrite 的 createDocument
				movie = TrendingMovie{
					SearchTerm: req.SearchTerm,
					Count:      1,
					MovieID:    req.MovieID,
					PosterURL:  req.PosterURL,
				}
				db.Create(&movie)
			} else {
				// 对应 Appwrite 的 updateDocument
				movie.Count += 1
				// 可选：如果同一搜索词对应了新的热门电影，也可以更新海报
				movie.MovieID = req.MovieID
				movie.PosterURL = req.PosterURL
				db.Save(&movie)
			}

			c.JSON(http.StatusOK, gin.H{"status": "success", "data": movie})
		})
	}

	// 运行后端服务器在 8080 端口
	log.Println("Go Backend is running on http://localhost:8080")
	r.Run(":8080")
}