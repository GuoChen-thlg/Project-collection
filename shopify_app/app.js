require('dotenv').config()
const Koa = require('koa')
const app = new Koa()
const router = require('./api/index')
let config = {}
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
	config = require('./config/config.development')
} else if (process.env.NODE_ENV === 'production') {
	config = require('./config/config.production')
}
Object.freeze(config)


app.use(router.routes()) // 启动路由
app.use(router.allowedMethods()) // 当请求出错时处理逻辑
const port = process.env.PORT || 3000

app.listen(port, () => {
	console.log(`http://localhost:${port}`)
})
