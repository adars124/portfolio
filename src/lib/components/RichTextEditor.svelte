<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';
	import { Table } from '@tiptap/extension-table';
	import { TableRow } from '@tiptap/extension-table-row';
	import { TableCell } from '@tiptap/extension-table-cell';
	import { TableHeader } from '@tiptap/extension-table-header';

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
				}),
				Table.configure({
					resizable: true,
					HTMLAttributes: {
						class: 'border-collapse border border-slate-600'
					}
				}),
				TableRow,
				TableCell.configure({
					HTMLAttributes: {
						class: 'border border-slate-600'
					}
				}),
				TableHeader.configure({
					HTMLAttributes: {
						class: 'border border-slate-600 bg-slate-700 font-semibold'
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

	// Table functions
	function insertTable() {
		editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	}

	function addColumnBefore() {
		editor?.chain().focus().addColumnBefore().run();
	}

	function addColumnAfter() {
		editor?.chain().focus().addColumnAfter().run();
	}

	function deleteColumn() {
		editor?.chain().focus().deleteColumn().run();
	}

	function addRowBefore() {
		editor?.chain().focus().addRowBefore().run();
	}

	function addRowAfter() {
		editor?.chain().focus().addRowAfter().run();
	}

	function deleteRow() {
		editor?.chain().focus().deleteRow().run();
	}

	function deleteTable() {
		editor?.chain().focus().deleteTable().run();
	}

	function toggleHeaderRow() {
		editor?.chain().focus().toggleHeaderRow().run();
	}

	// Get HTML content
	export function getHTML(): string {
		return editor?.getHTML() || '';
	}
</script>

<!-- Editor Toolbar -->
<div class="flex flex-wrap gap-1 rounded-t-lg border border-slate-700 bg-slate-800 p-2">
	<!-- Headings -->
	<div class="flex gap-1 border-r border-slate-700 pr-2">
		<button
			type="button"
			onclick={() => toggleHeading(2)}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Heading 2"
		>
			H2
		</button>
		<button
			type="button"
			onclick={() => toggleHeading(3)}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
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
			class="rounded bg-slate-700 px-3 py-1.5 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-600"
			title="Bold"
		>
			B
		</button>
		<button
			type="button"
			onclick={toggleItalic}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 italic transition-colors hover:bg-slate-600"
			title="Italic"
		>
			I
		</button>
		<button
			type="button"
			onclick={toggleStrike}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 line-through transition-colors hover:bg-slate-600"
			title="Strikethrough"
		>
			S
		</button>
		<button
			type="button"
			onclick={toggleCode}
			class="rounded bg-slate-700 px-3 py-1.5 font-mono text-sm text-slate-300 transition-colors hover:bg-slate-600"
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
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Bullet List"
		>
			• List
		</button>
		<button
			type="button"
			onclick={toggleOrderedList}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
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
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Code Block"
		>
			Code
		</button>
		<button
			type="button"
			onclick={toggleBlockquote}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Quote"
		>
			"
		</button>
	</div>

	<!-- Insert -->
	<div class="flex gap-1 border-r border-slate-700 pr-2">
		<button
			type="button"
			onclick={addLink}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Add Link"
		>
			Link
		</button>
		<button
			type="button"
			onclick={addImage}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Add Image"
		>
			Image
		</button>
		<button
			type="button"
			onclick={setHorizontalRule}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Horizontal Rule"
		>
			—
		</button>
	</div>

	<!-- Table -->
	<div class="flex gap-1">
		<button
			type="button"
			onclick={insertTable}
			class="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-600"
			title="Insert Table"
		>
			Table
		</button>
	</div>
</div>

<!-- Table Controls (shown when cursor is in a table) -->
<div class="flex flex-wrap gap-1 border-x border-slate-700 bg-slate-900 p-1.5 text-xs">
	<span class="self-center px-2 text-slate-500">Table:</span>
	<button
		type="button"
		onclick={addRowBefore}
		class="rounded bg-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-slate-600"
		title="Add Row Before"
	>
		+ Row Above
	</button>
	<button
		type="button"
		onclick={addRowAfter}
		class="rounded bg-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-slate-600"
		title="Add Row After"
	>
		+ Row Below
	</button>
	<button
		type="button"
		onclick={deleteRow}
		class="rounded bg-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-red-600"
		title="Delete Row"
	>
		- Row
	</button>
	<span class="mx-1 border-l border-slate-600"></span>
	<button
		type="button"
		onclick={addColumnBefore}
		class="rounded bg-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-slate-600"
		title="Add Column Before"
	>
		+ Col Left
	</button>
	<button
		type="button"
		onclick={addColumnAfter}
		class="rounded bg-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-slate-600"
		title="Add Column After"
	>
		+ Col Right
	</button>
	<button
		type="button"
		onclick={deleteColumn}
		class="rounded bg-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-red-600"
		title="Delete Column"
	>
		- Col
	</button>
	<span class="mx-1 border-l border-slate-600"></span>
	<button
		type="button"
		onclick={toggleHeaderRow}
		class="rounded bg-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-slate-600"
		title="Toggle Header Row"
	>
		Header
	</button>
	<button
		type="button"
		onclick={deleteTable}
		class="rounded bg-red-700 px-2 py-1 text-slate-200 transition-colors hover:bg-red-600"
		title="Delete Table"
	>
		Delete Table
	</button>
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

	/* Table styles */
	:global(.ProseMirror table) {
		border-collapse: collapse;
		width: auto;
		margin: 1rem 0;
		overflow: hidden;
	}

	:global(.ProseMirror th),
	:global(.ProseMirror td) {
		border: 1px solid rgb(71 85 105);
		padding: 0.25rem 0.5rem;
		text-align: left;
		vertical-align: middle;
		min-width: 50px;
		line-height: 1.2;
	}

	:global(.ProseMirror th) {
		background-color: rgb(51 65 85);
		font-weight: 600;
		color: rgb(241 245 249);
	}

	:global(.ProseMirror td) {
		background-color: rgb(30 41 59);
		color: rgb(203 213 225);
	}

	:global(.ProseMirror tr:hover td) {
		background-color: rgb(51 65 85);
	}

	:global(.ProseMirror th p),
	:global(.ProseMirror td p) {
		margin: 0;
		padding: 0;
	}

	/* Selected cell styling */
	:global(.ProseMirror .selectedCell) {
		background-color: rgb(59 130 246 / 0.3) !important;
	}

	/* Column resize handle */
	:global(.ProseMirror .column-resize-handle) {
		position: absolute;
		right: -2px;
		top: 0;
		bottom: 0;
		width: 4px;
		background-color: rgb(59 130 246);
		cursor: col-resize;
	}

	:global(.ProseMirror.resize-cursor) {
		cursor: col-resize;
	}
</style>
