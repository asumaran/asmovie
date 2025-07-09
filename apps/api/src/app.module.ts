import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { CommonModule } from "./common/common.module";
import { MoviesModule } from "./movies/movies.module";
import { ActorsModule } from "./actors/actors.module";
import { MovieRatingsModule } from "./movie-ratings/movie-ratings.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { SearchModule } from "./search/search.module";
import configuration from "./config/configuration";
import { validationSchema } from "./config/validation.schema";

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
    CommonModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    ActorsModule,
    MovieRatingsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
