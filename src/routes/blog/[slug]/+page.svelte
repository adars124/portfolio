<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const formatDate = (date: Date | null) => {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	// Process markdown content for display
	const processedContent = $derived(data.post.content);
</script>

<svelte:head>
	<title>{data.post.title} - Aadarsha Upadhyaya</title>
	<meta name="description" content={data.post.description} />
</svelte:head>

<div class="min-h-screen bg-slate-950">
	<!-- Header -->
	<div class="border-b border-slate-800">
		<div class="max-w-4xl mx-auto px-4 py-8">
			<a
				href="/blog"
				class="text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-2 mb-8"
			>
				<span>←</span>
				<span>Back to Blog</span>
			</a>

			<h1 class="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
				{data.post.title}
			</h1>

			<p class="text-xl text-slate-300 mb-6">
				{data.post.description}
			</p>

			<div class="flex items-center gap-6 text-sm text-slate-400">
				<time datetime={data.post.publishedAt?.toString()}>
					{formatDate(data.post.publishedAt)}
				</time>
				<span>•</span>
				<span>{data.post.readingTime} min read</span>
				<span>•</span>
				<span>{data.post.views} views</span>
			</div>

			{#if data.post.tags.length > 0}
				<div class="flex flex-wrap gap-2 mt-6">
					{#each data.post.tags as tag}
						<a
							href="/blog/tag/{tag.slug}"
							class="px-3 py-1 text-sm rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors"
						>
							{tag.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Cover Image -->
	{#if data.post.coverImage}
		<div class="max-w-4xl mx-auto px-4 py-8">
			<div class="aspect-video overflow-hidden rounded-lg bg-slate-800">
				<img
					src={data.post.coverImage}
					alt={data.post.title}
					class="w-full h-full object-cover"
				/>
			</div>
		</div>
	{/if}

	<!-- Blog Content -->
	<article class="max-w-4xl mx-auto px-4 py-8">
		<div class="prose prose-invert prose-slate max-w-none">
			{@html processedContent}
		</div>
	</article>

	<!-- Footer -->
	<div class="max-w-4xl mx-auto px-4 py-12 border-t border-slate-800">
		<div class="flex justify-center">
			<a
				href="/blog"
				class="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors"
			>
				← Back to all posts
			</a>
		</div>
	</div>
</div>

<style>
	:global(.prose) {
		color: rgb(203 213 225);
	}

	:global(.prose h1) {
		color: rgb(241 245 249);
		font-weight: 700;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	:global(.prose h2) {
		color: rgb(241 245 249);
		font-weight: 600;
		margin-top: 1.75rem;
		margin-bottom: 0.75rem;
	}

	:global(.prose h3) {
		color: rgb(226 232 240);
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	:global(.prose a) {
		color: rgb(96 165 250);
		text-decoration: none;
	}

	:global(.prose a:hover) {
		color: rgb(147 197 253);
		text-decoration: underline;
	}

	:global(.prose code) {
		background-color: rgb(30 41 59);
		color: rgb(226 232 240);
		padding: 0.2em 0.4em;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	:global(.prose pre) {
		background-color: rgb(15 23 42);
		border: 1px solid rgb(51 65 85);
		border-radius: 0.5rem;
		padding: 1rem;
		overflow-x: auto;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
	}

	:global(.prose blockquote) {
		border-left: 4px solid rgb(51 65 85);
		padding-left: 1rem;
		font-style: italic;
		color: rgb(148 163 184);
	}

	:global(.prose ul),
	:global(.prose ol) {
		margin-left: 1.5rem;
	}

	:global(.prose li) {
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	:global(.prose img) {
		border-radius: 0.5rem;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}

	:global(.prose hr) {
		border-color: rgb(51 65 85);
		margin-top: 2rem;
		margin-bottom: 2rem;
	}

	:global(.prose table) {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}

	:global(.prose th) {
		background-color: rgb(30 41 59);
		color: rgb(241 245 249);
		font-weight: 600;
		padding: 0.75rem;
		border: 1px solid rgb(51 65 85);
	}

	:global(.prose td) {
		padding: 0.75rem;
		border: 1px solid rgb(51 65 85);
	}
</style>
