import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RateLimitedApiService,
  RATE_LIMIT,
  RATE_WINDOW_MS,
} from '../src/rate-limiter';
import type { ExternalApi } from '../src/rate-limiter';
import { InMemoryAuditRepository } from './fakes/in-memory-audit-repository';

const START = new Date('2026-03-15T10:00:00.000Z');

const at = (offsetMs: number): Date =>
  new Date(START.getTime() + offsetMs);

describe('RateLimitedApiService — обмеження частоти', () => {
  let api: ExternalApi;
  let audit: InMemoryAuditRepository;
  let service: RateLimitedApiService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
    api = { execute: vi.fn().mockResolvedValue('ok') };
    audit = new InMemoryAuditRepository();
    service = new RateLimitedApiService(api, audit);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('дозволяє три виклики у межах вікна', async () => {
    await expect(service.call('a')).resolves.toBe('ok');
    await expect(service.call('b')).resolves.toBe('ok');
    await expect(service.call('c')).resolves.toBe('ok');

    expect(api.execute).toHaveBeenCalledTimes(RATE_LIMIT);
  });

  it('відхиляє четвертий виклик і не звертається до API', async () => {
    await service.call('a');
    await service.call('b');
    await service.call('c');

    await expect(service.call('d')).rejects.toThrow('RATE_LIMIT_EXCEEDED');
    expect(api.execute).toHaveBeenCalledTimes(RATE_LIMIT);
  });

  it('на межі 9 999 мс ліміт ще діє', async () => {
    await service.call('a');
    await service.call('b');
    await service.call('c');

    vi.setSystemTime(at(RATE_WINDOW_MS - 1));

    await expect(service.call('d')).rejects.toThrow('RATE_LIMIT_EXCEEDED');
    expect(api.execute).toHaveBeenCalledTimes(RATE_LIMIT);
  });

  it('на межі 10 000 мс вікно відкривається знову', async () => {
    await service.call('a');
    await service.call('b');
    await service.call('c');

    vi.setSystemTime(at(RATE_WINDOW_MS));

    await expect(service.call('d')).resolves.toBe('ok');
    expect(api.execute).toHaveBeenCalledTimes(RATE_LIMIT + 1);
  });

  it('не викликає API для порожнього payload', async () => {
    await expect(service.call('   ')).rejects.toThrow('INVALID_PAYLOAD');

    expect(api.execute).not.toHaveBeenCalled();
    await expect(audit.all()).resolves.toEqual([]);
  });

  it('зберігає доставлені виклики у журналі', async () => {
    await service.call('first');
    await service.call('second');

    const entries = await audit.all();
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      payload: 'first',
      at: '2026-03-15T10:00:00.000Z',
      outcome: 'delivered',
    });
    expect(entries[1]?.outcome).toBe('delivered');
  });
});

describe('RateLimitedApiService — відмови залежностей', () => {
  let api: ExternalApi;
  let audit: InMemoryAuditRepository;
  let service: RateLimitedApiService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
    api = { execute: vi.fn().mockResolvedValue('ok') };
    audit = new InMemoryAuditRepository();
    service = new RateLimitedApiService(api, audit);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('передає помилку API та фіксує невдалу спробу', async () => {
    api.execute = vi.fn().mockRejectedValue(new Error('API_UNAVAILABLE'));

    await expect(service.call('request')).rejects.toThrow('API_UNAVAILABLE');

    await expect(audit.all()).resolves.toEqual([
      {
        payload: 'request',
        at: '2026-03-15T10:00:00.000Z',
        outcome: 'failed',
      },
    ]);
  });

  it('повідомляє про недоступність журналу', async () => {
    audit.save = vi.fn().mockRejectedValue(new Error('DISK_FULL'));

    await expect(service.call('request')).rejects.toThrow('AUDIT_UNAVAILABLE');

    expect(api.execute).toHaveBeenCalledTimes(1);
  });
});
