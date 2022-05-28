let router = require("express").Router();
let mongoose = require("mongoose");
let Order = mongoose.model("Order");
const {
  convertRawIDToMongoDBId,
  rename_IdToId
} = require("../../utilities/utils");

// helper functions
const isValid = (param) => {
  if (param !== undefined && param !== null) {
    return true;
  }
  return false;
};

router.get("/", (req, res, next) => {
  let filtersJSON = {},
    filters = {};
  console.log(req.query);
  let range = JSON.parse(req.query.range);
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };
  if (isValid(req.query.filter)) {
    filtersJSON = JSON.parse(req.query.filter);
    if (isValid(filtersJSON.name)) {
      filters.name = { $regex: filtersJSON.name, $options: "i" };
    }
    if (isValid(filtersJSON.walletAddress)) {
      filters.walletAddress = {
        $regex: filtersJSON.walletAddress,
        $options: "i"
      };
    }
    if (isValid(filtersJSON.status)) {
      filters.status = {
        $regex: filtersJSON.status,
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
  Order.find(filters)
    .sort(sortFilter)
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await Order.find({}).count();
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
    Order.findById(req.params.id)
      .then((perk) => {
        res.status(200).send(rename_IdToId(perk));
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    return res.status(400).send({ error: "Order id not provided." });
  }
});

router.put("/:id", async (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid order id." }));
  }
  // console.log("Update Request", req.body.supportTeamAssigned);
  const dataToUpdate = {};

  if (req.body.status) {
    dataToUpdate.status = req.body.status;
  }
  if (req.body.supportTeamAssigned != null) {
    dataToUpdate.supportTeamAssigned = req.body.supportTeamAssigned;
  }
  console.log(typeof req.body.supportTeamAssigned);
  Order.findOneAndUpdate({ _id: req.params.id }, dataToUpdate)
    .then((success) => {
      res.status(200).send(rename_IdToId(success));
    })
    .catch((error) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

router.delete("/:id", (req, res, next) => {
  console.log(req.params.id);
  if (req.params.id) {
    Order.findByIdAndRemove({ _id: convertRawIDToMongoDBId(req.params.id) })
      .then((success) => {
        res.status(200).send({ message: "Order Deleted" });
      })
      .catch((error) => {
        console.log(error);
      });
  }
});
module.exports = router;
