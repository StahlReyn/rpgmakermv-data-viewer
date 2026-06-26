<script lang="ts">
    import { onMount } from 'svelte';
    import type { Enemy, AppFilters } from '$lib/types';
    import HeaderControls from '$lib/components/HeaderControls.svelte';
    import EnemyCard from '$lib/components/EnemyCard.svelte';
    import '$lib/global.css'
    import './page.css'

    const DATA_PATH: string = '/sample_data/Enemies.json';
    const THEME_STORAGE_KEY: string = 'enemyViewerThemeMode';

    // State Variables
    let enemies = $state<Enemy[]>([]);
    let statusMessage = $state('Loading enemy stats…');
    let isError = $state(false);
    let dragActive = $state(false);
    let fileInput = $state<HTMLInputElement>();

    // Centralized UI Filters
    let filters = $state<AppFilters>({
        searchQuery: '-RESERVED',
        sortKey: 'id',
        sortDir: 'asc',
        minId: 0,
        maxId: 2000,
        hideNoName: true,
        hideNotes: true,
        hideMag: true,
        themeMode: 'browser',
        viewMode: 'list'
    });

    // Data Loaders
    async function loadEnemies(data: Enemy[] | null = null): Promise<void> {
        try {
            isError = false;
            let json = data;
            if (!json) {
                const response = await fetch(DATA_PATH, { cache: 'no-store' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                json = await response.json();
            }
            enemies = Array.isArray(json) ? json.filter(item => item && item.id !== undefined) : [];
        } catch (error) {
            isError = true;
            statusMessage = "Unable to load enemy data: "
            if (error instanceof Error) {
                statusMessage += error.message;
            } else {
                statusMessage += String(error);
            }
        }
    }

    function processSelectedFile(file: File): void {
        if (!file.name.endsWith('.json')) {
            isError = true;
            statusMessage = "Please select a JSON file.";
            return;
        }
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                if (typeof e.target?.result === 'string') loadEnemies(JSON.parse(e.target.result));
            } catch (error) {
                isError = true;
                statusMessage = "Failed to parse JSON: "
                if (error instanceof Error) {
                    statusMessage += error.message;
                } else {
                    statusMessage += String(error);
                }
            }
        };
        reader.readAsText(file);
    }

    // Derived filtering algorithm
    let filteredEnemies = $derived(
        enemies.filter(enemy => {
            // const query = filters.searchQuery.trim().toLowerCase();
            // if (query) {
            //     const tokens = query.match(/(-?"[^"]+"|[^"\s]+)/g) || [];
            //     const positiveTerms = tokens.filter(t => !t.startsWith('-')).map(t => t.replace(/"/g, ''));
            //     const negativeTerms = tokens.filter(t => t.startsWith('-')).map(t => t.slice(1).replace(/"/g, ''));
                
            //     const text = enemy.searchText;
            //     if (!positiveTerms.every(term => text.includes(term))) return false;
            //     if (!negativeTerms.every(term => !text.includes(term))) return false;
            // }
            const id = Number(enemy.id) || 0;
            if (filters.minId !== null && id < filters.minId) return false;
            if (filters.maxId !== null && id > filters.maxId) return false;
            if (filters.hideNoName && (!enemy.name || enemy.name.trim() === '')) return false;

            return true;
        })
        // .sort((a, b) => {
        //     const aVal = a[filters.sortKey] ?? '';
        //     const bVal = b[filters.sortKey] ?? '';
        //     if (typeof aVal === 'number' && typeof bVal === 'number') {
        //         return filters.sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        //     }
        //     return filters.sortDir === 'asc'
        //         ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        //         : String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
        // })
    );

    // Calculate dynamic grid columns based on active filters
    let listGridTemplate = $derived(
        `200px ` + // ID & Name
        `50px 50px 50px 50px ` + // HP, MP, ATK, DEF
        (filters.hideMag ? `` : `50px 50px `) + // MAT, MDF
        `50px 50px ` + // AGI, LUK
        `60px 60px ` + // EXP, Gold
        `1fr 1fr ` + // Drops, Traits
        (filters.hideNotes ? `` : `1.5fr`) // Notes
    );

    // Side Effects
    $effect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.remove('theme-light', 'theme-dark');
            if (filters.themeMode !== 'browser') {
                document.body.classList.add(`theme-${filters.themeMode}`);
                localStorage.setItem(THEME_STORAGE_KEY, filters.themeMode);
            } else {
                localStorage.removeItem(THEME_STORAGE_KEY);
            }
        }
    });

    $effect(() => {
        if (!isError && enemies.length > 0) {
            statusMessage = `Showing ${filteredEnemies.length} of ${enemies.length} enemies (ID ${filters.minId || 0}-${filters.maxId || '∞'}).`;
        }
    });

    onMount(() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'browser') {
            filters.themeMode = storedTheme;
        }
        loadEnemies();
    });
