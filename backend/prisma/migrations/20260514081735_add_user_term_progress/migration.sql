-- CreateTable
CREATE TABLE "user_term_progress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "termId" UUID NOT NULL,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_term_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_term_progress_userId_idx" ON "user_term_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_term_progress_userId_termId_key" ON "user_term_progress"("userId", "termId");

-- AddForeignKey
ALTER TABLE "user_term_progress" ADD CONSTRAINT "user_term_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_term_progress" ADD CONSTRAINT "user_term_progress_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
