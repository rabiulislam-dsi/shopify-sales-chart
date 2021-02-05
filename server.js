require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const { createReadStream } = require('fs');

dotenv.config();
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');

const Router = require('koa-router');
const {receiveWebhook, registerWebhook} = require('@shopify/koa-shopify-webhooks');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {});

const server = new Koa();
const router = new Router();
server.use(session({ secure: true, sameSite: 'none' }, server));
server.keys = [SHOPIFY_API_SECRET_KEY];

server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products',
      'read_orders',
      'read_draft_orders',
      'read_locations',
      'read_fulfillments',
      'read_assigned_fulfillment_orders'
    ],
      async afterAuth(ctx) {
        const { accessToken } = ctx.session;
        const { shop } = ctx.state.shopify;
        // ctx.redirect('/');
        // const urlParams = new URLSearchParams(ctx.request.url);
        // const shop = urlParams.get('shop');
        // ctx.redirect(`/?shop=${shop}`);
        await registerWebhook({
          address: `${process.env.HOST}/webhooks/products/create`,
          topic: 'PRODUCTS_CREATE',
          accessToken,
          shop,
          apiVersion: ApiVersion.October19
        });

        await registerWebhook({
          address: `${process.env.HOST}/webhooks/customer_redact`,
          topic: 'CUSTOMERS_REDACT',
          accessToken,
          shop,
          apiVersion: ApiVersion.October20
        });

        await registerWebhook({
          address: `${process.env.HOST}/webhooks/shop_redact`,
          topic: 'SHOP_REDACT',
          accessToken,
          shop,
          apiVersion: ApiVersion.October20
        });

        await registerWebhook({
          address: `${process.env.HOST}/webhooks/customer_data_request`,
          topic: 'CUSTOMER_DATA_REQUEST',
          accessToken,
          shop,
          apiVersion: ApiVersion.October20
        });
        // Access token and shop available in ctx.state.shopify
        

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}`);
      },
    }),
  );

const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

//health check route
router.get('/test',(ctx) => {
  ctx.status = 200;
  ctx.body = 'OK';
});
//privacy policy route
router.get('/privacy',(ctx) => {
  ctx.status = 200;
  ctx.type = 'html';
  ctx.body = createReadStream('privacypolicy.html');
});
//keeping this hook endpoint for testing
router.post('/webhooks/products/create', webhook, (ctx) => {
  console.log('received webhook: ', ctx.state.webhook);
});
//these 3 are the mandatory GDPR endpoints
router.post('/webhooks/customer_redact', webhook, (ctx) => {
  ctx.status = 200;
  ctx.body = 'Success';
});
router.post('/webhooks/customer_data_request', webhook, (ctx) => {
  console.log('received webhook: ', ctx.state.webhook);
  ctx.status = 200;
  ctx.body = 'This app doesnt store/persist customer data. Nothing to show.';
});
router.post('/webhooks/shop_redact', webhook, (ctx) => {
  ctx.status = 200;
  ctx.body = 'Success';
});

server.use(graphQLProxy({version: ApiVersion.October20}));
router.get('(.*)', verifyRequest(), async (ctx) => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
  ctx.res.statusCode = 200;
});
server.use(router.allowedMethods());
server.use(router.routes());

server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
});