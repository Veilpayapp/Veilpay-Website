import { jsonError, type ApiReq, type ApiRes } from './_utils.js';

/**
 * Catch-all handler for unhandled /api/* routes on Vercel.
 * Returns structured JSON 404 error responses so agents and API consumers
 * always receive machine-readable JSON rather than generic HTML error pages.
 */
export default async function handler(_req: ApiReq, res: ApiRes) {
  return jsonError(
    res,
    404,
    'NOT_FOUND',
    'The requested API endpoint was not found.',
    'Refer to the OpenAPI specification at /openapi.json or /api/openapi.yaml for available endpoints.'
  );
}
