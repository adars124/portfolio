<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const formatDate = (date: Date | null) => {
		if (!date) return 'Not published';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};
</script>

<svelte:head>
	<title>Manage Posts - Admin</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h2 class="mb-2 text-3xl font-bold text-slate-100">Blog Posts</h2>
			<p class="text-slate-400">{data.posts.length} total posts</p>
		</div>
		<a
			href="/admin/posts/new"
			class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
		>
			+ New Post
		</a>
	</div>

	<!-- Posts List -->
	{#if data.posts.length === 0}
		<div class="rounded-lg border border-slate-800 bg-slate-900 py-20 text-center">
			<div class="mb-4 text-6xl">📝</div>
			<h3 class="mb-2 text-2xl font-semibold text-slate-300">No posts yet</h3>
			<p class="mb-6 text-slate-400">Create your first blog post to get started</p>
			<a
				href="/admin/posts/new"
				class="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
			>
				Create First Post
			</a>
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b border-slate-700 bg-slate-800">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Published</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Views</th>
							<th class="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800">
						{#each data.posts as post}
							<tr class="transition-colors hover:bg-slate-800/50">
								<td class="px-6 py-4">
									<div>
										<div class="font-medium text-slate-200">{post.title}</div>
										<div class="mt-1 text-sm text-slate-400">{post.slug}</div>
									</div>
								</td>
								<td class="px-6 py-4">
									{#if post.published}
										<span
											class="rounded-full border border-green-700 bg-green-900/30 px-2 py-1 text-xs text-green-400"
										>
											Published
										</span>
									{:else}
										<span
											class="rounded-full border border-yellow-700 bg-yellow-900/30 px-2 py-1 text-xs text-yellow-400"
										>
											Draft
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-sm text-slate-400">
									{formatDate(post.publishedAt)}
								</td>
								<td class="px-6 py-4 text-sm text-slate-400">{post.views}</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-end gap-2">
										<a
											href="/blog/{post.slug}"
											target="_blank"
											class="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700"
										>
											View
										</a>
										<a
											href="/admin/posts/{post.id}/edit"
											class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
										>
											Edit
										</a>
										<form method="POST" action="?/delete" class="inline">
											<input type="hidden" name="id" value={post.id} />
											<button
												type="submit"
												onclick={(e) => {
													if (!confirm('Are you sure you want to delete this post?')) {
														e.preventDefault();
													}
												}}
												class="rounded bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
											>
												Delete
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
