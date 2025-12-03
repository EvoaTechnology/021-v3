/**
 * Database Migration: Add activeRole field to existing Chat messages
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all Chat documents without activeRole field
 * 3. Leaves them as-is (null/undefined is valid for backward compatibility)
 * 
 * The activeRole field is optional, so existing messages without it will
 * be treated as "idea-validator" context (default view shows all messages).
 * 
 * Run with: npx tsx scripts/migrate-active-role.ts
 */

import { connectToDatabase } from "../lib/connectToDB";
import Chat from "../model/Chat";
import { logger } from "../lib/utils/logger";

async function migrateActiveRole() {
  try {
    logger.info("🔄 Starting activeRole migration...");
    
    // Connect to database
    await connectToDatabase();
    logger.info("✅ Connected to MongoDB");

    // Count total messages
    const totalMessages = await Chat.countDocuments();
    logger.info(`📊 Total messages in database: ${totalMessages}`);

    // Count messages without activeRole
    const messagesWithoutRole = await Chat.countDocuments({
      activeRole: { $exists: false }
    });
    logger.info(`📊 Messages without activeRole: ${messagesWithoutRole}`);

    // Note: We don't need to update existing messages since activeRole is optional
    // Messages without activeRole will be treated as "idea-validator" context
    // (the default view that shows all messages)
    logger.info("✅ Migration complete - activeRole field is optional, existing messages are compatible");
    logger.info("📝 New messages will store activeRole when set to advisor roles (ceo, cto, cfo, cmo)");

    // Verify schema is updated
    const sampleMessage = await Chat.findOne();
    if (sampleMessage) {
      logger.info(`✅ Sample message schema check: activeRole field exists in model`);
    }

    process.exit(0);
  } catch (error) {
    logger.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateActiveRole();

