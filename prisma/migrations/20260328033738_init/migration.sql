-- CreateEnum
CREATE TYPE "ProposalSource" AS ENUM ('UPLOAD', 'MANUAL');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'GENERATED', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SENT', 'IN_ANALYSIS', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "purpose" TEXT NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "financialCharges" DECIMAL(8,4) NOT NULL,
    "iof" DECIMAL(15,2) NOT NULL,
    "guarantees" TEXT NOT NULL,
    "successFee" DECIMAL(8,4) NOT NULL,
    "proposalDate" TIMESTAMP(3) NOT NULL,
    "sourceType" "ProposalSource" NOT NULL DEFAULT 'MANUAL',
    "extractionScore" DOUBLE PRECISION,
    "pdfData" BYTEA,
    "pdfFileName" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_submissions" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SENT',
    "notes" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "banks_name_key" ON "banks"("name");

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_submissions" ADD CONSTRAINT "bank_submissions_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_submissions" ADD CONSTRAINT "bank_submissions_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
