<script lang="ts">
    import type { NormalizedEnemy } from '$lib/types';

    let { 
        enemy, 
        hideNotes = false, 
        hideMag = false 
    }: { 
        enemy: NormalizedEnemy; 
        hideNotes?: boolean; 
        hideMag?: boolean;
    } = $props();
</script>

<div class="card">
    <div class="card-header">
        <span class="enemy-id">#{enemy.id}</span>
        <h2 class="enemy-name">{enemy.name || 'Unnamed Enemy'}</h2>
    </div>

    <div class="stats-grid">
        <div class="stat"><span class="label">HP</span> <span class="val">{enemy.hp}</span></div>
        <div class="stat"><span class="label">MP</span> <span class="val">{enemy.mp}</span></div>
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
        <div class="stat"><span class="label">EXP</span> {enemy.exp}</div>
        <div class="stat"><span class="label">Gold</span> {enemy.gold}</div>
    </div>

    <div class="lists">
        <div class="list-section">
            <strong>Drops:</strong>
            {#if enemy.dropItems.length === 0}
                <span class="muted">None</span>
            {:else}
                <ul>
                    {#each enemy.dropItems as drop}
                        <li>{drop}</li>
                    {/each}
                </ul>
            {/if}
        </div>

        <div class="list-section">
            <strong>Traits:</strong>
            {#if enemy.traits.length === 0}
                <span class="muted">None</span>
            {:else}
                <ul>
                    {#each enemy.traits as trait}
                        <li>{trait}</li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>

    {#if !hideNotes && enemy.note}
        <div class="notes">
            <strong>Notes:</strong>
            <p>{@html enemy.note.replace(/\n/g, '<br>')}</p>
        </div>
    {/if}
</div>

<style>
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
    .enemy-id {
        color: var(--color-muted);
        font-family: monospace;
        font-size: 1.1em;
    }
    .enemy-name {
        margin: 0;
        font-size: 1.25em;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        background: var(--color-bg);
        padding: 8px;
        border-radius: 4px;
    }
    .stat {
        display: flex;
        flex-direction: column;
        font-size: 0.9em;
    }
    .stat .label {
        color: var(--color-muted);
        font-size: 0.8em;
        text-transform: uppercase;
    }
    .rewards {
        display: flex;
        gap: 16px;
        font-weight: bold;
        color: #d4af37; /* Gold-ish color */
    }
    .lists {
        display: flex;
        gap: 16px;
    }
    .list-section {
        flex: 1;
        font-size: 0.9em;
    }
    ul {
        margin: 4px 0 0;
        padding-left: 16px;
    }
    .notes {
        background: var(--color-header-alt);
        padding: 8px;
        border-radius: 4px;
        font-size: 0.85em;
    }
    .notes p { margin: 4px 0 0; }
    .muted { color: var(--color-muted); }
</style>