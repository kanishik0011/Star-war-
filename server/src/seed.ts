import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { User } from './models/User.js';

async function seed(): Promise<void> {
  await connectDatabase();
  const passwordHash = await bcrypt.hash(env.DEMO_USER_PASSWORD, 12);
  await User.updateOne(
    { email: env.DEMO_USER_EMAIL },
    {
      $set: {
        name: 'Demo Explorer',
        email: env.DEMO_USER_EMAIL,
        passwordHash,
        role: 'user',
      },
    },
    { upsert: true },
  );
  logger.info({ email: env.DEMO_USER_EMAIL }, 'Demo user seeded');
  await disconnectDatabase();
}

void seed().catch(async (error: unknown) => {
  logger.error({ error }, 'Seed failed');
  await disconnectDatabase();
  process.exit(1);
});
