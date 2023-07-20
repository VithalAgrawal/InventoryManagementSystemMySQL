const path = require('path');

const express = require('express');

const session = require('express-session');

const mysqlStore = require('express-mysql-session')(session);

const options = {
  host: 'localhost',
  database: 'pnb',
  user: 'root',
  password: 'abcd123',
}

const sessionStore = new mysqlStore(options);

const budgetRoutes = require('./routes/budget');
const authRoutes = require('./routes/auth');
const pandbAuthRoutes = require('./routes/pandb-auth');
const capexAuthRoutes = require('./routes/capex-auth');
const smallCapexAuthRoutes = require('./routes/small-capex-auth');
const itCapexAuthRoutes = require('./routes/it-capex-auth');

const app = express();
const port = process.env.port || 3080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.use(session({
  secret: 'super-secret@123', //used for securing this session
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
}));



app.use(async function (req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;
  const isAdmin = req.session.isAdmin;


  if (!user || !isAuth) {
    return next();
    //next tells express that this request for which this middleware is being executed here should 
    //be forwarded to the next middleware or route in line, here, demoRoutes
  }


  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;
  res.locals.user = user;
  next();
});

app.use(authRoutes);
app.use(budgetRoutes);

app.use(pandbAuthRoutes);
app.use(capexAuthRoutes);
app.use(smallCapexAuthRoutes);
app.use(itCapexAuthRoutes);


app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}`)
});
