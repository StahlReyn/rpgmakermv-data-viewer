<script lang="ts">
    import type { NormalizedEnemy } from '../types';
    import TagList from '$lib/components/TagList.svelte';

    let { 
        enemy, 
        hideNotes = false, 
        hideMag = false,
        viewMode = 'list'
    }: { 
        enemy: NormalizedEnemy; 
        hideNotes?: boolean; 
        hideMag?: boolean;
        viewMode?: 'list' | 'grid';
    } = $props();

    // Normal callback signature receiving parameters directly
	function handleTagClick({ item, index }: { item: string; index: number }) {
		console.log(`Clicked ${item} at index ${index}`);
	}
</script>

<div class="card" class:list-mode={viewMode === 'list'}>
    <div class="card-header">
        <span class="enemy-id">{enemy.id}</span>
        <h2 class="enemy-name" title={enemy.name}>{enemy.name || 'Unnamed'}</h2>
    </div>

    <div class="stats-grid">
        <div class="stat"><span class="label">HP</span> <span class="val" style="color:darkred">{enemy.hp}</span></div>
        <div class="stat"><span class="label">MP</span> <span class="val" style="color:darkblue">{enemy.mp}</span></div>
        <div class="stat"><span class="label">ATK</span> <span class="val">{enemy.atk}</span></div>
        <div class="stat"><span class="label">DEF</span> <span class="val">{enemy.def}</span></div>
        
        {#if !hideMag}
            <div class="stat"><span class="label">MAT</span> <span class="val">{enemy.mat}</span></div>
            <div class="stat"><span class="label">MDF</span> <span class="val">{enemy.mdf}</span></div>
        {/if}
        
        <div class="stat"><span class="label">AGI</span> <span class="val">{enemy.agi}</span></div>
        <div class="stat"><span class="label">LUK</span> <span class="val">{enemy.luk}</span></div>
    </div>

    <div class="rewards">
        <div class="stat"><span class="label">EXP</span> <span class="val">{enemy.exp}</span></div>
        <div class="stat"><span class="label">Gold</span> <span class="val">{enemy.gold}</span></div>
    </div>
    <div class="list-section">
        <strong class="list-label">Drops:</strong>
        <TagList 
            items={enemy.dropItems} 
            singleLine={viewMode === 'list'} 
            fallbackText="No drops"
            onTagClick={handleTagClick}
        />
    </div>
    <div class="list-section">
        <strong class="list-label">Traits:</strong>
        <TagList 
            items={enemy.traits} 
            singleLine={viewMode === 'list'} 
            fallbackText="No drops"
            onTagClick={handleTagClick}
        />
    </div>

    {#if !hideNotes && enemy.note}
        <div class="notes">
            {#if viewMode === 'list'}
                <pre class="truncate" title={enemy.note}>{enemy.note.replace(/\n/g, ' ')}</pre>
            {:else}
                <strong>Notes:</strong>
                <pre>{enemy.note}</pre>
            {/if}
        </div>
    {/if}
</div>

<style>
    /* -------------------------------------
       1. Default Grid Mode
       ------------------------------------- */
    .card {
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid var(--color-border-muted);
        padding-bottom: 8px;
    }
    .enemy-id { color: var(--color-muted); font-family: monospace; font-size: 1em; text-align: right; width: 3em;}
    .enemy-name { margin: 0; font-size: 1.25em; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: var(--color-bg); padding: 8px; border-radius: 4px; }
    .stat { display: flex; flex-direction: column; font-size: 0.9em; }
    .stat .label { color: var(--color-muted); font-size: 0.8em; text-transform: uppercase; }
    
    .rewards { display: flex; gap: 16px; font-weight: bold; color: #d4af37; }
    .notes { background: var(--color-header-alt); padding: 8px; border-radius: 4px; font-size: 0.85em; }

    /* -------------------------------------
       2. List Mode Override (Table Row Match)
       ------------------------------------- */
    .card.list-mode {
        display: grid;
        grid-template-columns: var(--list-grid-template);
        gap: 12px;
        align-items: center;
        padding: 8px 16px;
        border: none;
        border-bottom: 1px solid var(--color-border);
        border-radius: 0;
        box-shadow: none;
        background: transparent;
    }
    .card.list-mode:last-child {
        border-bottom: none;
    }
    .card.list-mode:hover {
        background: var(--color-row-hover);
    }
    .card.list-mode h2 {
        font-size: 1em;
    }

    /* Flatten internal layout wrappers directly into the parent grid columns */
    .card.list-mode .stats-grid,
    .card.list-mode .rewards {
        display: contents;
    }

    /* Hide the individual card labels (since the sticky header handles them) */
    .card.list-mode .label,
    .card.list-mode .list-label {
        display: none;
    }

    /* Column Alignment and Formatting */
    .card.list-mode .card-header {
        border-bottom: none;
        padding: 0;
        display: flex;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
    }
    .card.list-mode .enemy-name {
        font-size: 1em;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .card.list-mode .stat,
    .card.list-mode .list-section {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.85em;
        min-width: 0; /* Critical for grid text overflow */
    }
    .card.list-mode .notes {
        background: transparent;
        padding: 0;
        min-width: 0;
    }
    pre.truncate {
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--color-muted);
    }
</style>