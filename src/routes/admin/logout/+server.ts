import { deleteSession } from '$lib/server/services/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session_id');

	if (sessionId) {
		await deleteSession(sessionId);
		cookies.delete('session_id', { path: '/' });
	}

	throw redirect(303, '/admin/login');
};
