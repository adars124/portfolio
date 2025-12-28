<script lang="ts">
	import Terminal from '$lib/components/Terminal.svelte';
	import { createCommands } from '$lib/data/portfolio';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let history: Array<{ command: string; output: string[] }> = $state([]);

	const clearHistory = () => {
		history = [];
	};

	// Use $derived to properly track data changes
	const commands = $derived(createCommands(data, clearHistory));

	const welcomeMessage = $derived(`<pre class="text-xs leading-relaxed">
   ___            __               __
  / _ |___ ___ _ / /__ _______  / /  ___
 / __ / _ \`/ _ \`/ / _ \`/ __(_-< / _ \\/ _ \\
/_/ |_\\_,_/\\_,_/_/\\_,_/_/ /___//_//_/\_,_/

</pre>
<p class="text-slate-300 mt-4">Seeking clarity within and across the cosmos!</p>
<p class="text-slate-400 text-xs mt-2">${data.personalInfo?.title || ''}</p>
<p class="text-slate-400 text-xs mt-1">Type 'help' to see available commands.</p>`);
</script>

<Terminal {commands} {welcomeMessage} bind:history />
