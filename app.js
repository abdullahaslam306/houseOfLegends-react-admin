let express = require("express");

require("dotenv").config();

// Create global app object
let app = express();
require("./server/app-config")(app);
//comment

//remove
// finally, let's start our server...
let server = app.listen(process.env.PORT || 5000, function () {
  console.log("Listening on port " + server.address().port);
});
