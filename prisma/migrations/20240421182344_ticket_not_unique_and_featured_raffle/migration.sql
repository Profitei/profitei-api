-- DropIndex
DROP INDEX "Ticket_name_key";

-- AlterTable
ALTER TABLE "Raffle" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT true;
