import { getPostBySlug, incrementViews } from '$lib/server/services/blog';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPostBySlug(params.slug);

	if (!post || !post.published) {
		throw error(404, 'Post not found');
	}

	// Increment view count (non-blocking)
	incrementViews(post.id).catch(console.error);

	return {
		post
	};
};
