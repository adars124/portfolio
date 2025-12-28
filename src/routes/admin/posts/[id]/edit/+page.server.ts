import { getPostById, updatePost } from '$lib/server/services/blog';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const post = await getPostById(id);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const id = Number(params.id);
		const data = await request.formData();

		const slug = data.get('slug')?.toString();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString();
		const content = data.get('content')?.toString();
		const coverImage = data.get('coverImage')?.toString() || undefined;
		const published = data.get('published') === 'on';
		const tagsString = data.get('tags')?.toString() || '';

		if (!slug || !title || !description || !content) {
			return fail(400, { error: 'All required fields must be filled' });
		}

		// Validate slug format
		if (!/^[a-z0-9-]+$/.test(slug)) {
			return fail(400, {
				error: 'Slug must contain only lowercase letters, numbers, and hyphens'
			});
		}

		const tags = tagsString
			.split(',')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		try {
			await updatePost({
				id,
				slug,
				title,
				description,
				content,
				coverImage,
				published,
				publishedAt: published ? new Date() : undefined,
				tags
			});
		} catch (error) {
			console.error('Error updating post:', error);
			return fail(500, { error: 'Failed to update post. Slug might already be in use.' });
		}

		throw redirect(303, '/admin/posts');
	}
};
