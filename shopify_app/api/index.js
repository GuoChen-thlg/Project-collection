const router = require('koa-router')()

// router
router.get('/index', async (ctx, next) => {
	console.log(ctx.query)
	ctx.body = '<h1>hello</h1>'
})

require('./install')(router)

// Api

module.exports = router
