// src/backend.js
import axios from 'axios';

// 你的本地 Go 后端运行地址
const BACKEND_URL = 'http://localhost:8080/api';

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        await axios.post(`${BACKEND_URL}/trending`, {
            searchTerm: searchTerm,
            movie_id: movie.id,
            poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        });
    } catch (error) {
        console.error('更新搜索统计失败:', error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}/trending`);
        // 返回后端给的数据
        return response.data;
    } catch (error) {
        console.error('获取热门电影失败:', error);
        return [];
    }
}