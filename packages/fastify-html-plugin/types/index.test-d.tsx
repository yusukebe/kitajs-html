import { Suspense } from '@kitajs/html/suspense';
import fastify from 'fastify';
import { fastifyKitaHtml } from '.';

const app = fastify();

app.register(fastifyKitaHtml);

app.register(fastifyKitaHtml, {
  autoDoctype: true
});

app.get('/', async (_, reply) => {
  reply.html('<div>hello world</div>');
});

app.get('/jsx', async (_, reply) => {
  reply.html(<div>hello world</div>);
});

app.get('/stream', async (_, reply) => {
  reply.html('<div>hello world</div>');
});

app.get('/stream/jsx', async (_, reply) => {
  reply.html(<div>hello world</div>);
});

app.get('/stream/suspense', async (request, reply) => {
  reply.html(
    <Suspense rid={request.id} fallback={<div>fallback</div>}>
      {Promise.resolve(1)}
    </Suspense>
  );
});
