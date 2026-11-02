import type { ExternalApi } from './rate-limiter';

export class HttpExternalApi implements ExternalApi {
  constructor(private baseUrl: string) {}

  async execute(payload: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload }),
    });

    if (!response.ok) throw new Error('API_UNAVAILABLE');

    const data: unknown = await response.json();
    if (
      typeof data !== 'object' ||
      data === null ||
      typeof (data as { result?: unknown }).result !== 'string'
    ) {
      throw new Error('INVALID_RESPONSE_FORMAT');
    }

    return (data as { result: string }).result;
  }
}
