<script lang="ts">
    import { onMount } from 'svelte';
    import '../../global.css';
    import './page.css';

    // ==========================================
    // 1. TypeScript Interfaces
    // ==========================================
    interface DropItem {
        kind: number;
        dataId: number;
        denominator: number;
    }

    interface Trait {
        code: number;
        dataId?: number;
        value?: number;
    }

    interface RawEnemy {
        id?: number;
        name?: string;
        battlerName?: string;
        exp?: number;
        gold?: number;
        dropItems?: DropItem[];
        traits?: Trait[];
        note?: string;
        params?: number[];
    }

    interface NormalizedEnemy {
        id: number | string;
        name: string;
        exp: number;
        gold: number;
        dropItems: string[];
        traits: string[];
        note: string;
        searchText: string;
        hp: number;
        mp: number;
        atk: number;
        def: number;
        mat: number;
        mdf: number;
        agi: number;
        luk: number;
        [key: string]: string | number | string[];
    }

    // ==========================================
    // 2. Constants & Dictionaries
    // ==========================================
    const DATA_PATH: string = './data/Enemies.json';
    const THEME_STORAGE_KEY: string = 'enemyViewerThemeMode';
    
    const paramNames: string[] = ['hp', 'mp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
    
    const traitCodeNames: Record<number, string> = { 11: 'Element Rate', 12: 'Debuff Rate', 13: 'State Rate', 14: 'State Resist', 21: 'Parameter', 22: 'X-Parameter', 23: 'S-Parameter', 31: 'Attack Element', 32: 'Attack State', 33: 'Attack Speed', 34: 'Attack Times', 41: 'Skill Type Add', 42: 'Skill Type Seal', 43: 'Skill Add', 44: 'Skill Seal', 51: 'Equip Wtype', 52: 'Equip Atype', 53: 'Equip Lock', 54: 'Equip Seal', 55: 'Slot Type', 61: 'Action Plus', 62: 'Special Flag', 63: 'Collapse Type', 64: 'Party Ability' };
    const xparamNames: Record<number, string> = { 0: 'Hit Rate', 1: 'Evasion Rate', 2: 'Critical Rate', 3: 'Critical Evasion Rate', 4: 'Magic Evasion Rate', 5: 'Magic Reflection Rate', 6: 'Counter Attack Rate', 7: 'HP Regeneration', 8: 'MP Regeneration', 9: 'TP Regeneration' };
    const sparamNames: Record<number, string> = { 0: 'Target Rate', 1: 'Guard Effect', 2: 'Recovery Effect', 3: 'Pharmacology', 4: 'MP Cost Rate', 5: 'TP Charge', 6: 'Physical Damage', 7: 'Magical Damage', 8: 'Floor Damage', 9: 'Experience Rate' };
    const specialFlagNames: Record<number, string> = { 0: 'Auto Battle', 1: 'Guard', 2: 'Substitute', 3: 'Preserve TP' };

    // ==========================================
    // 3. Svelte 5 Runes State Variables
    // ==========================================
    let enemies = $state<NormalizedEnemy[]>([]);
    let statusMessage = $state('Loading enemy stats…');
    let isError = $state(false);
    let dragActive = $state(false);
    let fileInput = $state<HTMLInputElement>();

    // Filters and Controls
    let searchQuery = $state('-RESERVED');
    let sortKey = $state('id');
    let sortDir = $state('asc');
    let minId = $state<number | null>(0);
    let maxId = $state<number | null>(2000);
    let hideNoName = $state(true);
    let hideNotes = $state(true);
    let hideMag = $state(true);
    let rowMode = $state('singleline');
    let themeMode = $state('browser');

    // ==========================================
    // 4. Helper Functions (Data Parsing)
    // ==========================================
    function decimalToPercentage(value: number | undefined, pos: number = 0): string {
        if (typeof value !== 'number' || !isFinite(value)) return String(value);
        return (value > 0 ? '+' : '') + `${(value * 100).toFixed(pos)}%`;
    }

    function getDropItems(items?: DropItem[]): string[] {
        if (!Array.isArray(items) || items.length === 0) return [];
        return items.map(item => {
            if (item.kind === 0) return null;
            const kind = (item.kind === 1 ? 'Item' : item.kind === 2 ? 'Weapon' : item.kind === 3 ? 'Armor' : `Kind ${item.kind}`);
            const chance = Number.isFinite(item.denominator) && item.denominator > 0 ? `1/${item.denominator}` : '0%';
            return `${kind} ${item.dataId} (${chance})`;
        }).filter((item): item is string => item !== null);
    }

    function getTraitLabel(trait: Trait): string {
        const code = Number(trait.code);
        let label = traitCodeNames[code] || `Trait ${code}`;

        if (trait.dataId !== undefined && trait.dataId !== null) {
            const dataId = Number(trait.dataId);
            switch (code) {
                case 11: label += `: Element ${dataId}`; break;
                case 12: label += `: ${paramNames[dataId] || `Param ${dataId}`}`; break;
                case 13: case 14: label += `: State ${dataId}`; break;
                case 21: label += `: ${paramNames[dataId] || `Param ${dataId}`}`; break;
                case 22: label += `: ${xparamNames[dataId] || `XParam ${dataId}`}`; break;
                case 23: label += `: ${sparamNames[dataId] || `SParam ${dataId}`}`; break;
                case 31: label += `: Element ${dataId}`; break;
                case 32: label += `: State ${dataId}`; break;
                case 41: case 42: label += `: Skill Type ${dataId}`; break;
                case 43: case 44: label += `: Skill ${dataId}`; break;
                case 51: label += `: Weapon Type ${dataId}`; break;
                case 52: label += `: Armor Type ${dataId}`; break;
                case 53: label += `: Equip Lock ${dataId}`; break;
                case 54: label += `: Equip Seal ${dataId}`; break;
                case 55: label += `: Slot Type ${dataId}`; break;
                case 61: label += `: Action ${dataId}`; break;
                case 62: label += `: ${specialFlagNames[dataId] || `Flag ${dataId}`}`; break;
                case 63: label += `: Collapse ${dataId}`; break;
                case 64: label += `: Party Ability ${dataId}`; break;
                default: label += `: ${dataId}`; break;
            }
        }

        if (trait.value !== undefined && trait.value !== null) {
            const value = Number(trait.value);
            switch (code) {
                case 11: case 12: case 13: case 21: case 22: case 23:
                    label += ` ${decimalToPercentage(value)}`; break;
                case 14: break;
                case 33: case 34: case 61:
                    label += ` +${value}`; break;
                default:
                    label += ` ${value.toString()}`; break;
            }
        }
        return label;
    }

    function getTraits(traits?: Trait[]): string[] {
        if (!Array.isArray(traits) || traits.length === 0) return [];
        return traits.map(getTraitLabel);
    }

    function normalizeEnemy(item: RawEnemy): NormalizedEnemy {
        const params = Array.isArray(item.params) ? item.params : [];
        return {
            id: item.id ?? '-',
            name: item.name ?? '',
            exp: item.exp ?? 0,
            gold: item.gold ?? 0,
            dropItems: getDropItems(item.dropItems),
            traits: getTraits(item.traits),
            note: item.note ?? '',
            searchText: [item.id, item.name, item.battlerName, item.note, item.note?.replace(/\s+/g, ' ')]
                .filter(Boolean)
                .join(' ')
                .toLowerCase(),
            hp: params[0] ?? 0,
            mp: params[1] ?? 0,
            atk: params[2] ?? 0,
            def: params[3] ?? 0,
            mat: params[4] ?? 0,
            mdf: params[5] ?? 0,
            agi: params[6] ?? 0,
            luk: params[7] ?? 0,
        };
    }

    // ==========================================
    // 5. Data Loading & Event Handlers
    // ==========================================
    async function loadEnemies(data: RawEnemy[] | null = null): Promise<void> {
        try {
            isError = false;
            let json = data;
            if (!json) {
                const response = await fetch(DATA_PATH, { cache: 'no-store' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                json = await response.json();
            }
            enemies = Array.isArray(json) 
                ? json.filter(item => item && item.id !== undefined).map(normalizeEnemy) 
                : [];
        } catch (error: any) {
            isError = true;
            statusMessage = `Unable to load enemy data: ${error.message}`;
        }
    }

    function handleDrop(event: DragEvent): void {
        event.preventDefault();
        dragActive = false;
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            processSelectedFile(files[0]);
        }
    }

    function handleFileInputChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (files && files.length > 0) {
            processSelectedFile(files[0]);
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
                const result = e.target?.result;
                if (typeof result === 'string') {
                    loadEnemies(JSON.parse(result));
                }
            } catch (error: any) {
                isError = true;
                statusMessage = `Failed to parse JSON: ${error.message}`;
            }
        };
        reader.onerror = () => { isError = true; statusMessage = "Failed to read file."; };
        reader.readAsText(file);
    }

    // ==========================================
    // 6. Svelte 5 Reactivity ($derived and $effect)
    // ==========================================
    
    // Theme side-effect handler
    $effect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.remove('theme-light', 'theme-dark');
            if (themeMode !== 'browser') {
                document.body.classList.add(`theme-${themeMode}`);
                localStorage.setItem(THEME_STORAGE_KEY, themeMode);
            } else {
                localStorage.removeItem(THEME_STORAGE_KEY);
            }
        }
    });

    // Derived state for sorting and filtering (Automatically re-evaluates when dependencies change)
    let filteredEnemies = $derived(
        enemies.filter(enemy => {
            // 1. Search Logic
            const query = searchQuery.trim().toLowerCase();
            if (query) {
                const tokens = query.match(/(-?"[^"]+"|[^"\s]+)/g) || [];
                const positiveTerms = tokens.filter(t => !t.startsWith('-')).map(t => t.replace(/"/g, ''));
                const negativeTerms = tokens.filter(t => t.startsWith('-')).map(t => t.slice(1).replace(/"/g, ''));
                
                const text = enemy.searchText;
                if (!positiveTerms.every(term => text.includes(term))) return false;
                if (!negativeTerms.every(term => !text.includes(term))) return false;
            }
            // 2. ID & Name Logic
            const id = Number(enemy.id) || 0;
            if (minId !== null && id < minId) return false;
            if (maxId !== null && id > maxId) return false;
            if (hideNoName && (!enemy.name || enemy.name.trim() === '')) return false;

            return true;
        }).sort((a, b) => {
            // 3. Sorting Logic
            const aVal = a[sortKey] ?? '';
            const bVal = b[sortKey] ?? '';
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return sortDir === 'asc'
                ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
                : String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
        })
    );

    // Update status message when data or filtering changes
    $effect(() => {
        if (!isError && enemies.length > 0) {
            statusMessage = `Showing ${filteredEnemies.length} of ${enemies.length} enemies (ID ${minId || 0}-${maxId || '∞'}${hideNoName ? ', hiding blank names' : ''}${hideNotes ? ', hiding notes' : ''}${hideMag ? ', hiding MAT/MDF' : ''}).`;
        }
    });

    onMount(() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'browser') {
            themeMode = storedTheme;
        }
        loadEnemies();
    });
