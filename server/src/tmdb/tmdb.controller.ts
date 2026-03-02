import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('tmdb')
@UseGuards(JwtAuthGuard, AdminGuard) // Admin만 접근 가능
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  /**
   * 영화 + TV 프로그램 통합 검색
   * GET /tmdb/search?query=인셉션&page=1
   */
  @Get('search')
  async searchMulti(
    @Query('query') query: string,
    @Query('page') page?: string,
  ) {
    if (!query) {
      return { results: [], totalResults: 0, totalPages: 0 };
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const response = await this.tmdbService.searchMulti(query, pageNum);
    return this.tmdbService.formatMultiSearchResults(response);
  }

  /**
   * 영화 상세 정보 조회
   * GET /tmdb/movie/:id
   */
  @Get('movie/:id')
  async getMovieDetails(@Param('id') id: string) {
    const movieId = parseInt(id, 10);
    const details = await this.tmdbService.getMovieDetails(movieId);

    return {
      id: details.id,
      title: details.title,
      originalTitle: details.original_title,
      overview: details.overview,
      posterUrl: this.tmdbService.getImageUrl(details.poster_path),
      backdropUrl: this.tmdbService.getImageUrl(details.backdrop_path),
      releaseDate: details.release_date,
      voteAverage: details.vote_average,
      genres: details.genres,
      runtime: details.runtime,
    };
  }
}
