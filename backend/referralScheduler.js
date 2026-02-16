import cron from "node-cron";
import { query } from "./database/db.js";

console.log("Referral scheduler initialized...");

// Runs every hour
cron.schedule("* * * * *", async () => {
  console.log("Running hourly referral job...");

  try {
    // 1️⃣ Generate referral codes for eligible users
    await query(`
      INSERT INTO public.referrals (
          user_id,
          wallet_address,
          referral_code
      )
      SELECT
          u.id,
          u.wallet_address,
          upper(substr(md5(random()::text), 1, 8))
      FROM public.users u
      LEFT JOIN public.referrals r
          ON u.id = r.user_id
      WHERE u.total_points >= 100
      AND r.user_id IS NULL;
    `);

    console.log("Referral codes checked/created");

    // 2️⃣ Update successful_ref counts
    await query(`
      UPDATE referrals r
      SET successful_ref = sub.success_count
      FROM (
          SELECT u.referred_by, COUNT(*) AS success_count
          FROM users u
          WHERE u.total_points >= 10
            AND u.referred_by IS NOT NULL
          GROUP BY u.referred_by
      ) sub
      WHERE r.wallet_address = sub.referred_by;
    `);

    console.log("Successful referrals updated");

  } catch (err) {
    console.error("Referral cron error:", err);
  }
});
