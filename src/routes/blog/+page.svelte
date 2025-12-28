<script lang="ts">
	import BlogCard from '$lib/components/blog/BlogCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog - Aadarsha Upadhyaya</title>
	<meta name="description" content="Thoughts on AI, software engineering, and technology" />
</svelte:head>

<div class="min-h-screen bg-slate-950">
	<!-- Header -->
	<div class="border-b border-slate-800">
		<div class="max-w-6xl mx-auto px-4 py-8">
			<div class="flex items-center justify-between mb-8">
				<a
					href="/"
					class="text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-2"
				>
					<span>←</span>
					<span>Back to Terminal</span>
				</a>
			</div>

			<h1 class="text-4xl font-bold text-slate-100 mb-4">Blog</h1>
			<p class="text-slate-400 text-lg">
				Thoughts on AI, software engineering, and technology
			</p>
		</div>
	</div>

	<!-- Tags Filter -->
	{#if data.tags.length > 0}
		<div class="border-b border-slate-800">
			<div class="max-w-6xl mx-auto px-4 py-4">
				<div class="flex flex-wrap gap-2">
					<a
						href="/blog"
						class="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
					>
						All Posts
					</a>
					{#each data.tags as tag}
						<a
							href="/blog/tag/{tag.slug}"
							class="px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors"
						>
							{tag.name}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Blog Posts Grid -->
	<div class="max-w-6xl mx-auto px-4 py-12">
		{#if data.posts.length === 0}
			<div class="text-center py-20">
				<div class="text-6xl mb-4">📝</div>
				<h2 class="text-2xl font-semibold text-slate-300 mb-2">No posts yet</h2>
				<p class="text-slate-400">Check back soon for new content!</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.posts as post}
					<BlogCard {post} />
				{/each}
			</div>
		{/if}
	</div>
</div>
