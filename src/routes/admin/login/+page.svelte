<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Admin Login</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="bg-slate-900 border border-slate-700 rounded-lg p-8">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-slate-100 mb-2">Admin Login</h1>
				<p class="text-slate-400">Access the blog management panel</p>
			</div>

			<!-- Error Message -->
			{#if form?.error}
				<div class="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
					<p class="text-red-400 text-sm">{form.error}</p>
				</div>
			{/if}

			<!-- Login Form -->
			<form method="POST" action="?/login">
				<div class="mb-4">
					<label for="username" class="block text-sm font-medium text-slate-300 mb-2">
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						autocomplete="username"
						class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Enter your username"
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="block text-sm font-medium text-slate-300 mb-2">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						autocomplete="current-password"
						class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Enter your password"
					/>
				</div>

				<button
					type="submit"
					class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
				>
					Login
				</button>
			</form>

			<!-- Back to site -->
			<div class="mt-6 text-center">
				<a href="/" class="text-sm text-slate-400 hover:text-slate-300 transition-colors">
					← Back to site
				</a>
			</div>
		</div>
	</div>
</div>
