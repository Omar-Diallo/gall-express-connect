import server from '../dist/server/server.js';

async function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function makeUrl(request) {
  const host = request.headers.host || 'localhost';
  return new URL(request.url, `https://${host}`);
}

export default async function handler(request, response) {
  const url = makeUrl(request);
  const body = request.method !== 'GET' && request.method !== 'HEAD' ? await readRequestBody(request) : undefined;

  const requestToServer = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body,
  });
  const serverResponse = await server.fetch(requestToServer, {}, {});

  response.statusCode = serverResponse.status;
  for (const [name, value] of serverResponse.headers) {
    if (name.toLowerCase() === 'transfer-encoding') continue;
    response.setHeader(name, value);
  }

  const arrayBuffer = await serverResponse.arrayBuffer();
  response.end(Buffer.from(arrayBuffer));
}
