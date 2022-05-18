let router = require("express").Router();

router.use("/orders", require("./orders"));
router.use("/users", require("./user"));
router.use("/nfts", require("./nft"));
router.use("/stakings", require("./stakings"));
router.use("/perks", require("./perks"));
router.use("/claims", require("./claims"));
console.log("here");
router.use("/coupon", require("./coupon"));

module.exports = router;
