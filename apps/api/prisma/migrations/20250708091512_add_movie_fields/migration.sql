-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "awards" TEXT,
ADD COLUMN     "boxOffice" DECIMAL(65,30),
ADD COLUMN     "budget" DECIMAL(65,30),
ADD COLUMN     "director" TEXT,
ADD COLUMN     "plot" TEXT,
ADD COLUMN     "writers" TEXT;

-- CreateIndex
CREATE INDEX "movies_director_idx" ON "movies"("director");
