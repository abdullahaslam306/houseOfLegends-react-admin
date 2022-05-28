let router = require("express").Router();
let mongoose = require("mongoose");
let Staking = mongoose.model("Staking");
let httpResponse = require("express-http-response");
let OkResponse = httpResponse.OkResponse;
let BadRequestResponse = httpResponse.BadRequestResponse;

const {
  convertRawIDToMongoDBId,
  rename_IdToId,
  isValid
} = require("../../utilities/utils");

router.get("/", (req, res, next) => {
  let filtersJSON = {},
    filters = {};
  let range = JSON.parse(req.query.range);
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };
  if (options.limit === 1000) {
    options.limit = 15000;
  }
  if (isValid(req.query.filter)) {
    filtersJSON = JSON.parse(req.query.filter);
    if (isValid(filtersJSON.asset)) {
      filters.asset = filtersJSON.asset;
    }
    if (isValid(filtersJSON.startDate)) {
      filters.startDate = { $gte: filtersJSON.startDate };
    }
    if (isValid(filtersJSON.endDate)) {
      filters.endDate = { $lte: filtersJSON.endDate };
    }
  }
  let sortFilter = {};
  if (isValid(req.query.sort)) {
    let sorting = JSON.parse(req.query.sort);
    sortFilter[sorting[0]] = sorting[1] == "ASC" ? 1 : -1;
    console.log(sortFilter);
  }
  Staking.find(filters)
    .sort(sortFilter)
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await Staking.find({}).count();
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
    Staking.findById(req.params.id)
      .then((perk) => {
        res.status(200).send(rename_IdToId(perk));
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    return res.status(400).send({ error: "Staking id not provided." });
  }
});

router.put("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid id." }));
  }

  const dataToUpdate = {};
  if (req.body.asset) {
    dataToUpdate.asset = req.body.asset;
  }
  if (req.body.startDate) {
    dataToUpdate.startDate = req.body.startDate;
  }
  if (req.body.endDate) {
    dataToUpdate.endDate = req.body.endDate;
  }
  if (req.body.gems) {
    dataToUpdate.gems = req.body.gems;
  }
  if (req.body.type) {
    dataToUpdate.type = req.body.type;
  }

  Staking.findOneAndUpdate({ _id: req.params.id }, dataToUpdate)
    .then((success) => {
      res.status(200).send(rename_IdToId(success));
    })
    .catch((error) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

router.post("/", (req, res, next) => {
  try {
    console.log("body", req.body);
    const { asset, startDate, endDate, gems, type } = req.body;
    const stake = new Staking({ asset, startDate, endDate, gems, type });
    stake
      .save()
      .then((success) => {
        res.json(success);
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
    next(
      new BadRequestResponse({ message: "Please provide valid Staking id." })
    );
  }
  Staking.findByIdAndRemove({ _id: req.params.id })
    .then((result) => {
      next(new OkResponse({ message: "Nft Stake deleted successfully" }));
    })
    .catch((err) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

module.exports = router;
