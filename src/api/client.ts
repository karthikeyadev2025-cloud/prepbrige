import { z } from 'zod';

/**
 * Typed wrapper around fetch with Zod response validation.
 *
 * Usage:
 * const response = await apiClient('/api/users', {
 *   method: 'GET',
 *   schema: userSchema,
 * });
 */
export interface ApiClientOptions<T> extends RequestInit {
  /** Zod schema to validate the JSON response */
  schema: z.ZodSchema<T>;
  /** Optional Zod schema to validate the request body (if provided) */
  requestSchema?: z.ZodSchema<any>;
  /** Optional signal to abort request */
  abortSignal?: AbortSignal;
}

export async function apiClient<T>(
  endpoint: string,
  { schema, abortSignal, ...init }: ApiClientOptions<T>
): Promise<T> {
  const response = await fetch(endpoint, { signal: abortSignal, ...init });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }
  const json = await response.json();
  const parseResult = schema.safeParse(json);
  if (!parseResult.success) {
    console.error('Schema validation error', parseResult.error);
    throw new Error('Invalid API response format');
  }
  return parseResult.data;
}
