<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDropStyle, formatProbability, type DropItem, dropKindConfig } from '$lib/types';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		drops?: DropItem[];
		singleLine?: boolean;
		fallbackText?: string;
		// Optional item database names mapping lookup (e.g., { 1: "Potion" }) passed from your global state
		itemNames?: Record<number, string>; 
		onDropClick?: (detail: { drop: DropItem; index: number }) => void;
	}

	let {
		drops = [],
		singleLine = false,
		fallbackText = 'No Drops',
		itemNames = {},
		onDropClick,
		...restProps
	}: Props = $props();

	// Filters out 'kind: 0' (None) drops to keep the interface clean
	const validDrops = $derived(drops.filter(d => d.kind > 0));

	function formatDropText(drop: DropItem): string {
		const typeName = dropKindConfig[drop.kind]?.name || 'Unknown';
		// Uses the database name if available, otherwise falls back to a standardized ID tag string
		const itemName = itemNames[drop.dataId] || `${typeName} #${drop.dataId}`;
		const rate = formatProbability(drop.denominator);
		
		return `${itemName} [${rate}]`;
	}
</script>

{#if validDrops.length === 0}
	<span class="muted">{fallbackText}</span>
{:else}
	<div class="drop-list" class:single-line={singleLine} {...restProps}>
		{#each validDrops as drop, i (i)}
			{@const styleConfig = getDropStyle(drop.kind)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="drop-tag"
				style:--drop-bg={styleConfig.bg}
				style:--drop-color={styleConfig.color}
				onclick={() => onDropClick?.({ drop, index: i })}
			>
				<span class="drop-symbol">{styleConfig.symbol}</span>
				<span class="drop-text">{formatDropText(drop)}</span>
			</span>
		{/each}
	</div>
{/if}

<style>
	.muted {
		color: #888;
		font-style: italic;
	}

	.drop-list {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 6px;
		vertical-align: middle;
	}

	.drop-list.single-line {
		flex-wrap: nowrap;
		overflow-x: auto;
		max-width: 100%;
		white-space: nowrap;
		scrollbar-width: none;
	}

	.drop-list.single-line::-webkit-scrollbar {
		display: none;
	}

	.drop-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background-color: var(--drop-bg);
		color: var(--drop-color);
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 0.85em;
		font-family: monospace, sans-serif;
		cursor: pointer;
		user-select: none;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: transform 0.1s ease, filter 0.1s ease;
	}

	.drop-tag:hover {
		filter: brightness(1.15);
		transform: translateY(-1px);
	}
	
	.drop-symbol {
		font-size: 1em;
	}
</style>
