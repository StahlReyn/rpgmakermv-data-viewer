<script lang="ts">
    import type { AppFilters } from '$lib/types';

    // We accept a filters object that can be updated from here and reflect in the parent
    let { filters = $bindable() }: { filters: AppFilters } = $props();
</script>

<header>
    <div class="header-top">
        <div>
            <h1>Enemy Stats Viewer</h1>
            <p>Drag and drop a JSON file anywhere, or loads fallback.</p>
        </div>
        <div class="theme-control">
            <label>Theme:
                <select bind:value={filters.themeMode}>
                    <option value="browser">Browser</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>
        </div>
    </div>
    
    <div class="controls">
        <div class="search-control">
            <div class="search-input">
                <label for="search">Search:</label>
                <input id="search" type="search" placeholder="Search enemies" bind:value={filters.searchQuery}/>
            </div>
            <small class="search-description">Use <code>-term</code> to exclude matching enemies.</small>
            <hr />
        </div>
        
        <div class="control-grid">
            <label>View:
                <select bind:value={filters.viewMode}>
                    <option value="list">List</option>
                    <option value="grid">Grid</option>
                </select>
            </label>
            <label>Sort by:
                <select bind:value={filters.sortKey}>
                    <option value="id">ID</option>
                    <option value="name">Name</option>
                    <option value="hp">HP</option>
                    <option value="exp">EXP</option>
                    <option value="gold">Gold</option>
                </select>
            </label>
            <label>Direction:
                <select bind:value={filters.sortDir}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </label>
            <label>ID min: <input type="number" min="0" bind:value={filters.minId} /></label>
            <label>ID max: <input type="number" min="0" bind:value={filters.maxId} /></label>
            
            <div class="checkboxes">
                <label><input type="checkbox" bind:checked={filters.hideNoName} /> Hide blank names</label>
                <label><input type="checkbox" bind:checked={filters.hideNotes} /> Hide notes</label>
                <label><input type="checkbox" bind:checked={filters.hideMag} /> Hide MAT/MDF</label>
            </div>
        </div>
    </div>
</header>

<style>
    .control-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
        margin-top: 12px;
        input, select {
            min-width: 8em;
            width: 1em;
        }
    }
    .checkboxes {
        display: flex;
        gap: 12px;
    }
</style>