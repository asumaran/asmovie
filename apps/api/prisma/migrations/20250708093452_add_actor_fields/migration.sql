-- AlterTable
ALTER TABLE "actors" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "placeOfBirth" TEXT;

-- CreateIndex
CREATE INDEX "actors_dateOfBirth_idx" ON "actors"("dateOfBirth");

-- CreateIndex
CREATE INDEX "actors_nationality_idx" ON "actors"("nationality");
