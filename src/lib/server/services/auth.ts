import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash a password using SHA-256
 */
function hashPassword(password: string): string {
	return createHash('sha256').update(password).digest('hex');
}

/**
 * Generate a secure session ID
 */
function generateSessionId(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(username: string, password: string) {
	const users = await db
		.select()
		.from(schema.adminUsers)
		.where(eq(schema.adminUsers.username, username))
		.limit(1);

	if (users.length === 0) return null;

	const user = users[0];
	const passwordHash = hashPassword(password);

	if (passwordHash !== user.passwordHash) return null;

	return user;
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: number) {
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);

	await db.insert(schema.adminSessions).values({
		id: sessionId,
		userId,
		expiresAt
	});

	return { sessionId, expiresAt };
}

/**
 * Validate a session and return the user
 */
export async function validateSession(sessionId: string | null) {
	if (!sessionId) return null;

	const sessions = await db
		.select({
			id: schema.adminSessions.id,
			userId: schema.adminSessions.userId,
			expiresAt: schema.adminSessions.expiresAt,
			username: schema.adminUsers.username
		})
		.from(schema.adminSessions)
		.innerJoin(schema.adminUsers, eq(schema.adminSessions.userId, schema.adminUsers.id))
		.where(eq(schema.adminSessions.id, sessionId))
		.limit(1);

	if (sessions.length === 0) return null;

	const session = sessions[0];

	// Check if session is expired
	if (session.expiresAt < new Date()) {
		await deleteSession(sessionId);
		return null;
	}

	return {
		sessionId: session.id,
		userId: session.userId,
		username: session.username
	};
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string) {
	await db.delete(schema.adminSessions).where(eq(schema.adminSessions.id, sessionId));
}

/**
 * Delete all expired sessions
 */
export async function cleanupExpiredSessions() {
	await db
		.delete(schema.adminSessions)
		.where(eq(schema.adminSessions.expiresAt, new Date()));
}

/**
 * Create an admin user (use this once to create your account)
 */
export async function createAdminUser(username: string, password: string) {
	const passwordHash = hashPassword(password);

	const [user] = await db
		.insert(schema.adminUsers)
		.values({
			username,
			passwordHash
		})
		.returning();

	return user;
}
