import cron from 'node-cron';
import { eq, lt, isNotNull, and } from 'drizzle-orm';
import { db } from '../config/db.ts';
import * as schema from '../db/schema/index.ts';
import { logger } from '../config/logger.ts';
import { revokeAppleAccount } from '../shared/utils/apple.ts';

const GRACE_PERIOD_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

export async function cleanupExpiredAccounts() {
  logger.info('Running cleanup job for expired accounts...');

  try {
    const cutoffDate = new Date(Date.now() - GRACE_PERIOD_MS);

    // Find all users who requested deletion before the cutoff date
    const expiredUsers = await db.query.user.findMany({
      where: and(
        isNotNull(schema.user.deletionRequestedAt),
        lt(schema.user.deletionRequestedAt, cutoffDate),
      ),
    });

    if (expiredUsers.length === 0) {
      logger.info('No expired accounts to clean up.');
      return;
    }

    logger.info(`Found ${expiredUsers.length} expired accounts to delete.`);

    for (const user of expiredUsers) {
      try {
        logger.info(`Processing deletion for user`, {
          userId: user.id,
          name: user.name,
          email: user.email,
          deletionRequestedAt: user.deletionRequestedAt,
        });

        // 1. Fetch OAuth accounts to see if we need to revoke Apple token
        const accounts = await db.query.account.findMany({
          where: eq(schema.account.userId, user.id),
        });
        const appleAccount = accounts.find((a) => a.providerId === 'apple');

        if (appleAccount) {
          logger.info(`Found Apple account for user ${user.id}`, {
            hasRefreshToken: !!appleAccount.refreshToken,
            hasAccessToken: !!appleAccount.accessToken,
          });
          await revokeAppleAccount(appleAccount);
        }

        // 2. Hard delete the user
        await db.delete(schema.user).where(eq(schema.user.id, user.id));
        logger.info(`Successfully deleted user ${user.id}`);
      } catch (err: unknown) {
        logger.error(`Failed to process deletion for user ${user.id}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info('Cleanup job for expired accounts completed.');
  } catch (error: unknown) {
    logger.error('Failed to run cleanup job for expired accounts', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Schedule the job to run every 30 minutes
export function initCronJobs() {
  cron.schedule('*/30 * * * *', () => {
    cleanupExpiredAccounts();
  });
  logger.info(
    'Cron jobs initialized: cleanupExpiredAccounts (every 30 minutes)',
  );
}
