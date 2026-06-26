<script lang="ts">
	import type { JsonResource } from '../fetcher.svelte';
    
    interface Item {
        id: number;
        name: string;
    }

	let { 
        title,
        resource,
        hideBlank = true,
		hideReserved = true,
    }: {
        title: string,
        resource: JsonResource<Item>,
		hideBlank: boolean,
        hideReserved: boolean,
    } = $props();

    let filteredData = $derived.by(() => {
		let data = resource.data;
        if (hideBlank) {
            data = data.filter((x) => x.name.length > 0);
        }
		if (hideReserved) {
            data = data.filter((x) => x.name.toUpperCase() != "RESERVED");
        }
		return data;
    })
</script>

<div class="container">
    <div class="list-header">
        <h2>{title}</h2>
        {#if resource.isLoading}
			<p>...</p>
		{:else if resource.error}
			<p class="error">!</p>
		{:else}
			<p>{filteredData.length}</p>
		{/if}
    </div>
	{#if resource.isLoading}
		<p>Loading list...</p>
	{:else if resource.error}
		<p class="error">Error: {resource.error}</p>
	{:else}
		<ul>
			{#each filteredData as item, index (index)}
				{#if index > 0 && item.id - filteredData[index - 1].id > 1}
					<li class="skipped-divider" aria-hidden="true"></li>
					<li style="display: none" aria-hidden="true"></li>
				{/if}
				<li>
					<div class="id">{item.id}</div>
					<div class="name">{item.name}</div>
				</li>
			{:else}
				<li>No valid items found.</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.container {
		border: 1px solid gray;
		border-radius: 4px;
		background: white;
		padding: 10px;
		box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		width: 14rem;
	}
    .list-header {
        margin: 0;
        padding-bottom: 2px;
        border-bottom: 2px solid lightgray;
        display: flex;
        justify-content: space-between;
    }
	.list-header h2 {
		font-size: 1.25rem;
        margin: 0;
	}
    .list-header p {
		font-size: 0.75rem;
        color: gray;
        margin: 0;
        text-align: end;
        margin-top: auto;
	}
	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
		overflow: scroll;
	}
	li {
		padding: 1px;
		min-width: 10rem;
		display: flex;
		gap: 10px;
		overflow: hidden;
		white-space: nowrap;
	}
	li:nth-child(2n) {
		background-color: rgb(247, 247, 247);
	}
	.id {
		min-width: 2.5rem;
		text-align: right;
		padding-right: 4px;
		border-right: 2px solid lightgray;
	}
	.name {
		min-width: 7rem;
	}
    /* The indicator line where the jump occurred */
    .skipped-divider {
        border-bottom: 2px dashed red;
        height: 0;
        margin: 0;
        padding: 0;
        box-sizing: border-box; 
    }
</style>
