<script lang="ts">
	// Define the TypeScript interface for props
	interface Props {
		items?: string[];
		singleLine?: boolean;
		fallbackText?: string;
		// In Svelte 5, events are just standard callback function props
		onTagClick?: (detail: { item: string; index: number }) => void;
	}

	// Destructure props using Svelte 5 $props() rune with default values
	let { 
		items = [], 
		singleLine = false, 
		fallbackText = 'None',
		onTagClick
	}: Props = $props();
</script>

{#if items.length === 0}
	<span class="muted">{fallbackText}</span>
{:else}
	<div class="tag-list" class:single-line={singleLine}>
		{#each items as item, i (i)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element-interactions -->
			<span 
				class="tag" 
				onclick={() => onTagClick?.({ item, index: i })}
			>
				{item}
			</span>
		{/each}
	</div>
{/if}

<style>
	.muted {
		color: #888;
		font-style: italic;
	}

	.tag-list {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 6px;
		vertical-align: middle;
	}

	.tag-list.single-line {
		flex-wrap: nowrap;
		overflow-x: auto;
		max-width: 100%;
		white-space: nowrap;
		scrollbar-width: none; 
	}
	
	.tag-list.single-line::-webkit-scrollbar {
		display: none;
	}

	.tag {
		display: inline-block;
		background-color: var(--tag-bg, #e0e0e0);
		color: var(--tag-color, #333);
		padding: 2px 6px;
		border-radius: 6px;
		font-size: 0.85em;
		cursor: pointer;
		user-select: none;
	}

	.tag:hover {
		background-color: var(--tag-bg-hover, #d4d4d4);
	}
</style>
