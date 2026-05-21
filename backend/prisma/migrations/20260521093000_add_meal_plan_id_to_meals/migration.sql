ALTER TABLE "meals"
ADD COLUMN IF NOT EXISTS "mealPlanId" INTEGER;

CREATE INDEX IF NOT EXISTS "meals_mealPlanId_idx" ON "meals"("mealPlanId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meals_mealPlanId_fkey'
  ) THEN
    ALTER TABLE "meals"
    ADD CONSTRAINT "meals_mealPlanId_fkey"
    FOREIGN KEY ("mealPlanId")
    REFERENCES "meal_plans"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;
