import { validateSession, deleteSession } from '$lib/server/services/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const sessionId = cookies.get('session_id');
	const session = await validateSession(sessionId || null);

	if (!session) {
		// Not authenticated, redirect to login
		throw redirect(303, '/admin/login');
	}

	return {
		user: {
			username: session.username
		}
	};
};
