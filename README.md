# Movie Search App (全栈电影搜索应用)

这是一个使用 **React** 作为前端、**Go (Gin)** 作为后端的全栈电影搜索应用。用户可以实时搜索电影、查看 2024 年热门中国电影，并查看基于用户搜索频率生成的“热门搜索”排行榜。

## 页面展示
![alt text](image.png)

## 核心功能

* **实时电影搜索**：集成了 TMDB API，支持按关键词搜索全球电影。
* **搜索防抖处理**：使用 `react-use` 的 `useDebounce` 减少不必要的网络请求，提升性能。
* **热门趋势排行榜**：后端通过 PostgreSQL 数据库记录并统计用户的搜索行为，自动返回前 5 个最热门的搜索记录。
* **默认推荐**：在无搜索输入时，默认展示 2024 年热门中国电影列表。
* **响应式 UI**：使用 Tailwind CSS 结合自定义 `@theme` 配置，打造深色模式的精美视觉体验。
* **加载状态反馈**：内置自定义 Spinner 加载动画，提供良好的用户交互反馈。

## 技术栈

### 前端
* **框架**: React (Vite)
* **样式**: Tailwind CSS
* **网络请求**: Axios
* **状态管理**: React Hooks (`useState`, `useEffect`)
* **工具库**: `react-use` (防抖处理)

### 后端
* **语言**: Go 1.25.7
* **框架**: Gin Web Framework
* **数据库**: PostgreSQL
* **ORM**: GORM
* **跨域处理**: Gin-CORS

## 🚀 快速开始

### 前提条件
* 已安装 [Node.js](https://nodejs.org/)
* 已安装 [Go](https://go.dev/)
* 已安装并运行 [PostgreSQL](https://www.postgresql.org/)
* 拥有 [TMDB API Key](https://www.themoviedb.org/documentation/api)

### 1. 后端配置 (Go)
1. 进入后端目录：`cd src/movie-backend`
2. 配置数据库连接：在 `main.go` 中修改 `dsn` 字符串中的用户名、密码和数据库名。
3. 运行后端：
   ```bash
   go run main.go
   ```
   后端服务将运行在 `http://localhost:8080`。

### 2. 前端配置 (React)
1. 在项目根目录创建 `.env` 文件，并添加你的 TMDB API Key：
   ```env
   VITE_TMDB_API_KEY=你的_TMDB_API_密钥
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 📂 项目结构

* `src/App.jsx`: 前端核心逻辑，负责状态管理和 TMDB 数据获取。
* `src/backend.js`: 封装与 Go 后端的 API 交互函数。
* `src/components/`: 包含 `MovieCard`（电影卡片）、`Search`（搜索框）和 `Spinner`（加载动画）等组件。
* `src/movie-backend/main.go`: 后端程序入口，定义了数据库模型和 `/api/trending` 接口。
* `src/index.css`: 定义了全局样式、自定义主题颜色和布局类。

## 📡 API 接口说明 (后端)

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| **GET** | `/api/trending` | 从数据库获取前 5 个最热门的电影搜索项 |
| **POST** | `/api/trending` | 发送搜索词和电影信息，更新或创建搜索统计记录 |

---
*注：该项目目前配置为开发环境使用，跨域已设置为允许所有源。*