</script>

<svelte:window 
    ondragover={(e) => { e.preventDefault(); dragActive = true; }} 
    ondragleave={(e) => { e.preventDefault(); if (!e.relatedTarget || (e.relatedTarget as Element).nodeName === 'HTML') dragActive = false; }} 
    ondrop={(e) => {
        e.preventDefault();
        dragActive = false;
        if (e.dataTransfer?.files?.length) processSelectedFile(e.dataTransfer.files[0]);
    }} 
/>

<div class:drag-active-global={dragActive}>
    <HeaderControls bind:filters />

    <section class="content">
        <div class="status" class:error={isError}>{statusMessage}</div>
        
        <div class="card-grid" 
            class:list-view={filters.viewMode === 'list'} 
            style="--list-grid-template: {listGridTemplate}">

            {#if filters.viewMode === 'list' && filteredEnemies.length > 0}
                <div class="list-header">
                    <div class="lh-cell">ID / Name</div>
                    <div class="lh-cell">HP</div>
                    <div class="lh-cell">MP</div>
                    <div class="lh-cell">ATK</div>
                    <div class="lh-cell">DEF</div>
                    {#if !filters.hideMag}
                        <div class="lh-cell">MAT</div>
                        <div class="lh-cell">MDF</div>
                    {/if}
                    <div class="lh-cell">AGI</div>
                    <div class="lh-cell">LUK</div>
                    <div class="lh-cell">EXP</div>
                    <div class="lh-cell">Gold</div>
                    <div class="lh-cell">Drops</div>
                    <div class="lh-cell">Traits</div>
                    {#if !filters.hideNotes}
                        <div class="lh-cell">Notes</div>
                    {/if}
                </div>
            {/if}

            {#if filteredEnemies.length === 0}
                <div class="empty-state">No matching enemies found.</div>
            {:else}
                {#each filteredEnemies as enemy (enemy.id)}
                    <EnemyCard 
                        {enemy} 
                        hideNotes={filters.hideNotes} 
                        hideMag={filters.hideMag} 
                        viewMode={filters.viewMode} 
                    />
                {/each}
            {/if}
        </div>
        
        <div class="drop-zone" class:drag-active={dragActive}>
            <p>📥 Drop JSON file here</p>
            <button type="button" onclick={() => fileInput?.click()}>Select JSON file</button>
            <input bind:this={fileInput} type="file" accept=".json,application/json" hidden onchange={(e) => processSelectedFile((e.target as HTMLInputElement).files![0])} />
        </div>
    </section>
</div>

<style>
    .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
        padding: 16px 0;
    }
    /* Forces the grid into a single vertical column for list rows */
    .card-grid.list-view {
        grid-template-columns: 1fr;
        gap: 0px;
    }
    .list-header {
        display: grid;
        grid-template-columns: var(--list-grid-template);
        gap: 12px;
        padding: 12px 16px;
        background: var(--color-header-alt);
        border: 1px solid var(--color-border);
        border-radius: 8px 8px 0 0;
        font-weight: bold;
        color: var(--color-muted);
        text-transform: uppercase;
        font-size: 0.8em;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
        color: var(--color-muted);
        border: 2px dashed var(--color-border);
        border-radius: 8px;
    }
    .status {
        margin: 12px 0;
        font-weight: bold;
    }
    .error { color: var(--color-error); }
</style>