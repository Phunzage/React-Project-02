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
	ID         uint   `gorm:"primaryKey" json:"id"`          // 主键，每条记录的唯一标识
	SearchTerm string `gorm:"uniqueIndex" json:"searchTerm"` // 关键词设为唯一索引
	Count      int    `json:"count"`                         // 搜索次数
	MovieID    int    `json:"movie_id"`
	PosterURL  string `json:"poster_url"`
}

// UpdateRequest 前端发送的请求数据结构，规定前端传来的数据必须长什么样
// 前端发来的数据需要包括：搜索的电影名、电影id，海报路径
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

	// 自动迁移模式，自动在 PostgreSQL 中建一个同名表
	db.AutoMigrate(&TrendingMovie{})

	// gin初始化
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
			// 创建一个存放电影的数组
			var movies []TrendingMovie
			// 按 count 降序排列，限制取5条，把结果放进movies数组中
			db.Order("count desc").Limit(5).Find(&movies)
			// 把装满电影数据的数组发送给前端
			c.JSON(http.StatusOK, movies)
		})

		// POST /api/trending：更新或创建搜索统计
		api.POST("/trending", func(c *gin.Context) {
			// 接收前端发来的搜索电影信息
			var req UpdateRequest
			// 看发来的信息结构是否正确（按照UpdateRequset的结构做拆解，拆解失败就报错）
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
				return
			}

			var movie TrendingMovie
			// 查找是否已经有该 searchTerm
			result := db.Where("search_term = ?", req.SearchTerm).First(&movie)

			// 如果没找到，就说明是第一次查询这个电影
			// 新建一条电影数据，次数设为1
			if result.Error != nil && result.Error == gorm.ErrRecordNotFound {
				movie = TrendingMovie{
					SearchTerm: req.SearchTerm,
					Count:      1,
					MovieID:    req.MovieID,
					PosterURL:  req.PosterURL,
				}
				// 存入到数据库中
				db.Create(&movie)
			} else {
				// 否则（数据库中找到这条电影信息），搜索次数+1
				movie.Count += 1
				// 可选：如果同一搜索词对应了新的热门电影，也可以更新海报
				movie.MovieID = req.MovieID
				movie.PosterURL = req.PosterURL
				db.Save(&movie)
			}

			// 发送给前端告知成功
			c.JSON(http.StatusOK, gin.H{"status": "success", "data": movie})
		})
	}

	// 运行后端服务器在 8080 端口
	log.Println("Go Backend is running on http://localhost:8080")
	r.Run(":8080")
}
