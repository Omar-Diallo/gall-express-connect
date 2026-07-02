import server from '../dist/server/server.js';

export default async function handler(request, _context) {
  const url = new URL(request.url);
  const init = {
    method: request.method,
    headers: request.headers,
    body: request.body,
  };

  const requestToServer = new Request(url, init);
  const response = await server.fetch(requestToServer, {}, _context);

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