</script>

<svelte:window 
    ondragover={(e) => { e.preventDefault(); dragActive = true; }} 
    ondragleave={(e) => { e.preventDefault(); if (!e.relatedTarget || (e.relatedTarget as Element).nodeName === 'HTML') dragActive = false; }} 
    ondrop={handleDrop} 
/>

<div class:drag-active-global={dragActive}>
    <header>
        <div class="header-top">
            <div>
                <h1>Enemy Stats Viewer</h1>
                <p>Drag and drop a JSON file, or loads <code>data/Enemies.json</code> as fallback.</p>
            </div>
            <div class="theme-control">
                <label>Theme:
                    <select bind:value={themeMode}>
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
                    <input id="search" type="search" placeholder="Search enemies" bind:value={searchQuery}/>
                </div>
                <small class="search-description">Use <code>-term</code> to exclude matching enemies.</small>
                <hr />
            </div>
            <label>Sort by:
                <select bind:value={sortKey}>
                    <option value="id">ID</option>
                    <option value="name">Name</option>
                    <option value="hp">HP</option>
                    <option value="mp">MP</option>
                    <option value="atk">ATK</option>
                    <option value="def">DEF</option>
                    <option value="mat">MAT</option>
                    <option value="mdf">MDF</option>
                    <option value="agi">AGI</option>
                    <option value="luk">LUK</option>
                    <option value="exp">EXP</option>
                    <option value="gold">Gold</option>
                </select>
            </label>
            <label>ID min: <input type="number" min="0" bind:value={minId} /></label>
            <label>ID max: <input type="number" min="0" bind:value={maxId} /></label>
            <label>Hide blank names: <input type="checkbox" bind:checked={hideNoName} /></label>
            <label>Hide notes: <input type="checkbox" bind:checked={hideNotes} /></label>
            <label>Hide MAT/MDF: <input type="checkbox" bind:checked={hideMag} /></label>
            <label>Direction:
                <select bind:value={sortDir}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </label>
            <label>Row mode:
                <select bind:value={rowMode}>
                    <option value="singleline">Single line</option>
                    <option value="multiline">Multiline</option>
                </select>
            </label>
        </div>
    </header>

    <section class="content">
        <div class="status" class:error={isError}>{statusMessage}</div>
        <div class="table-wrap">
            <table class:hide-mag={hideMag} class:single-line={rowMode === 'singleline'} class:hide-notes={hideNotes}>
                <thead>
                    <tr>
                        <th class="long-stat">ID</th>
                        <th class="name">Name</th>
                        <th class="long-stat">HP</th>
                        <th class="long-stat">MP</th>
                        <th class="short-stat">ATK</th>
                        <th class="short-stat">DEF</th>
                        <th class="short-stat param-mag">MAT</th>
                        <th class="short-stat param-mag">MDF</th>
                        <th class="short-stat">AGI</th>
                        <th class="short-stat">LUK</th>
                        <th class="long-stat">EXP</th>
                        <th class="long-stat">Gold</th>
                        <th class="drop-stat">Item Drops</th>
                        <th class="trait-stat">Traits</th>
                        <th class="note-stat">Note</th>
                    </tr>
                </thead>
                <tbody>
                    {#if filteredEnemies.length === 0}
                        <tr><td colspan="15">No matching enemies found.</td></tr>
                    {:else}
                        {#each filteredEnemies as enemy (enemy.id)}
                            <tr>
                                <td>{enemy.id}</td>
                                <td>{enemy.name}</td>
                                <td>{enemy.hp}</td>
                                <td>{enemy.mp}</td>
                                <td>{enemy.atk}</td>
                                <td>{enemy.def}</td>
                                <td class="param-mag">{enemy.mat}</td>
                                <td class="param-mag">{enemy.mdf}</td>
                                <td>{enemy.agi}</td>
                                <td>{enemy.luk}</td>
                                <td>{enemy.exp}</td>
                                <td>{enemy.gold}</td>
                                <td class="drop-item-cell cell">
                                    {#if enemy.dropItems.length === 0}
                                        -
                                    {:else}
                                        <ul class="drop-list">
                                            {#each enemy.dropItems as drop (drop)}
                                                <li>{drop}</li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </td>
                                <td class="trait-cell cell">
                                    {#if enemy.traits.length === 0}
                                        -
                                    {:else}
                                        <ul class="trait-list">
                                            {#each enemy.traits as trait (trait)}
                                                <li>{trait}</li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </td>
                                <td class="note-cell">
                                    {#if !enemy.note}
                                        -
                                    {:else if rowMode === 'singleline'}
                                        {enemy.note.replace(/\s+/g, ' ')}
                                    {:else}
                                        {@html enemy.note.replace(/\n/g, '<br>')}
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
        
        <div class="drop-zone" class:drag-active={dragActive}>
            <p>📥 Drop JSON file here</p>
            <button type="button" onclick={() => fileInput?.click()}>Select JSON file</button>
            <input bind:this={fileInput} type="file" accept=".json,application/json" hidden onchange={handleFileInputChange} />
        </div>
    </section>
</div>