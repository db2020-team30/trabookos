const express = require('express')
const app = express()
const exphbs = require('express-handlebars');
const controller = require('./controller/book-controller');
const session = require("express-session");
app.use(express.urlencoded({extended: true}))

// app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || "PynOjAuHetAuWawtinAytVunarASdssfdghfgsaSdgGDASDVSHETdasffgdsaDSGFgdsh", // κλειδί για κρυπτογράφηση του cookie
    resave: false, // δεν χρειάζεται να αποθηκεύεται αν δεν αλλάξει
    saveUninitialized: false, // όχι αποθήκευση αν δεν έχει αρχικοποιηθεί
    cookie: {
      maxAge: 2*60*60*1000, //TWO_HOURS χρόνος ζωής του cookie σε ms
      sameSite: true
    }
}));


//Διαδρομές - Routes
const routes = require('./routes/book-routes');
app.use('/', routes);
app.use('/greek-lit', routes);
app.use('/world-lit', routes);
app.use('/children', routes);
app.use('/science', routes);
app.use('/admin', routes);


app.use(/.+\/images/, (req,res) =>{
    res.redirect('/images' + req.url);
})

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}))

app.engine('hbs', exphbs({
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

module.exports = app;