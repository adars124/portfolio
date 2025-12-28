<script lang="ts">
	import type { ActionData } from './$types';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	let { form }: { form: ActionData } = $props();

	// Auto-generate slug from title
	function generateSlug(title: string) {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	let title = $state('');
	let slug = $state('');
	let autoSlug = $state(true);
	let content = $state('');
	let editorRef: RichTextEditor;

	$effect(() => {
		if (autoSlug && title) {
			slug = generateSlug(title);
		}
	});

	function handleEditorUpdate(html: string) {
		content = html;
	}
</script>

<svelte:head>
	<title>New Post - Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<a
			href="/admin/posts"
			class="text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-2 mb-4"
		>
			<span>←</span>
			<span>Back to all posts</span>
		</a>
		<h2 class="text-3xl font-bold text-slate-100">Create New Post</h2>
	</div>

	<!-- Error Message -->
	{#if form?.error}
		<div class="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
			<p class="text-red-400 text-sm">{form.error}</p>
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" action="?/create" class="space-y-6">
		<!-- Title -->
		<div>
			<label for="title" class="block text-sm font-medium text-slate-300 mb-2">
				Title *
			</label>
			<input
				type="text"
				id="title"
				name="title"
				bind:value={title}
				required
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="Enter post title"
			/>
		</div>

		<!-- Slug -->
		<div>
			<label for="slug" class="block text-sm font-medium text-slate-300 mb-2"> Slug * </label>
			<div class="flex gap-2">
				<input
					type="text"
					id="slug"
					name="slug"
					bind:value={slug}
					oninput={() => (autoSlug = false)}
					required
					pattern="[a-z0-9-]+"
					class="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="post-url-slug"
				/>
				<button
					type="button"
					onclick={() => {
						autoSlug = true;
						slug = generateSlug(title);
					}}
					class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
				>
					Auto-generate
				</button>
			</div>
			<p class="text-xs text-slate-400 mt-1">Only lowercase letters, numbers, and hyphens</p>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="block text-sm font-medium text-slate-300 mb-2">
				Description *
			</label>
			<textarea
				id="description"
				name="description"
				required
				rows="3"
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
				placeholder="Short description for SEO and post preview"
			></textarea>
		</div>

		<!-- Content -->
		<div>
			<label for="content-editor" class="block text-sm font-medium text-slate-300 mb-2">
				Content *
			</label>
			<RichTextEditor bind:this={editorRef} onUpdate={handleEditorUpdate} editorId="content-editor" />
			<input type="hidden" name="content" value={content} required />
			<p class="text-xs text-slate-400 mt-2">
				Use the toolbar to format your content. The editor will generate clean HTML automatically.
			</p>
		</div>

		<!-- Cover Image -->
		<div>
			<label for="coverImage" class="block text-sm font-medium text-slate-300 mb-2">
				Cover Image URL
			</label>
			<input
				type="url"
				id="coverImage"
				name="coverImage"
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="https://example.com/image.jpg"
			/>
		</div>

		<!-- Tags -->
		<div>
			<label for="tags" class="block text-sm font-medium text-slate-300 mb-2"> Tags </label>
			<input
				type="text"
				id="tags"
				name="tags"
				class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="AI, Web Development, Tutorial"
			/>
			<p class="text-xs text-slate-400 mt-1">Comma-separated tags</p>
		</div>

		<!-- Published -->
		<div class="flex items-center gap-3">
			<input
				type="checkbox"
				id="published"
				name="published"
				class="w-4 h-4 bg-slate-800 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500"
			/>
			<label for="published" class="text-sm text-slate-300">
				Publish immediately (uncheck to save as draft)
			</label>
		</div>

		<!-- Actions -->
		<div class="flex gap-4 pt-4">
			<button
				type="submit"
				class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
			>
				Create Post
			</button>
			<a
				href="/admin/posts"
				class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
