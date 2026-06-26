<script lang="ts">
    import { JsonResource } from '$lib/fetcher.svelte';
    import NameIDList from '$lib/components/NameIDList.svelte';
    import '$lib/global.css'

    const dataList = [
        "Actors",
        "Classes",
        "Skills",
        "Items",
        "Weapons",
        "Armors",
        "Enemies",
        "Troops",
        "States",
        "Animations",
    ]

    let hideBlank = $state(false)
</script>

<div class="main-container">
    <div class="header">
        <h1>Overview</h1>
        <div class="options">
            <label>
                <input type="checkbox" bind:checked={hideBlank}>
                Hide Blank
            </label>
        </div>
    </div>
    <div class="list-container">
        {#each dataList as name (name)}
            <NameIDList 
                title={name} 
                resource={new JsonResource(`/sample_data/${name}.json`)} 
                filterBlank={hideBlank}
            />
        {/each}
    </div>
</div>

<style>
h1 {
    margin: 0;
    font-size: 1.5rem;
    flex-grow: 1;
}
.main-container {
    width: 100vw;
    height: 100vh;
}
.body-pad {
    padding: 30px;
}
.header {
    border-bottom: 2px solid gray;
    background: white;
    padding: 6px 12px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
    display: flex;
}
.options {
    margin-top: auto;
    display: flex;
    align-content: flex-end;
}
.list-container {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    height: max-content;
}
.list-container {
    overflow: scroll;
}
</style>