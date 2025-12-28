import { getPostsByTag, getAllTags } from '$lib/server/services/blog';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [posts, tags] = await Promise.all([getPostsByTag(params.tag), getAllTags()]);

	if (posts.length === 0) {
		// Check if tag exists
		const tagExists = tags.some((t) => t.slug === params.tag);
		if (!tagExists) {
			throw error(404, 'Tag not found');
		}
	}

	const currentTag = tags.find((t) => t.slug === params.tag);

	return {
		posts,
		tags,
		currentTag
	};
};
