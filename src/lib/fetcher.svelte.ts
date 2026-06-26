

export interface MinimalItem {
	id: number;
	name: string;
}

export class JsonResource {
	// Reactive states
	data = $state<MinimalItem[]>([]);
	isLoading = $state(true);
	error = $state<string | null>(null);

	constructor(url: string) {
		this.fetchData(url);
	}

	private async fetchData(url: string) {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const rawData = await response.json();

			if (Array.isArray(rawData)) {
				// Clean data: Filter out nulls and verify id/name properties exist
				this.data = rawData.filter(
					(item): item is MinimalItem =>
						item !== null && typeof item === 'object' && 'id' in item && 'name' in item
				);
			}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			this.error = err.message || 'Something went wrong';
		} finally {
			this.isLoading = false;
		}
	}
}
