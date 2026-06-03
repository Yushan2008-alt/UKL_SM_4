-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SELLER_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'SELLER_REGISTRATION';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "category" TEXT,
ADD COLUMN     "sellerStatus" "SellerStatus",
ADD COLUMN     "shopDescription" TEXT,
ADD COLUMN     "shopLogo" TEXT,
ADD COLUMN     "shopName" TEXT;
