-- AlterTable
ALTER TABLE "users" ADD COLUMN     "livesCount" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "livesLastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "user_category_test_progress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "stageKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_category_test_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_category_test_progress_userId_categoryId_idx" ON "user_category_test_progress"("userId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "user_category_test_progress_userId_categoryId_stageKey_key" ON "user_category_test_progress"("userId", "categoryId", "stageKey");

-- AddForeignKey
ALTER TABLE "user_category_test_progress" ADD CONSTRAINT "user_category_test_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_category_test_progress" ADD CONSTRAINT "user_category_test_progress_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
