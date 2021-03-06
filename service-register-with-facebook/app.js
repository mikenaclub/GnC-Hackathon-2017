var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var axios = require('axios');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;


passport.use(new Strategy({
        clientID: '128532184445160',
        clientSecret: 'd36d0221f55e198b49c0c076eb764072',
        callbackURL: 'http://localhost:8095/login/facebook/'
    },
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});
var cors = require('cors');
var app = express();
var corsOptions = {
    origin: 'http://localhost:3000'
}
app.use(cors(corsOptions))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/login/fail', function (req, res, next) {
    res.render('failLogin');
});

app.get('/login/facebook',
    passport.authenticate('facebook', {failureRedirect: '/login/fail'}),
    function (req, res) {
        axios.post('http://registermanage:8099/findUser', {
            userdetail: req.user
        })
            .then(function (response) {
                res.redirect('http://localhost:3000/testreturn/' + response.data._id)
                console.log(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    });


app.post('/LoginByFacebook', function (req, res, next) {
    console.log(req.body.uuid)
    res.send("login OK")
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
