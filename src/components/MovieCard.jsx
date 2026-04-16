import React from 'react'

// 电影卡片动画，参数：电影结构体（标题，打分，海报路径，发布日期，语言）
const MovieCard = ({ movie:
    { title, vote_average, poster_path, release_date, original_language }
 }) => {
    return (
        <div className='movie-card'>
            <img src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'} alt={title} />
            <div className='mt-4'>
                <h3>{title}</h3>
                <div className='content'>
                    <div className='rating'>
                        <img src="star.svg" alt="Star Icon" />
                        {/* 若有评分，则取一位小数，否则为“N/A” */}
                        <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                    </div>
                    <span>·</span>
                    <p className='lang'>{original_language}</p>
                    <span>·</span>
                    {/* 发布日期同理 */}
                    <p className='year'>{release_date ? release_date.split('-')[0] : 'N/A'}</p>
                </div>
            </div>
        </div>
    )
}

export default MovieCard