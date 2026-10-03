import { JobSourceAdapter } from "./adapter.interface";
import { MockJobSourceAdapter } from "./mock-adapter";

class JobSourceRegistry {
  private adapters: Map<string, JobSourceAdapter> = new Map();

  constructor() {
    this.register(new MockJobSourceAdapter());
  }

  register(adapter: JobSourceAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(sourceId: string): JobSourceAdapter | undefined {
    return this.adapters.get(sourceId);
  }

  getAllAdapters(): JobSourceAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const sourceRegistry = new JobSourceRegistry();
