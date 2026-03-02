import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBMultiResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

interface TMDBMultiSearchResponse {
  results: TMDBMultiResult[];
  total_results: number;
  total_pages: number;
}

@Injectable()
export class TmdbService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p';

  constructor() {
    // 환경변수에서 API 키 가져오기 (없으면 빈 문자열)
    this.apiKey = process.env.TMDB_API_KEY || '';
  }

  /**
   * 영화 검색
   */
  async searchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query,
          page,
          language: 'ko-KR',
          include_adult: false,
        },
      });

      return response.data;
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw new Error('Failed to search movies from TMDB');
    }
  }

  /**
   * 영화 + TV 프로그램 통합 검색
   */
  async searchMulti(query: string, page = 1): Promise<TMDBMultiSearchResponse> {
    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search/multi`, {
        params: {
          api_key: this.apiKey,
          query,
          page,
          language: 'ko-KR',
          include_adult: false,
        },
      });

      return response.data;
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw new Error('Failed to search from TMDB');
    }
  }

  /**
   * 영화 상세 정보 조회
   */
  async getMovieDetails(movieId: number) {
    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/movie/${movieId}`, {
        params: {
          api_key: this.apiKey,
          language: 'ko-KR',
        },
      });

      return response.data;
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw new Error('Failed to get movie details from TMDB');
    }
  }

  /**
   * 이미지 URL 생성
   * @param path - 이미지 경로 (poster_path 또는 backdrop_path)
   * @param size - 이미지 크기 (w500, w780, original 등)
   */
  getImageUrl(path: string | null, size = 'original'): string | null {
    if (!path) return null;
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  /**
   * 검색 결과를 프론트엔드 친화적인 형태로 변환
   */
  formatSearchResults(response: TMDBSearchResponse) {
    return {
      results: response.results.map((movie) => ({
        id: movie.id,
        mediaType: 'movie' as const,
        title: movie.title,
        originalTitle: movie.original_title,
        overview: movie.overview,
        posterUrl: this.getImageUrl(movie.poster_path),
        backdropUrl: this.getImageUrl(movie.backdrop_path),
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
      })),
      totalResults: response.total_results,
      totalPages: response.total_pages,
    };
  }

  /**
   * 통합 검색 결과를 프론트엔드 친화적인 형태로 변환
   */
  formatMultiSearchResults(response: TMDBMultiSearchResponse) {
    return {
      results: response.results
        .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => ({
          id: item.id,
          mediaType: item.media_type,
          title: item.media_type === 'movie' ? item.title : item.name,
          originalTitle: item.media_type === 'movie' ? item.original_title : item.original_name,
          overview: item.overview,
          posterUrl: this.getImageUrl(item.poster_path),
          backdropUrl: this.getImageUrl(item.backdrop_path),
          releaseDate: item.media_type === 'movie' ? item.release_date : item.first_air_date,
          voteAverage: item.vote_average,
        })),
      totalResults: response.total_results,
      totalPages: response.total_pages,
    };
  }
}
