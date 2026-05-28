-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_voucherId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "voucherId";

-- DropTable
DROP TABLE "Voucher";
