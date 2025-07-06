import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MoviesModule } from './movies/movies.module';
import { ActorsModule } from './actors/actors.module';
import { MovieRatingsModule } from './movie-ratings/movie-ratings.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      isGlobal: true,
    }),
    MoviesModule,
    ActorsModule,
    MovieRatingsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
