let http = require("http"),
  path = require("path"),
  express = require("express"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  cors = require("cors"),
  errorhandler = require("errorhandler"),
  mongoose = require("mongoose"),
  secret = require("./config").secret,
  MONGODB_URI = require("./config").MONGODB_URI,
  httpResponse = require("express-http-response");
let isProduction = process.env.NODE_ENV === "production";
module.exports = (app) => {
  var allowedOrigins = [
    "http://localhost:4200",
    "http://localhost:4300",
    "http://localhost:3000"
  ];
  var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowedOrigins.indexOf(req.header("Origin")) !== -1) {
      corsOptions = { credentials: true, origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { credentials: true, origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  };
  app.use(cors(corsOptionsDelegate));

  // Normal express config defaults
  app.use(require("morgan")("dev"));
  app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
  app.use(bodyParser.json({ limit: "500mb" }));
  // Get the user's locale, and set a default in case there's none

  // app.use((req, res, next) => {
  //   res.append("Content-Range", "nfts 0-10/10");
  //   next();
  // });
  app.use(require("method-override")());
  app.use(express.static(path.join(__dirname, "/public")));

  app.use(
    session({
      secret: secret,
      cookie: { maxAge: 60000 },
      resave: false,
      saveUninitialized: false
    })
  );

  if (!isProduction) {
    app.use(errorhandler());
  }

  if (isProduction) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
  } else {
    mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    mongoose.set("debug", true);
  }

  require("./models/User");
  require("./models/Perk");
  require("./models/Category");
  require("./models/PerkCategory");
  require("./models/Staking");
  require("./models/NFT");
  require("./models/Config");
  require("./models/Order");
  require("./models/OrderAsset");
  require("./models/Coupon");
  require("./models/Claim");

  app.use(require("./routes"));

  app.use("/", express.static(path.join(__dirname, "../dist")));
  app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
  if (isProduction) {
    app.use("/", express.static(path.join(__dirname, "../dist")));
    app.use((req, res, next) => {
      res.sendFile(path.join(__dirname, "../dist", "index.html"));
    });
  }

  //  catch 404 and forward to error handler
  app.use(function (req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
  });
  app.use(httpResponse.Middleware);

  /// error handlers

  // development error handler
  // will print stacktrace
  if (!isProduction) {
    app.use(function (err, req, res, next) {
      console.log(err.stack);

      res.status(err.status || 500);

      res.json({
        errors: {
          message: err.message,
          error: err
        }
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: {}
      }
    });
  });
};
