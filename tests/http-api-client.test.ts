import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, EXECUTE_URL, API_BASE_URL } from './msw/server';
import { HttpExternalApi } from '../src/http-api-client';

const api = new HttpExternalApi(API_BASE_URL);

describe('HttpExternalApi', () => {
  it('повертає результат з успішної відповіді', async () => {
    await expect(api.execute('hello')).resolves.toBe('ok');
  });

  it('відхиляє відповідь зі статусом 503', async () => {
    server.use(
      http.post(EXECUTE_URL, () => new HttpResponse(null, { status: 503 })),
    );

    await expect(api.execute('hello')).rejects.toThrow('API_UNAVAILABLE');
  });

  it('відхиляє результат неправильного типу', async () => {
    server.use(
      http.post(EXECUTE_URL, () => HttpResponse.json({ result: 42 })),
    );

    await expect(api.execute('hello')).rejects.toThrow(
      'INVALID_RESPONSE_FORMAT',
    );
  });

  it('відхиляє порожню відповідь', async () => {
    server.use(http.post(EXECUTE_URL, () => HttpResponse.json(null)));

    await expect(api.execute('hello')).rejects.toThrow(
      'INVALID_RESPONSE_FORMAT',
    );
  });

  it('передає payload у тілі запиту', async () => {
    let body: unknown;
    server.use(
      http.post(EXECUTE_URL, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ result: 'ok' });
      }),
    );

    await api.execute('hello');

    expect(body).toEqual({ payload: 'hello' });
  });

  it('опрацьовує мережеву помилку', async () => {
    server.use(http.post(EXECUTE_URL, () => HttpResponse.error()));

    await expect(api.execute('hello')).rejects.toThrow();
  });
});
