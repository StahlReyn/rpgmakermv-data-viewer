export class JsonResource<T> {
  // Reactive states typed to the generic type array
  data = $state<T[]>([]);
  isLoading = $state(true);
  error = $state<string | null>(null);

  // The constructor accepts the URL and an optional cleaning/transform function
  constructor(
    url: string, 
    private transform?: (rawData: object[]) => T[]
  ) {
    this.fetchData(url);
  }

  private async fetchData(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const rawData = await response.json();
      
      if (Array.isArray(rawData)) {
        // Clean data: Filter out nulls first
        const cleanRaw = rawData.filter(item => item !== null && typeof item === 'object');
        
        // If a custom transform is provided, use it. Otherwise, cast directly.
        this.data = this.transform ? this.transform(cleanRaw) : (cleanRaw as T[]);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.error = err.message || 'Something went wrong';
    } finally {
      this.isLoading = false;
    }
  }
}
