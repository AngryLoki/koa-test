const koa = require('koa');
const session = require('koa-session');
const convert = require('koa-convert');
const serve = require('koa-static');
const compress = require('koa-compress');
const error = require('koa-json-error');
const route = require('koa-path-match')();
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');

const app = new koa();

app.keys = ['some secret hurr'];

var CONFIG = {
  key: 'koa:sess',
  maxAge: 86400000,
  overwrite: true,
  httpOnly: true,
  signed: true,
};

app.use(async(ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(helmet())

app.use(convert(session(CONFIG, app)));

app.use(bodyParser());

app.use(error());

app.use(compress({
  filter: content_type => /text/i.test(content_type),
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(convert(serve(__dirname + '/static')));

app.use(route('/')
  .get(async ctx => {
    var n = ctx.session.views || 0;
    ctx.session.views = ++n;
    ctx.body = n + ' views';
  })
)

app.use(route('/api/v1/:id(\\d+)')
  .get(async ctx => {
    ctx.body = 'xxx'
  })
)

app.listen(3000);
