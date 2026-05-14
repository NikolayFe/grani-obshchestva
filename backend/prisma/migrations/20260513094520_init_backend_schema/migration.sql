-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('category', 'glossary_term');

-- CreateEnum
CREATE TYPE "DailyProgressStatus" AS ENUM ('in_progress', 'finished', 'failed');

-- CreateEnum
CREATE TYPE "TestContext" AS ENUM ('daily', 'category');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" DATE,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "categoryId" UUID,
    "text" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "source" "QuestionSource" NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_tests" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "seed" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "daily_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_test_questions" (
    "id" UUID NOT NULL,
    "dailyTestId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "daily_test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_daily_progress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dailyTestId" UUID NOT NULL,
    "livesLeft" INTEGER NOT NULL DEFAULT 3,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" "DailyProgressStatus" NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "user_daily_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_answers" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "selectedOptionId" UUID NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testContext" "TestContext" NOT NULL,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "terms_categoryId_idx" ON "terms"("categoryId");

-- CreateIndex
CREATE INDEX "questions_categoryId_idx" ON "questions"("categoryId");

-- CreateIndex
CREATE INDEX "question_options_questionId_idx" ON "question_options"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_tests_date_key" ON "daily_tests"("date");

-- CreateIndex
CREATE INDEX "daily_test_questions_questionId_idx" ON "daily_test_questions"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_test_questions_dailyTestId_orderIndex_key" ON "daily_test_questions"("dailyTestId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "daily_test_questions_dailyTestId_questionId_key" ON "daily_test_questions"("dailyTestId", "questionId");

-- CreateIndex
CREATE INDEX "user_daily_progress_dailyTestId_idx" ON "user_daily_progress"("dailyTestId");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_progress_userId_dailyTestId_key" ON "user_daily_progress"("userId", "dailyTestId");

-- CreateIndex
CREATE INDEX "user_answers_userId_answeredAt_idx" ON "user_answers"("userId", "answeredAt");

-- CreateIndex
CREATE INDEX "user_answers_questionId_idx" ON "user_answers"("questionId");

-- CreateIndex
CREATE INDEX "user_answers_selectedOptionId_idx" ON "user_answers"("selectedOptionId");

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_test_questions" ADD CONSTRAINT "daily_test_questions_dailyTestId_fkey" FOREIGN KEY ("dailyTestId") REFERENCES "daily_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_test_questions" ADD CONSTRAINT "daily_test_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_progress" ADD CONSTRAINT "user_daily_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_progress" ADD CONSTRAINT "user_daily_progress_dailyTestId_fkey" FOREIGN KEY ("dailyTestId") REFERENCES "daily_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
