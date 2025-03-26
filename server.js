const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
var morgan = require('morgan')
var cors = require('cors')
const userRoute = require('./router/user_route');

require('./db/db')();
app.use(cors({ origin: "*", credentials: true }));
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(express.json()); // Middleware to parse JSON req
app.use(`/api`, userRoute);

// app.use(express.static(path.join(__dirname, './dist/project'))); // Serve static files
// app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    return res.json({ message: "Hello world from backend" });
})

app.listen(PORT, () => console.log(`server start at port :${PORT}`))