import { getPublishedPosts, getAllTags } from '$lib/server/services/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [posts, tags] = await Promise.all([getPublishedPosts(), getAllTags()]);

	return {
		posts,
		tags
	};
};
