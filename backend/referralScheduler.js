import cron from "node-cron";
import { query } from "./database/db.js";

console.log("Referral scheduler initialized...");

cron.schedule("*/15 * * * * *", async () => {
  console.log("Running referral job...");

  try {

    // ==============================================
    // 1️⃣ Generate referral codes for eligible users
    //    Uses user_id join (stable across migrations)
    // ==============================================
    await query(`
      INSERT INTO referrals (user_id, wallet_address, referral_code)
      SELECT u.id, u.wallet_address, upper(substr(md5(random()::text), 1, 8))
      FROM users u
      LEFT JOIN referrals r ON u.id = r.user_id
      WHERE u.total_points >= 100
      AND r.user_id IS NULL;
    `);

    // ==============================================
    // 1b. Sync referrals.wallet_address from users
    //     (handles cases where wallet changed via migration
    //      but user hasn't logged in yet to trigger reconcileUser)
    // ==============================================
    await query(`
      UPDATE referrals r
      SET wallet_address = u.wallet_address
      FROM users u
      WHERE r.user_id = u.id
      AND r.wallet_address IS DISTINCT FROM u.wallet_address;
    `);

    // ==============================================
    // 2️⃣ Update successful_ref counter
    //    Uses referral_code matching (stable identifier)
    //    instead of wallet_address joins
    // ==============================================
    await query(`
      UPDATE referrals r
      SET successful_ref = sub.success_count
      FROM (
          SELECT referred_by, COUNT(*) AS success_count
          FROM users
          WHERE total_points >= 30
          AND referred_by IS NOT NULL
          GROUP BY referred_by
      ) sub
      WHERE r.referral_code = sub.referred_by;
    `);

    // ==============================================
    // 3️⃣ Reward referrers
    //    Compares expected points vs already-given points
    //    to award only the difference
    // ==============================================
    const refs = await query(`
      SELECT r.user_id, r.successful_ref
      FROM referrals r
      WHERE r.successful_ref > 0;
    `);

    for (const ref of refs.rows) {
      const referrerId = ref.user_id;
      const successCount = ref.successful_ref;

      // How many reward points already given?
      const given = await query(`
        SELECT COALESCE(SUM(points), 0) AS total
        FROM points_history
        WHERE user_id = $1
        AND reason = 'referral_success_bonus';
      `, [referrerId]);

      const alreadyRewardedPoints = parseInt(given.rows[0].total);
      const expectedPoints = successCount * 50;

      if (expectedPoints > alreadyRewardedPoints) {
        const difference = expectedPoints - alreadyRewardedPoints;

        await query(`
          INSERT INTO points_history (id, user_id, points, reason, created_at)
          VALUES (gen_random_uuid(), $1, $2, 'referral_success_bonus', NOW());
        `, [referrerId, difference]);

        await query(`
          UPDATE users
          SET total_points = total_points + $1
          WHERE id = $2;
        `, [difference, referrerId]);

        console.log(`Gave ${difference} points to referrer ${referrerId}`);
      }
    }

  } catch (err) {
    console.error("Referral cron error:", err);
  }
});
