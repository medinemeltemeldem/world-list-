-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PREPOSITION', 'PHRASAL_VERB', 'EXPRESSION', 'OTHER');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'LEARNED', 'DIFFICULT');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('EN_TO_TR', 'TR_TO_EN', 'MIXED', 'WRITTEN');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE_EN_TR', 'MULTIPLE_CHOICE_TR_EN', 'WRITTEN_EN', 'WRITTEN_TR', 'FILL_BLANK');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('REVIEW', 'QUIZ');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('REVIEW', 'QUIZ', 'STUDY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "englishWord" TEXT NOT NULL,
    "turkishMeaning" TEXT NOT NULL,
    "partOfSpeech" "PartOfSpeech" NOT NULL,
    "level" "Level" NOT NULL,
    "exampleSentence" TEXT,
    "turkishExample" TEXT,
    "note" TEXT,
    "status" "LearningStatus" NOT NULL DEFAULT 'NEW',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "reviewStep" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "pronunciation" TEXT,
    "ipa" TEXT,
    "definition" TEXT,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "antonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedWords" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordTag" (
    "wordId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "WordTag_pkey" PRIMARY KEY ("wordId","tagId")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "source" "ReviewSource" NOT NULL DEFAULT 'REVIEW',
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "QuizType" NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "level" "Level",
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSentence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "totalStudySeconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordsPerDay" INTEGER NOT NULL DEFAULT 10,
    "reviewsPerDay" INTEGER NOT NULL DEFAULT 20,

    CONSTRAINT "DailyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SessionType" NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "Word_userId_createdAt_idx" ON "Word"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Word_userId_learnedAt_idx" ON "Word"("userId", "learnedAt");

-- CreateIndex
CREATE INDEX "Word_userId_nextReviewAt_idx" ON "Word"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "Word_userId_status_idx" ON "Word"("userId", "status");

-- CreateIndex
CREATE INDEX "Word_userId_isFavorite_idx" ON "Word"("userId", "isFavorite");

-- CreateIndex
CREATE INDEX "Word_userId_wrongCount_idx" ON "Word"("userId", "wrongCount");

-- CreateIndex
CREATE INDEX "Review_userId_reviewedAt_idx" ON "Review"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "Review_wordId_idx" ON "Review"("wordId");

-- CreateIndex
CREATE INDEX "Quiz_userId_startedAt_idx" ON "Quiz"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_position_idx" ON "QuizQuestion"("quizId", "position");

-- CreateIndex
CREATE INDEX "QuizQuestion_wordId_idx" ON "QuizQuestion"("wordId");

-- CreateIndex
CREATE INDEX "UserSentence_wordId_idx" ON "UserSentence"("wordId");

-- CreateIndex
CREATE INDEX "UserSentence_userId_idx" ON "UserSentence"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyGoal_userId_key" ON "DailyGoal"("userId");

-- CreateIndex
CREATE INDEX "LearningSession_userId_createdAt_idx" ON "LearningSession"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTag" ADD CONSTRAINT "WordTag_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTag" ADD CONSTRAINT "WordTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSentence" ADD CONSTRAINT "UserSentence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSentence" ADD CONSTRAINT "UserSentence_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGoal" ADD CONSTRAINT "DailyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningSession" ADD CONSTRAINT "LearningSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
