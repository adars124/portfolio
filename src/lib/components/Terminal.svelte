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
	let isGeneratingImage = $state(false);

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

					// Check for image generation markers
					if (chunk.includes('__IMAGE_READY__')) {
						// Image is ready - display immediately without typewriter effect
						isGeneratingImage = false;
						const imageUrl = chunk.replace('__IMAGE_READY__', '');
						streamingResponse += `\n\n__IMAGE__${imageUrl}`;

						// Update immediately
						history = [
							...history.slice(0, historyIndex),
							{ command: userInput, output: ['__AI_STREAMING__'] },
							...history.slice(historyIndex + 1)
						];
						setTimeout(scrollToBottom, 0);
						continue;
					} else if (chunk.includes('__IMAGE_ERROR__')) {
						// Image generation error
						isGeneratingImage = false;
						const errorMsg = chunk.replace('__IMAGE_ERROR__', '');
						streamingResponse += `\n\n⚠️  ${errorMsg}`;

						history = [
							...history.slice(0, historyIndex),
							{ command: userInput, output: ['__AI_STREAMING__'] },
							...history.slice(historyIndex + 1)
						];
						setTimeout(scrollToBottom, 0);
						continue;
					} else if (chunk.includes('__IMAGE_GENERATION__')) {
						// Show loading skeleton
						isGeneratingImage = true;
						const textBeforeMarker = chunk.replace('__IMAGE_GENERATION__', '');
						streamingResponse += textBeforeMarker;

						history = [
							...history.slice(0, historyIndex),
							{ command: userInput, output: ['__AI_STREAMING__'] },
							...history.slice(historyIndex + 1)
						];
						setTimeout(scrollToBottom, 0);
						continue;
					}

					// Normal typewriter effect for text
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

	// Image action handlers
	const copyImage = async (imageUrl: string) => {
		try {
			const response = await fetch(imageUrl);
			const blob = await response.blob();
			await navigator.clipboard.write([
				new ClipboardItem({
					[blob.type]: blob
				})
			]);
			// Could add a toast notification here
		} catch (error) {
			console.error('Failed to copy image:', error);
		}
	};

	const downloadImage = (imageUrl: string) => {
		const link = document.createElement('a');
		link.href = imageUrl;
		link.download = `generated-image-${Date.now()}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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
				<div class="flex items-center gap-3">
					<!-- GitHub Icon -->
					<a
						href="https://github.com/adars124"
						target="_blank"
						rel="noopener noreferrer"
						class="group relative"
						aria-label="GitHub"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="h-5 w-5 text-slate-400 transition-all duration-200 group-hover:scale-110 group-hover:text-white"
						>
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						<div
							class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-slate-700 px-2 py-1 text-xs whitespace-nowrap text-slate-200 opacity-0 transition-opacity group-hover:opacity-100"
						>
							GitHub
						</div>
					</a>

					<!-- LinkedIn Icon -->
					<a
						href="https://www.linkedin.com/in/adars124/"
						target="_blank"
						rel="noopener noreferrer"
						class="group relative"
						aria-label="LinkedIn"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="h-5 w-5 text-slate-400 transition-all duration-200 group-hover:scale-110 group-hover:text-[#0A66C2]"
						>
							<path
								d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
							/>
						</svg>
						<div
							class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-slate-700 px-2 py-1 text-xs whitespace-nowrap text-slate-200 opacity-0 transition-opacity group-hover:opacity-100"
						>
							LinkedIn
						</div>
					</a>
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
										{#if streamingResponse}
											{@const parts = streamingResponse.split('__IMAGE__')}
											<div class="ai-response">
												<div class="mb-2 flex items-center gap-2">
													<span class="text-cyan-400">🤖 AI:</span>
													<span class="animate-pulse text-cyan-400">●</span>
												</div>
												{#if parts.length > 1}
													<!-- Has image -->
													<div class="markdown-content">
														{@html marked(parts[0])}
													</div>
													<div class="image-container group">
														<img src={parts[1]} alt="AI generated artwork" class="generated-image" />
														<!-- Action buttons -->
														<div class="image-actions">
															<button
																onclick={() => copyImage(parts[1])}
																class="image-action-btn"
																aria-label="Copy image"
																title="Copy image"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="16"
																	height="16"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																>
																	<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
																	<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
																</svg>
															</button>
															<button
																onclick={() => downloadImage(parts[1])}
																class="image-action-btn"
																aria-label="Download image"
																title="Download image"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="16"
																	height="16"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																>
																	<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
																	<polyline points="7 10 12 15 17 10"></polyline>
																	<line x1="12" y1="15" x2="12" y2="3"></line>
																</svg>
															</button>
														</div>
													</div>
												{:else}
													<div class="markdown-content">
														{@html marked(streamingResponse)}
													</div>
													{#if isGeneratingImage}
														<!-- Image loading skeleton -->
														<div class="image-skeleton">
															<div class="skeleton-shimmer"></div>
															<div class="skeleton-text">Generating image...</div>
														</div>
													{/if}
												{/if}
											</div>
										{:else}
											<div class="ai-response">
												<div class="mb-2 flex items-center gap-2">
													<span class="text-cyan-400">🤖 AI:</span>
													<span class="animate-pulse text-cyan-400">●</span>
												</div>
											</div>
										{/if}
									{:else if line.startsWith('<')}
										<!-- Rendered HTML/Markdown -->
										{@const imageParts = line.split('__IMAGE__')}
										<div class="ai-response markdown-content">
											<div class="mb-2 text-cyan-400">🤖 AI:</div>
											{#if imageParts.length > 1}
												<!-- Has finalized image -->
												{@const cleanImageUrl = imageParts[1].replace(/<[^>]*>/g, '')}
												{@html imageParts[0]}
												<div class="image-container group">
													<img src={cleanImageUrl} alt="AI generated artwork" class="generated-image" />
													<!-- Action buttons -->
													<div class="image-actions">
														<button
															onclick={() => copyImage(cleanImageUrl)}
															class="image-action-btn"
															aria-label="Copy image"
															title="Copy image"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="16"
																height="16"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															>
																<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
																<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
															</svg>
														</button>
														<button
															onclick={() => downloadImage(cleanImageUrl)}
															class="image-action-btn"
															aria-label="Download image"
															title="Download image"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="16"
																height="16"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															>
																<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
																<polyline points="7 10 12 15 17 10"></polyline>
																<line x1="12" y1="15" x2="12" y2="3"></line>
															</svg>
														</button>
													</div>
												</div>
											{:else}
												{@html line}
											{/if}
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

	/* Image container styles */
	.image-container {
		position: relative;
		margin-top: 1rem;
		margin-bottom: 1rem;
		max-width: 512px;
		width: 100%;
		overflow: hidden;
		border-radius: 0.5rem;
		border: 1px solid rgb(51 65 85);
		background: rgb(30 41 59);
	}

	.generated-image {
		width: 100%;
		height: auto;
		max-height: 512px;
		object-fit: contain;
		display: block;
	}

	/* Image action buttons */
	.image-actions {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		gap: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.image-container.group:hover .image-actions {
		opacity: 1;
	}

	.image-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: rgba(15, 23, 42, 0.9);
		border: 1px solid rgb(51 65 85);
		border-radius: 0.375rem;
		color: rgb(148 163 184);
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(4px);
	}

	.image-action-btn:hover {
		background: rgba(30, 41, 59, 0.95);
		border-color: rgb(100 116 139);
		color: rgb(226 232 240);
		transform: scale(1.05);
	}

	.image-action-btn:active {
		transform: scale(0.95);
	}

	/* Image loading skeleton */
	.image-skeleton {
		position: relative;
		margin-top: 1rem;
		margin-bottom: 1rem;
		max-width: 512px;
		width: 100%;
		height: 512px;
		border-radius: 0.5rem;
		background: rgb(30 41 59);
		border: 1px solid rgb(51 65 85);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.skeleton-shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(148, 163, 184, 0.1) 50%,
			transparent 100%
		);
		animation: shimmer 2s infinite;
	}

	.skeleton-text {
		position: relative;
		z-index: 10;
		color: rgb(148 163 184);
		font-size: 0.875rem;
		animation: pulse 2s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
	}
</style>
