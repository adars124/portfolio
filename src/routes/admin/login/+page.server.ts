import { verifyCredentials, createSession } from '$lib/server/services/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionId = cookies.get('session_id');

	// If already logged in, redirect to admin dashboard
	if (sessionId) {
		throw redirect(303, '/admin/posts');
	}

	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const password = data.get('password')?.toString();

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required' });
		}

		const user = await verifyCredentials(username, password);

		if (!user) {
			return fail(401, { error: 'Invalid username or password' });
		}

		const { sessionId, expiresAt } = await createSession(user.id);

		cookies.set('session_id', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			expires: expiresAt
		});

		throw redirect(303, '/admin/posts');
	}
};
