/*
  Warnings:

  - You are about to drop the column `categotyId` on the `Raffle` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Raffle" DROP CONSTRAINT "Raffle_categotyId_fkey";

-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "categotyId",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
