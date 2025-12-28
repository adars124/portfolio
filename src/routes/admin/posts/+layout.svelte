<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="min-h-screen bg-slate-950">
	<!-- Admin Header -->
	<header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-6">
					<h1 class="text-xl font-bold text-slate-100">Blog Admin</h1>
					<nav class="flex gap-4">
						<a
							href="/admin/posts"
							class="text-slate-400 hover:text-slate-300 transition-colors text-sm"
						>
							All Posts
						</a>
						<a
							href="/admin/posts/new"
							class="text-slate-400 hover:text-slate-300 transition-colors text-sm"
						>
							New Post
						</a>
					</nav>
				</div>

				<div class="flex items-center gap-4">
					<span class="text-sm text-slate-400">
						Logged in as <span class="text-slate-300 font-medium">{data.user.username}</span>
					</span>
					<form method="POST" action="/admin/logout">
						<button
							type="submit"
							class="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
						>
							Logout
						</button>
					</form>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main>
		{@render children()}
	</main>
</div>
