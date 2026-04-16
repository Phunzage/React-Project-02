// src/backend.js
import axios from 'axios';

// 本地 Go 后端运行地址
const BACKEND_URL = 'http://localhost:8080/api';

// 更新搜索统计函数，参数：搜索项，电影信息
export const updateSearchCount = async (searchTerm, movie) => {
    try {
        // 向后端发送地址和电影信息
        // 后端会触发main.go里的POST("/trending")
        await axios.post(`${BACKEND_URL}/trending`, {
            searchTerm: searchTerm,
            movie_id: movie.id,
            poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        });
    } catch (error) {
        console.error('更新搜索统计失败:', error);
    }
}

// 获取热门电影函数
export const getTrendingMovies = async () => {
    try {
        // 向后端发送get请求，向后端要数据
        const response = await axios.get(`${BACKEND_URL}/trending`);
        // 返回后端给的数据
        return response.data;
    } catch (error) {
        console.error('获取热门电影失败:', error);
        return [];
    }
}