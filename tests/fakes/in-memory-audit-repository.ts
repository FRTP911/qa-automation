import type { AuditEntry, AuditRepository } from '../../src/rate-limiter';

export class InMemoryAuditRepository implements AuditRepository {
  private items: AuditEntry[] = [];

  async save(entry: AuditEntry): Promise<void> {
    this.items.push(entry);
  }

  async all(): Promise<AuditEntry[]> {
    return [...this.items];
  }
}
