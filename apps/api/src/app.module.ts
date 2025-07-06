import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MoviesModule } from './movies/movies.module';
import { ActorsModule } from './actors/actors.module';
import { MovieRatingsModule } from './movie-ratings/movie-ratings.module';

@Module({
  imports: [MoviesModule, ActorsModule, MovieRatingsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
