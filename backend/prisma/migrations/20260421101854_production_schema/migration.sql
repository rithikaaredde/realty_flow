/*
  Warnings:

  - The values [Pending,Denied,Approved] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending,Paid,PartiallyPaid,Overdue] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Rooms,Tinyhouse,Apartment,Villa,Townhouse,Cottage] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `email` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `tenantCognitoId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `tenantCognitoId` on the `Lease` table. All the data in the column will be lost.
  - The `amenities` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `highlights` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Manager` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TenantFavorites` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[leaseId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `financialInfo` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalInfo` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Made the column `numberOfReviews` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TENANT', 'MANAGER');

-- CreateEnum
CREATE TYPE "Amenity" AS ENUM ('WasherDryer', 'AirConditioning', 'Dishwasher', 'HighSpeedInternet', 'HardwoodFloors', 'LaundryFacilities', 'SmokeFree', 'CableReady', 'SatelliteTv', 'DoubleVanities', 'TubShower', 'Intercom', 'SprinklerSystem', 'RecentlyRenovated', 'CloseToTransit', 'GreatView', 'QuietNeighborhood', 'OutdoorSpace', 'PetFriendly', 'SecuritySystem', 'FireplaceType', 'Gym', 'RooftopDeck', 'FitnessCenter', 'Balcony', 'SmartHomeTechnology', 'EV', 'Furnished');

-- CreateEnum
CREATE TYPE "Highlight" AS ENUM ('HighSpeedInternetAccess', 'WasherDryer', 'AirConditioning', 'Dishwasher', 'HeatingSystem', 'SmokeFreePolicy', 'CableSatelliteTV', 'AllUtilitiesIncluded');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PENDING', 'DENIED', 'APPROVED');
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'PARTIALLYREFUNDED', 'REFUNDED');
ALTER TABLE "Payment" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PropertyType_new" AS ENUM ('ROOMS', 'TINYHOUSE', 'APARTMENT', 'VILLA', 'TOWNHOUSE', 'COTTAGE');
ALTER TABLE "Property" ALTER COLUMN "propertyType" TYPE "PropertyType_new" USING ("propertyType"::text::"PropertyType_new");
ALTER TYPE "PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "PropertyType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_tenantCognitoId_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_tenantCognitoId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_managerId_fkey";

-- DropForeignKey
ALTER TABLE "_TenantFavorites" DROP CONSTRAINT "_TenantFavorites_A_fkey";

-- DropForeignKey
ALTER TABLE "_TenantFavorites" DROP CONSTRAINT "_TenantFavorites_B_fkey";

-- DropIndex
DROP INDEX "Property_locationId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "email",
DROP COLUMN "message",
DROP COLUMN "name",
DROP COLUMN "phoneNumber",
DROP COLUMN "tenantCognitoId",
ADD COLUMN     "additionalInfo" JSONB,
ADD COLUMN     "financialInfo" JSONB NOT NULL,
ADD COLUMN     "personalInfo" JSONB NOT NULL,
ADD COLUMN     "references" JSONB,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "tenantCognitoId",
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "paymentDate" DROP NOT NULL,
ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "amenities",
ADD COLUMN     "amenities" "Amenity"[],
DROP COLUMN "highlights",
ADD COLUMN     "highlights" "Highlight"[],
ALTER COLUMN "numberOfReviews" SET NOT NULL,
ALTER COLUMN "numberOfReviews" SET DEFAULT 0;

-- DropTable
DROP TABLE "Manager";

-- DropTable
DROP TABLE "Tenant";

-- DropTable
DROP TABLE "_TenantFavorites";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "cognitoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TENANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFavorites" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoId_key" ON "User"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFavorites_AB_unique" ON "_UserFavorites"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFavorites_B_index" ON "_UserFavorites"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Application_leaseId_key" ON "Application"("leaseId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavorites" ADD CONSTRAINT "_UserFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavorites" ADD CONSTRAINT "_UserFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
