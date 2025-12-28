<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const tagNames = $derived(data.post.tags.map((t: { name: string }) => t.name).join(', '));
	let content = $state('');
	let editorRef: RichTextEditor;

	// Initialize content when component mounts
	$effect(() => {
		content = data.post.content;
	});

	function handleEditorUpdate(html: string) {
		content = html;
	}
</script>

<svelte:head>
	<title>Edit Post - Admin</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<a
			href="/admin/posts"
			class="mb-4 flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-300"
		>
			<span>←</span>
			<span>Back to all posts</span>
		</a>
		<h2 class="text-3xl font-bold text-slate-100">Edit Post</h2>
	</div>

	<!-- Error Message -->
	{#if form?.error}
		<div class="mb-6 rounded-lg border border-red-700 bg-red-900/20 p-4">
			<p class="text-sm text-red-400">{form.error}</p>
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" action="?/update" class="space-y-6">
		<!-- Title -->
		<div>
			<label for="title" class="mb-2 block text-sm font-medium text-slate-300"> Title * </label>
			<input
				type="text"
				id="title"
				name="title"
				value={data.post.title}
				required
				class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<!-- Slug -->
		<div>
			<label for="slug" class="mb-2 block text-sm font-medium text-slate-300"> Slug * </label>
			<input
				type="text"
				id="slug"
				name="slug"
				value={data.post.slug}
				required
				pattern="[a-z0-9-]+"
				class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			<p class="mt-1 text-xs text-slate-400">Only lowercase letters, numbers, and hyphens</p>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="mb-2 block text-sm font-medium text-slate-300">
				Description *
			</label>
			<textarea
				id="description"
				name="description"
				required
				rows="3"
				class="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>{data.post.description}</textarea
			>
		</div>

		<!-- Content -->
		<div>
			<label for="content-editor" class="mb-2 block text-sm font-medium text-slate-300">
				Content *
			</label>
			<RichTextEditor
				bind:this={editorRef}
				content={data.post.content}
				onUpdate={handleEditorUpdate}
				editorId="content-editor"
			/>
			<input type="hidden" name="content" value={content} required />
			<p class="mt-2 text-xs text-slate-400">
				Use the toolbar to format your content. The editor will generate clean HTML automatically.
			</p>
		</div>

		<!-- Cover Image -->
		<div>
			<label for="coverImage" class="mb-2 block text-sm font-medium text-slate-300">
				Cover Image URL
			</label>
			<input
				type="url"
				id="coverImage"
				name="coverImage"
				value={data.post.coverImage || ''}
				class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<!-- Tags -->
		<div>
			<label for="tags" class="mb-2 block text-sm font-medium text-slate-300"> Tags </label>
			<input
				type="text"
				id="tags"
				name="tags"
				value={tagNames}
				class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			<p class="mt-1 text-xs text-slate-400">Comma-separated tags</p>
		</div>

		<!-- Published -->
		<div class="flex items-center gap-3">
			<input
				type="checkbox"
				id="published"
				name="published"
				checked={data.post.published}
				class="h-4 w-4 rounded border border-slate-700 bg-slate-800 focus:ring-2 focus:ring-blue-500"
			/>
			<label for="published" class="text-sm text-slate-300"> Published </label>
		</div>

		<!-- Meta Info -->
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-slate-400">Views:</span>
					<span class="ml-2 text-slate-200">{data.post.views}</span>
				</div>
				<div>
					<span class="text-slate-400">Reading Time:</span>
					<span class="ml-2 text-slate-200">{data.post.readingTime} min</span>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-4 pt-4">
			<button
				type="submit"
				class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
			>
				Update Post
			</button>
			<a
				href="/admin/posts"
				class="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700"
			>
				Cancel
			</a>
			<a
				href="/blog/{data.post.slug}"
				target="_blank"
				class="ml-auto rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700"
			>
				Preview
			</a>
		</div>
	</form>
</div>
