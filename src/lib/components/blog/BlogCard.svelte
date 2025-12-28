<script lang="ts">
	interface Tag {
		id: number;
		name: string;
		slug: string;
	}

	interface Post {
		id: number;
		slug: string;
		title: string;
		description: string;
		coverImage: string | null;
		publishedAt: Date | null;
		readingTime: number;
		tags: Tag[];
	}

	interface Props {
		post: Post;
	}

	let { post }: Props = $props();

	const formatDate = (date: Date | null) => {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<a
	href="/blog/{post.slug}"
	class="group block bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50"
>
	{#if post.coverImage}
		<div class="aspect-video overflow-hidden bg-slate-800">
			<img
				src={post.coverImage}
				alt={post.title}
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			/>
		</div>
	{/if}

	<div class="p-6">
		<div class="flex items-center gap-4 text-sm text-slate-400 mb-3">
			<time datetime={post.publishedAt?.toString()}>
				{formatDate(post.publishedAt)}
			</time>
			<span>•</span>
			<span>{post.readingTime} min read</span>
		</div>

		<h3 class="text-xl font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
			{post.title}
		</h3>

		<p class="text-slate-300 mb-4 line-clamp-2">
			{post.description}
		</p>

		{#if post.tags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each post.tags as tag}
					<span
						class="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700"
					>
						{tag.name}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</a>
