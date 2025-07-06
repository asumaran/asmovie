-- CreateIndex
CREATE INDEX "actors_name_idx" ON "actors"("name");

-- CreateIndex
CREATE INDEX "actors_birthDate_idx" ON "actors"("birthDate");

-- CreateIndex
CREATE INDEX "actors_createdAt_idx" ON "actors"("createdAt");

-- CreateIndex
CREATE INDEX "movie_ratings_movieId_idx" ON "movie_ratings"("movieId");

-- CreateIndex
CREATE INDEX "movie_ratings_rating_idx" ON "movie_ratings"("rating");

-- CreateIndex
CREATE INDEX "movie_ratings_reviewer_idx" ON "movie_ratings"("reviewer");

-- CreateIndex
CREATE INDEX "movie_ratings_createdAt_idx" ON "movie_ratings"("createdAt");

-- CreateIndex
CREATE INDEX "movie_ratings_movieId_rating_idx" ON "movie_ratings"("movieId", "rating");

-- CreateIndex
CREATE INDEX "movies_title_idx" ON "movies"("title");

-- CreateIndex
CREATE INDEX "movies_genre_idx" ON "movies"("genre");

-- CreateIndex
CREATE INDEX "movies_releaseYear_idx" ON "movies"("releaseYear");

-- CreateIndex
CREATE INDEX "movies_title_genre_idx" ON "movies"("title", "genre");

-- CreateIndex
CREATE INDEX "movies_createdAt_idx" ON "movies"("createdAt");
