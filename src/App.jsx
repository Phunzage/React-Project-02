// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 引入 axios
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';

// 从 backend.js 文件引入函数
import { getTrendingMovies, updateSearchCount } from './backend';

// 合法用户检查
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
    // 用户在搜索框中的输入
    const [searchTerm, setSearchTerm] = useState('');
    // 有没有报错
    const [errorMessage, setErrorMessage] = useState('');
    // 从TMDB api拿到的电影列表
    const [movieList, setMovieList] = useState([]);
    // 加载状态，是不是正在加载
    const [isLoading, setIsLoading] = useState(false);
    // 从后端数据库中拿到的热门电影
    const [trendingMovies, setTrendingMovies] = useState([]);
    // 防抖机制
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // 用户停止打字 500 毫秒后，发起网络请求
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    // 去 TMDB 获取电影函数，参数为空（空时获取2024年热门中国电影）
    const fetchMovies = async (query = '')  => {
        // 先启动加载动画，防止用户误认为页面卡死
        setIsLoading(true);
        setErrorMessage('');
        try {
            // 如果参数不为空，即用户输入电影信息后，去获取对应电影信息
            // 否则（空）获取2024热门中国电影
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?language=zh-CN&query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?language=zh-CN&primary_release_year=2024&sort_by=popularity.desc&with_origin_country=CN`;

            // 发起网络请求并等待结果
            // 告诉 TMDB 我是被授权的合法用户（携带API_KEY）请给我json格式的数据
            const response = await axios.get(endpoint, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${API_KEY}`
                }
            });

            // axios 自动解析成 json 并把数据存放到 data 中
            const data = response.data;

            // 如果没找到数据，提示错误信息并清空电影数据列表
            if(data.success === false) {
                setErrorMessage(data.status_message || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            // 成功拿到电影数据，存入电影数据列表，页面会自动刷新显示
            setMovieList(data.results || []);
            // 用户的搜索和 TMDB 返回的电影信息都不为空时
            // 跳转到 backend.js 中的 updateSearchCount 函数
            // 向 Go 后端发送请求，并执行“更新搜索次数”函数
            if(query && data.results.length > 0) {
                // 传入用户的搜索项和 TMDB 返回的电影信息
                await updateSearchCount(query, data.results[0]);
            }

        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            // 不管搜索成功还是失败，最后都要把加载动画关掉
            setIsLoading(false);
        }
    }

    // 获取热门电影函数
    const loadTrendingMovies = async () => {
        try {
            // 跳转 backend.js 中的 getTrendingMovies 函数
            const movies = await getTrendingMovies();
            // 将后端返回的热门电影数组（5个信息）存入热门电影数组中，自动渲染
            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    // 用户输入电影信息（searchTerm） 500 毫秒后变为 debouncedSearchTerm
    // 此时 debouncedSearchTerm 发生了改变，触发 fetchMovies 函数
    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    // 在页面刚刚打开时执行 加载热门电影 动作
    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className='pattern'/>
            <div className='wrapper'>
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
                    {/* 传入搜索参数 */}
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                {/* 当热门电影数组不为空时，渲染5个热门电影卡片 */}
                {trendingMovies.length > 0 && (
                    <section className='trending'>
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.id}>
                            <p>{index + 1}</p>
                            <img src={movie.poster_url} alt={movie.searchTerm} />
                        </li>
                        ))}
                    </ul>
                    </section>
                    )}

                    {/* 展示电影卡片页面 */}
                <section className='all-movies'>
                    <h2>All Movies</h2>
                    {/* 正在加载时，载入正在加载按钮 */}
                    {isLoading ? (
                        <Spinner />
                        // 否则看错误信息是否不为空
                        // 错误信息不为空，加载错误信息
                    ) : errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (
                        // 否则（无错误并无加载动画）加载电影卡片
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App;