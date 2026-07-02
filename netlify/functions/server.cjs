const { Request } = require('node:undici');

exports.handler = async function(event, context) {
  const serverModule = await import('../../dist/server/server.js');
  const server = serverModule.default ?? serverModule;

  const protocol = 'https';
  const host = (event.headers && (event.headers['x-forwarded-host'] || event.headers.host)) || 'localhost';
  const path = event.path || '/';
  const query = event.rawQueryString || (event.queryStringParameters ? Object.entries(event.queryStringParameters).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '');
  const url = new URL(`${protocol}://${host}${path}${query ? '?' + query : ''}`);

  const init = {
    method: event.httpMethod,
    headers: event.headers || {},
    body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
  };

  const request = new Request(url.toString(), init);
  const response = await server.fetch(request, {}, context);

  const resHeaders = {};
  for (const [k, v] of response.headers) resHeaders[k] = v;

  const arrayBuffer = await response.arrayBuffer();
  const bodyBase64 = Buffer.from(arrayBuffer).toString('base64');

  return {
    statusCode: response.status,
    headers: resHeaders,
    body: bodyBase64,
    isBase64Encoded: true,
  };
};
