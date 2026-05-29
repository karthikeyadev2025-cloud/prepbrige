import { describe, it, expect, vi } from 'vitest';
import { apiClient } from '../api/client';
import { z } from 'zod';

// Mock fetch
globalThis.fetch = vi.fn();

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

describe('apiClient', () => {
  it('should return parsed data on successful response', async () => {
    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Alice' }),
    });
    const data = await apiClient('/users/1', { schema: userSchema });
    expect(data).toEqual({ id: '1', name: 'Alice' });
  });

  it('should throw on validation error', async () => {
    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'Bob' }), // id wrong type
    });
    await expect(apiClient('/users/2', { schema: userSchema })).rejects.toThrow();
  });

  it('should throw on network error', async () => {
    // @ts-ignore
    fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(apiClient('/users/3', { schema: userSchema })).rejects.toThrow();
  });
});
