<script lang="ts">
	import { onMount } from 'svelte';
	import type { CommandOutput, CommandMap } from '$lib/types/terminal';
	import { getGeminiService } from '$lib/services/gemini';
	import { marked } from 'marked';

	interface Props {
		commands: CommandMap;
		welcomeMessage: string;
		currentPath?: string;
		history?: CommandOutput[];
	}

	let {
		commands,
		welcomeMessage,
		currentPath = '~/portfolio',
		history = $bindable([])
	}: Props = $props();

	let input = $state('');
	let terminalInput: HTMLInputElement | undefined;
	let terminalOutput: HTMLElement | undefined;
	let isTyping = $state(false);
	let isAiProcessing = $state(false);
	let isAiThinking = $state(false);
	let streamingResponse = $state('');
	let isUserScrolling = $state(false);

	const gemini = getGeminiService();
	const TYPEWRITER_SPEED = 10; // milliseconds per character

	// Configure marked for terminal-friendly rendering
	marked.setOptions({
		breaks: true,
		gfm: true
	});

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

	const handleCommand = async () => {
		const cmd = input.trim().toLowerCase();
		const userInput = input.trim();

		if (!cmd) return;

		// Reset scroll flag on new command
		isUserScrolling = false;

		const command = commands[cmd];

		if (command) {
			// Execute built-in command
			const output = command.execute();
			history = [...history, { command: input, output }];
			input = '';
		} else {
			// Fallback to AI chat with streaming
			input = '';
			isAiProcessing = true;
			isAiThinking = true;
			streamingResponse = '';

			// Add user message to history with "Thinking..." placeholder
			const historyIndex = history.length;
			history = [...history, { command: userInput, output: ['__AI_THINKING__'] }];
			setTimeout(scrollToBottom, 0);

			try {
				// Stream the AI response with typewriter effect
				for await (const chunk of gemini.chatStream(userInput)) {
					// First chunk - switch from thinking to streaming
					if (isAiThinking) {
						isAiThinking = false;
						history = [
							...history.slice(0, historyIndex),
							{ command: userInput, output: ['__AI_STREAMING__'] },
							...history.slice(historyIndex + 1)
						];
					}

					// Typewriter effect: add each character one by one
					for (let i = 0; i < chunk.length; i++) {
						streamingResponse += chunk[i];

						// Update the history entry with streaming content
						history = [
							...history.slice(0, historyIndex),
							{ command: userInput, output: ['__AI_STREAMING__'] },
							...history.slice(historyIndex + 1)
						];

						setTimeout(scrollToBottom, 0);

						// Add delay between characters for typewriter effect
						await new Promise((resolve) => setTimeout(resolve, TYPEWRITER_SPEED));
					}
				}

				// Finalize the response (convert markdown to HTML)
				const htmlResponse = await marked(streamingResponse);
				history = [
					...history.slice(0, historyIndex),
					{ command: userInput, output: [htmlResponse] },
					...history.slice(historyIndex + 1)
				];

				streamingResponse = '';
			} catch (error) {
				history = [
					...history.slice(0, historyIndex),
					{
						command: userInput,
						output: [
							'⚠️  Error communicating with AI',
							'',
							'Try a valid command or type "help" for available commands.'
						]
					},
					...history.slice(historyIndex + 1)
				];
				streamingResponse = '';
			} finally {
				isAiProcessing = false;
				isAiThinking = false;
			}
		}

		setTimeout(scrollToBottom, 0);
	};

	const isScrolledToBottom = (): boolean => {
		if (!terminalOutput) return true;
		const threshold = 50; // pixels from bottom
		return (
			terminalOutput.scrollHeight - terminalOutput.scrollTop - terminalOutput.clientHeight <
			threshold
		);
	};

	const scrollToBottom = () => {
		// Only auto-scroll if user is already at the bottom
		if (terminalOutput && !isUserScrolling) {
			terminalOutput.scrollTop = terminalOutput.scrollHeight;
		}
	};

	const handleScroll = () => {
		// User manually scrolled up
		if (!isScrolledToBottom()) {
			isUserScrolling = true;
		} else {
			// User scrolled back to bottom
			isUserScrolling = false;
		}
	};

	const focusInput = () => {
		terminalInput?.focus();
	};

	const handleKeyPress = () => {
		// Auto-focus input on any keypress (except when already typing in input)
		if (document.activeElement !== terminalInput && !isTyping && !isAiProcessing) {
			terminalInput?.focus();
		}
	};

	onMount(() => {
		// Focus input programmatically instead of using autofocus attribute
		terminalInput?.focus();

		setTimeout(() => {
			typeText('help');
		}, 500);
	});
</script>

