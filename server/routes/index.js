var router = require("express").Router();

router.use("/api/v1", require("./admin"));

module.exports = router;
