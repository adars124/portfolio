<script lang="ts">
	import { onMount } from 'svelte';
	import type { CommandOutput, CommandMap } from '$lib/types/terminal';

	interface Props {
		commands: CommandMap;
		welcomeMessage: string;
		currentPath?: string;
	}

	let { commands, welcomeMessage, currentPath = '~/portfolio' }: Props = $props();

	let input = $state('');
	let history = $state<CommandOutput[]>([]);
	let terminalInput: HTMLInputElement;
	let isTyping = $state(false);

	const typeText = async (text: string, delay = 30) => {
		isTyping = true;
		for (let i = 0; i < text.length; i++) {
			input = text.substring(0, i + 1);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
		isTyping = false;
		await new Promise((resolve) => setTimeout(resolve, 300));
		handleCommand();
		input = '';
	};

	const handleCommand = () => {
		const cmd = input.trim().toLowerCase();

		if (!cmd) return;

		const command = commands[cmd];

		if (command) {
			const output = command.execute();
			history = [...history, { command: input, output }];
		} else {
			history = [
				...history,
				{
					command: input,
					output: [`Command not found: ${cmd}`, 'Type "help" for available commands.']
				}
			];
		}

		input = '';
		setTimeout(scrollToBottom, 0);
	};

	const scrollToBottom = () => {
		const terminal = document.querySelector('.terminal-output');
		if (terminal) {
			terminal.scrollTop = terminal.scrollHeight;
		}
	};

	const focusInput = () => {
		terminalInput?.focus();
	};

	onMount(() => {
		// Focus input programmatically instead of using autofocus attribute
		terminalInput?.focus();

		setTimeout(() => {
			typeText('help');
		}, 500);
	});
</script>

<svelte:window onclick={focusInput} />

<div class="flex min-h-screen items-center justify-center bg-slate-950 p-4">
	<div class="w-full max-w-4xl">
		<!-- Terminal Window -->
		<div class="overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
			<!-- Terminal Header -->
			<div class="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3">
				<div class="flex gap-2">
					<div class="h-3 w-3 rounded-full bg-red-500"></div>
					<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
					<div class="h-3 w-3 rounded-full bg-green-500"></div>
				</div>
				<div class="flex-1 text-center font-mono text-sm text-slate-400">
					adars@terminal: {currentPath}
				</div>
			</div>

			<!-- Terminal Body -->
			<div class="p-6 font-mono text-sm">
				<!-- Welcome Message -->
				<div class="mb-6 text-green-400">
					{@html welcomeMessage}
				</div>

				<!-- Terminal Output -->
				<div class="terminal-output mb-4 max-h-96 overflow-y-auto">
					{#each history as entry}
						<div class="mb-4">
							<!-- Command -->
							<div class="flex gap-2 text-blue-400">
								<span class="text-green-400">→</span>
								<span>{entry.command}</span>
							</div>
							<!-- Output -->
							<div class="mt-2 pl-4 text-slate-300">
								{#each entry.output as line}
									<div class="whitespace-pre-wrap">{line}</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<!-- Input Line -->
				<div class="flex items-center gap-2">
					<span class="text-green-400">→</span>
					<input
						bind:this={terminalInput}
						bind:value={input}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !isTyping) {
								handleCommand();
							}
						}}
						class="flex-1 bg-transparent text-blue-400 caret-blue-400 outline-none"
						placeholder="Type a command..."
						disabled={isTyping}
					/>
					<span class="animate-pulse text-blue-400">▊</span>
				</div>
			</div>
		</div>

		<!-- Hint Text -->
		<div class="mt-4 text-center font-mono text-sm text-slate-500">
			Click anywhere to focus • Press Enter to execute commands
		</div>
	</div>
</div>

<style>
	.terminal-output::-webkit-scrollbar {
		width: 8px;
	}

	.terminal-output::-webkit-scrollbar-track {
		background: rgb(15 23 42);
	}

	.terminal-output::-webkit-scrollbar-thumb {
		background: rgb(51 65 85);
		border-radius: 4px;
	}

	.terminal-output::-webkit-scrollbar-thumb:hover {
		background: rgb(71 85 105);
	}
</style>
