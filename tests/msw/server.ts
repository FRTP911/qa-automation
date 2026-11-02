import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const API_BASE_URL = 'https://api.example.com';
export const RATE_URL = `${API_BASE_URL}/rate`;
export const EXECUTE_URL = `${API_BASE_URL}/execute`;

export const handlers = [
  http.get(RATE_URL, () => HttpResponse.json({ rate: 41.25 })),
  http.post(EXECUTE_URL, () => HttpResponse.json({ result: 'ok' })),
];

export const server = setupServer(...handlers);
