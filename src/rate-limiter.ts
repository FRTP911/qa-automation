export interface ExternalApi {
  execute(payload: string): Promise<string>;
}

export type AuditOutcome = 'delivered' | 'failed';

export interface AuditEntry {
  payload: string;
  at: string;
  outcome: AuditOutcome;
}

export interface AuditRepository {
  save(entry: AuditEntry): Promise<void>;
  all(): Promise<AuditEntry[]>;
}

export const RATE_LIMIT = 3;
export const RATE_WINDOW_MS = 10_000;

export class RateLimitedApiService {
  private calls: number[] = [];

  constructor(
    private api: ExternalApi,
    private audit: AuditRepository,
  ) {}

  async call(payload: string): Promise<string> {
    if (payload.trim().length === 0) throw new Error('INVALID_PAYLOAD');

    const now = Date.now();
    this.calls = this.calls.filter((at) => now - at < RATE_WINDOW_MS);

    if (this.calls.length >= RATE_LIMIT) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    this.calls.push(now);

    try {
      const result = await this.api.execute(payload);
      await this.saveAudit(payload, now, 'delivered');
      return result;
    } catch (error) {
      await this.saveAudit(payload, now, 'failed');
      throw error;
    }
  }

  private async saveAudit(
    payload: string,
    at: number,
    outcome: AuditOutcome,
  ): Promise<void> {
    try {
      await this.audit.save({
        payload,
        at: new Date(at).toISOString(),
        outcome,
      });
    } catch {
      throw new Error('AUDIT_UNAVAILABLE');
    }
  }
}
