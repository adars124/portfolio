import { getAllPosts, deletePost } from '$lib/server/services/blog';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts = await getAllPosts();

	return {
		posts
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) {
			return fail(400, { error: 'Post ID is required' });
		}

		try {
			await deletePost(id);
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete post' });
		}
	}
};
