const crypto = require('crypto')
const koaRequest = require('koa2-request')
module.exports = function (router) {
	router.get('/install', async (ctx, next) => {
		let shop = ctx.query.shop || ctx.cookies.get('_shopify_shop') // 用户商店的名称
		let api_key = process.env.CLIENT_ID // 应用程序的API密钥
		let scopes = 'write_orders,read_customers' // 以逗号分隔的范围列表
		let redirect_uri = `${process.env.DOMAIN_NAME}/auth/callback` // 授权客户端后，用户将重定向到的URL
		let nonce = Math.random() // 您的应用提供的随机选择的值
		let access_mode = process.env.ACCESS_MODE || 'per-user' //
		ctx.status = 301
		ctx.cookies.set('nonce', nonce, {
			httpOnly: true,
		})
		if (ctx.query.session) {
			ctx.body = `<script type='text/javascript'>location.href="${process.env.DOMAIN_NAME}/index";</script>`
		} else {
			ctx.cookies.set('_shopify_shop', shop, {
				maxAge: 10e3 * 30 * 60 * 24,
				httpOnly: true,
			})
			ctx.body = `<script type='text/javascript'>location.href="https://${shop}/admin/oauth/authorize?client_id=${api_key}&scope=${scopes}&redirect_uri=${redirect_uri}&state=${nonce}&grant_options[]=${access_mode}";</script>`
		}
	})

	router.get('/auth/callback', async (ctx, next) => {
		let hostname = ctx.query.shop
		let nonce = ctx.query.state
		let code = ctx.query.code
		// let hmac = ctx.query.hmac
		// let querystring = ctx.request.querystring.replace(`&hmac=${hmac}`, '')
		// const HMAC = crypto.createHmac('sha256', 'hush')
		// HMAC.update(querystring)
		// let nowHmac = HMAC.digest('hex')
		if (
			nonce === ctx.cookies.get('nonce') &&
			/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com[\/]?/.test(hostname)
		) {
			let res = await koaRequest({
				url: `https://${hostname}/admin/oauth/access_token`,
				method: 'POST',
				qs: {
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					code,
				},
			})
			console.log(res.body);
			ctx.body = `<h1>认证</h1>`// ${JSON.parse(res.body).access_token}
		} else {
			ctx.body = '<h1>错误请求</h1>'
		}

		console.log(ctx.query)
		console.log(nonce)
		console.log(ctx.cookies.get('nonce'))
	})
}
