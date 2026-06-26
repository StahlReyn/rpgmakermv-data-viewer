<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { traitCodeNames, getTraitStyle, type Trait } from '$lib/types';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		traits?: Trait[];
		singleLine?: boolean;
		fallbackText?: string;
		onTraitClick?: (detail: { trait: Trait; index: number }) => void;
	}

	let {
		traits = [],
		singleLine = false,
		fallbackText = 'No Traits',
		onTraitClick,
		...restProps
	}: Props = $props();

	// Helper function to build readable labels out of the raw numeric values
	function formatTraitText(trait: Trait): string {
		const name = traitCodeNames[trait.code] || `Unknown (${trait.code})`;
		
		// If value is 0 or unassigned, skip appending additional data numbers
		if (trait.value === 0 && trait.dataId === 0) return name;
		
		// Standard display format: Name [ID] (Value)
		return `${name} [ID:${trait.dataId}] (${trait.value})`;
	}
</script>

{#if traits.length === 0}
	<span class="muted">{fallbackText}</span>
{:else}
	<div class="trait-list" class:single-line={singleLine} {...restProps}>
		{#each traits as trait, i (i)}
			{@const styleConfig = getTraitStyle(trait.code)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="trait-tag"
				style:--trait-bg={styleConfig.bg}
				style:--trait-color={styleConfig.color}
				onclick={() => onTraitClick?.({ trait, index: i })}
			>
				<span class="trait-symbol">{styleConfig.symbol}</span>
				<span class="trait-text">{formatTraitText(trait)}</span>
			</span>
		{/each}
	</div>
{/if}

<style>
	.muted {
		color: #888;
		font-style: italic;
	}

	.trait-list {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 6px;
		vertical-align: middle;
	}

	.trait-list.single-line {
		flex-wrap: nowrap;
		overflow-x: auto;
		max-width: 100%;
		white-space: nowrap;
		scrollbar-width: none;
	}

	.trait-list.single-line::-webkit-scrollbar {
		display: none;
	}

	.trait-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background-color: var(--trait-bg);
		color: var(--trait-color);
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 0.85em;
		font-family: monospace, sans-serif;
		cursor: pointer;
		user-select: none;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: transform 0.1s ease, filter 0.1s ease;
	}

	.trait-tag:hover {
		filter: brightness(1.15);
		transform: translateY(-1px);
	}
	
	.trait-symbol {
		font-size: 1em;
	}
</style>