<svelte:window onclick={focusInput} onkeydown={handleKeyPress} />

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
				<div
					bind:this={terminalOutput}
					onscroll={handleScroll}
					class="terminal-output mb-4 max-h-96 overflow-y-auto"
				>
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
									{#if line === '__AI_THINKING__'}
										<!-- AI Thinking indicator -->
										<div class="ai-response">
											<div class="flex items-center gap-2">
												<span class="text-cyan-400">🤖 AI:</span>
												<span class="text-slate-400">Thinking</span>
												<span class="thinking-dots">
													<span class="dot">.</span>
													<span class="dot">.</span>
													<span class="dot">.</span>
												</span>
											</div>
										</div>
									{:else if line === '__AI_STREAMING__'}
										<!-- Streaming AI response -->
										<div class="ai-response">
											<div class="mb-2 flex items-center gap-2">
												<span class="text-cyan-400">🤖 AI:</span>
												<span class="animate-pulse text-cyan-400">●</span>
											</div>
											{#if streamingResponse}
												<div class="markdown-content">
													{@html marked(streamingResponse)}
												</div>
											{/if}
										</div>
									{:else if line.startsWith('<')}
										<!-- Rendered HTML/Markdown -->
										<div class="ai-response markdown-content">
											<div class="mb-2 text-cyan-400">🤖 AI:</div>
											{@html line}
										</div>
									{:else}
										<!-- Regular text output -->
										<div class="whitespace-pre-wrap">{line}</div>
									{/if}
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<!-- Input Line -->
				<div class="flex items-center gap-3">
					<span class="text-green-400">→</span>
					<input
						bind:this={terminalInput}
						bind:value={input}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !isTyping && !isAiProcessing) {
								handleCommand();
							}
						}}
						class="flex-1 bg-transparent text-blue-400 caret-blue-400 outline-none"
						placeholder={isAiThinking
							? 'AI is thinking...'
							: isAiProcessing
								? 'AI is responding...'
								: 'Type a command...'}
						disabled={isTyping || isAiProcessing}
					/>
					<button
						onclick={handleCommand}
						disabled={isTyping || isAiProcessing || !input.trim()}
						class="send-button group relative flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 transition-all duration-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cyan-500/30 disabled:hover:shadow-none"
						aria-label="Send command"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5 text-cyan-400 transition-all group-hover:translate-x-0.5 group-hover:text-cyan-300 group-active:text-cyan-500"
						>
							<path d="M5 12h14" />
							<path d="m12 5 7 7-7 7" />
						</svg>
						<div
							class="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100"
						></div>
					</button>
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

	/* Thinking dots animation */
	.thinking-dots {
		display: inline-flex;
		gap: 2px;
	}

	.thinking-dots .dot {
		color: rgb(148 163 184);
		animation: thinking 1.4s infinite;
	}

	.thinking-dots .dot:nth-child(1) {
		animation-delay: 0s;
	}

	.thinking-dots .dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.thinking-dots .dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes thinking {
		0%,
		60%,
		100% {
			opacity: 0.3;
		}
		30% {
			opacity: 1;
		}
	}

	/* Markdown content styling */
	:global(.markdown-content) {
		line-height: 1.6;
		color: rgb(203 213 225);
	}

	:global(.markdown-content h1),
	:global(.markdown-content h2),
	:global(.markdown-content h3) {
		color: rgb(148 163 184);
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	:global(.markdown-content h1) {
		font-size: 1.25rem;
	}

	:global(.markdown-content h2) {
		font-size: 1.125rem;
	}

	:global(.markdown-content h3) {
		font-size: 1rem;
	}

	:global(.markdown-content p) {
		margin-bottom: 0.75rem;
	}

	:global(.markdown-content ul),
	:global(.markdown-content ol) {
		margin-left: 1.5rem;
		margin-bottom: 0.75rem;
		padding-left: 0.5rem;
	}

	:global(.markdown-content ul) {
		list-style-type: disc;
	}

	:global(.markdown-content ol) {
		list-style-type: decimal;
	}

	:global(.markdown-content li) {
		margin-bottom: 0.25rem;
		display: list-item;
		margin-left: 0.5rem;
	}

	:global(.markdown-content ul ul),
	:global(.markdown-content ol ul) {
		list-style-type: circle;
		margin-top: 0.25rem;
	}

	:global(.markdown-content ul ol),
	:global(.markdown-content ol ol) {
		list-style-type: lower-alpha;
		margin-top: 0.25rem;
	}

	:global(.markdown-content code) {
		background: rgb(30 41 59);
		color: rgb(251 191 36);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
	}

	:global(.markdown-content pre) {
		background: rgb(30 41 59);
		color: rgb(226 232 240);
		padding: 1rem;
		border-radius: 0.375rem;
		overflow-x: auto;
		margin-bottom: 0.75rem;
	}

	:global(.markdown-content pre code) {
		background: transparent;
		padding: 0;
		color: inherit;
	}

	:global(.markdown-content a) {
		color: rgb(56 189 248);
		text-decoration: underline;
	}

	:global(.markdown-content a:hover) {
		color: rgb(125 211 252);
	}

	:global(.markdown-content strong) {
		color: rgb(226 232 240);
		font-weight: 600;
	}

	:global(.markdown-content em) {
		font-style: italic;
		color: rgb(203 213 225);
	}

	:global(.markdown-content blockquote) {
		border-left: 3px solid rgb(71 85 105);
		padding-left: 1rem;
		color: rgb(148 163 184);
		margin-bottom: 0.75rem;
	}

	:global(.markdown-content hr) {
		border: none;
		border-top: 1px solid rgb(51 65 85);
		margin: 1rem 0;
	}

	:global(.markdown-content table) {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 0.75rem;
	}

	:global(.markdown-content th),
	:global(.markdown-content td) {
		border: 1px solid rgb(51 65 85);
		padding: 0.5rem;
		text-align: left;
	}

	:global(.markdown-content th) {
		background: rgb(30 41 59);
		font-weight: 600;
	}
</style>
