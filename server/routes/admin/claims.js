let router = require("express").Router();
let mongoose = require("mongoose");
let Claim = mongoose.model("Claim");
let httpResponse = require("express-http-response");
let BadRequestResponse = httpResponse.BadRequestResponse;
let OkResponse = httpResponse.OkResponse;
const { rename_IdToId, isValid } = require("../../utilities/utils");

router.get("/", (req, res, next) => {
  let range = JSON.parse(req.query.range);
  let filtersJSON = {},
    filters = {};
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };
  if (isValid(req.query.filter)) {
    filtersJSON = JSON.parse(req.query.filter);
    if (isValid(filtersJSON.gems)) {
      filters.gems = filtersJSON.gems;
    }
    if (isValid(filtersJSON.usedGems)) {
      filters.usedGems = filtersJSON.usedGems;
    }
    if (isValid(filtersJSON.walletAddress)) {
      filters.walletAddress = {
        $regex: filtersJSON.walletAddress,
        $options: "i"
      };
    }
  }
  let sortFilter = {};
  if (isValid(req.query.sort)) {
    let sorting = JSON.parse(req.query.sort);
    sortFilter[sorting[0]] = sorting[1] == "ASC" ? 1 : -1;
    console.log(sortFilter);
  }
  Claim.find(filters)
    .sort(sortFilter)
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await Claim.find({}).count();
      const data = (result && result.map(rename_IdToId)) || [];
      res.set({
        "Content-Range": `orders 0-10/${count}`,
        "Access-Control-Expose-Headers": "X-Total-Count",
        "X-Total-Count": count
      });
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:id", (req, res, next) => {
  if (req.params.id) {
    Claim.findById(req.params.id)
      .then((claim) => {
        res.json(rename_IdToId(claim));
      })
      .catch((err) => {
        console.log("here");
      });
  } else {
    return res.status(400).send({ error: "Claim id not provided." });
  }
});

router.put("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid Claim id." }));
  }

  const dataToUpdate = {};
  if (req.body.walletAddress) {
    dataToUpdate.walletAddress = req.body.walletAddress;
  }
  if (isValid(req.body.gems)) {
    dataToUpdate.gems = req.body.gems;
  }
  if (isValid(req.body.usedGems)) {
    dataToUpdate.usedGems = req.body.usedGems;
  }

  Claim.findOneAndUpdate({ _id: req.params.id }, dataToUpdate)
    .then((success) => {
      res.json(rename_IdToId(success));
    })
    .catch((error) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

router.post("/", (req, res, next) => {
  try {
    console.log("body", req.body);
    const { walletAddress, gems, usedGems } = req.body;
    const nft = new Claim({ walletAddress, gems, usedGems });
    nft
      .save()
      .then((success) => {
        res.json(rename_IdToId(nft));
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ error: "Please provide valid information." });
      });
  } catch (e) {
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

router.delete("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid Claim id." }));
  }
  Claim.findByIdAndRemove({ _id: req.params.id })
    .then((result) => {
      next(new OkResponse({ message: "Claim deleted successfully" }));
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

module.exports = router;
