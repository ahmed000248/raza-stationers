-- AlterTable
ALTER TABLE "public"."users"
  ADD COLUMN "supabase_auth_id" TEXT,
  ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_auth_id_key" ON "public"."users"("supabase_auth_id");
