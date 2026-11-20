type VercelCompatHandler = (
  request: Request,
  response?: unknown,
) => Response | undefined | Promise<Response | undefined>;

export async function runVercelCompat(
  handler: VercelCompatHandler,
  request: Request,
): Promise<Response> {
  const response = await handler(request);
  return response instanceof Response
    ? response
    : new Response(null, { status: 204 });
}
