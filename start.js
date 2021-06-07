const app = require('./app');
const port = process.env.PORT || '3500';

const server = app.listen(port, () => {
	console.log("Listening to port " + port)
});
