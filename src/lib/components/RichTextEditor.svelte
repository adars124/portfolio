<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';

	interface Props {
		content?: string;
		onUpdate?: (html: string) => void;
		editorId?: string;
	}

	let { content = '', onUpdate, editorId = 'editor' }: Props = $props();

	let element: HTMLDivElement;
	let editor: Editor | null = null;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-blue-400 underline'
					}
				}),
				Image.configure({
					HTMLAttributes: {
						class: 'max-w-full h-auto rounded-lg'
					}
				})
			],
			content: content,
			editorProps: {
				attributes: {
					class:
						'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100',
					id: editorId
				}
			},
			onUpdate: ({ editor }) => {
				if (onUpdate) {
					onUpdate(editor.getHTML());
				}
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleStrike() {
		editor?.chain().focus().toggleStrike().run();
	}

	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
	}

	function toggleHeading(level: 1 | 2 | 3) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function toggleCodeBlock() {
		editor?.chain().focus().toggleCodeBlock().run();
	}

	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function addLink() {
		const url = window.prompt('Enter URL:');
		if (url) {
			editor?.chain().focus().setLink({ href: url }).run();
		}
	}

	function addImage() {
		const url = window.prompt('Enter image URL:');
		if (url) {
			editor?.chain().focus().setImage({ src: url }).run();
		}
	}

	function setHorizontalRule() {
		editor?.chain().focus().setHorizontalRule().run();
	}

	// Get HTML content
	export function getHTML(): string {
		return editor?.getHTML() || '';
	}
</script>

<!-- Editor Toolbar -->
<div class="border border-slate-700 rounded-t-lg bg-slate-800 p-2 flex flex-wrap gap-1">
	<!-- Headings -->
	<div class="flex gap-1 border-r border-slate-700 pr-2">
		<button
			type="button"
			onclick={() => toggleHeading(2)}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Heading 2"
		>
			H2
		</button>
		<button
			type="button"
			onclick={() => toggleHeading(3)}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Heading 3"
		>
			H3
		</button>
	</div>

	<!-- Text Formatting -->
	<div class="flex gap-1 border-r border-slate-700 pr-2">
		<button
			type="button"
			onclick={toggleBold}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors font-bold"
			title="Bold"
		>
			B
		</button>
		<button
			type="button"
			onclick={toggleItalic}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors italic"
			title="Italic"
		>
			I
		</button>
		<button
			type="button"
			onclick={toggleStrike}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors line-through"
			title="Strikethrough"
		>
			S
		</button>
		<button
			type="button"
			onclick={toggleCode}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors font-mono"
			title="Inline Code"
		>
			{'<>'}
		</button>
	</div>

	<!-- Lists -->
	<div class="flex gap-1 border-r border-slate-700 pr-2">
		<button
			type="button"
			onclick={toggleBulletList}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Bullet List"
		>
			• List
		</button>
		<button
			type="button"
			onclick={toggleOrderedList}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Numbered List"
		>
			1. List
		</button>
	</div>

	<!-- Blocks -->
	<div class="flex gap-1 border-r border-slate-700 pr-2">
		<button
			type="button"
			onclick={toggleCodeBlock}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Code Block"
		>
			Code
		</button>
		<button
			type="button"
			onclick={toggleBlockquote}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Quote"
		>
			"
		</button>
	</div>

	<!-- Insert -->
	<div class="flex gap-1">
		<button
			type="button"
			onclick={addLink}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Add Link"
		>
			Link
		</button>
		<button
			type="button"
			onclick={addImage}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Add Image"
		>
			Image
		</button>
		<button
			type="button"
			onclick={setHorizontalRule}
			class="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
			title="Horizontal Rule"
		>
			—
		</button>
	</div>
</div>

<!-- Editor -->
<div bind:this={element}></div>

<style>
	:global(.ProseMirror) {
		min-height: 400px;
		padding: 1rem;
	}

	:global(.ProseMirror:focus) {
		outline: none;
	}

	:global(.ProseMirror h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: rgb(241 245 249);
	}

	:global(.ProseMirror h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		color: rgb(226 232 240);
	}

	:global(.ProseMirror p) {
		margin-bottom: 1rem;
		color: rgb(203 213 225);
	}

	:global(.ProseMirror ul),
	:global(.ProseMirror ol) {
		padding-left: 1.5rem;
		margin-bottom: 1rem;
	}

	:global(.ProseMirror li) {
		margin-bottom: 0.5rem;
	}

	:global(.ProseMirror code) {
		background-color: rgb(30 41 59);
		color: rgb(226 232 240);
		padding: 0.2em 0.4em;
		border-radius: 0.25rem;
		font-size: 0.875em;
		font-family: monospace;
	}

	:global(.ProseMirror pre) {
		background-color: rgb(15 23 42);
		border: 1px solid rgb(51 65 85);
		border-radius: 0.5rem;
		padding: 1rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	:global(.ProseMirror pre code) {
		background-color: transparent;
		padding: 0;
		color: rgb(226 232 240);
	}

	:global(.ProseMirror blockquote) {
		border-left: 4px solid rgb(51 65 85);
		padding-left: 1rem;
		margin-left: 0;
		margin-bottom: 1rem;
		font-style: italic;
		color: rgb(148 163 184);
	}

	:global(.ProseMirror hr) {
		border: none;
		border-top: 1px solid rgb(51 65 85);
		margin: 2rem 0;
	}

	:global(.ProseMirror img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}

	:global(.ProseMirror a) {
		color: rgb(96 165 250);
		text-decoration: underline;
	}

	:global(.ProseMirror a:hover) {
		color: rgb(147 197 253);
	}
</style>
