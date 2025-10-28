-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_appointmentId_fkey";

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appoinments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
