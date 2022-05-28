let router = require("express").Router();
let mongoose = require("mongoose");
let NFT = mongoose.model("NFT");
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

  if (isValid(req.query.filter)) {
    filtersJSON = JSON.parse(req.query.filter);
    if (isValid(filtersJSON.address)) {
      filters.address = { $regex: filtersJSON.address, $options: "i" };
    }
    if (isValid(filtersJSON.tokenUri)) {
      filters.tokenUri = { $regex: filtersJSON.tokenUri, $options: "i" };
    }
    if (isValid(filtersJSON.tokenId)) {
      filters.tokenId = { $regex: filtersJSON.tokenId, $options: "i" };
    }
    if (isValid(filtersJSON.noOfGems)) {
      filters.noOfGems = filtersJSON.noOfGems;
    }
  }
  let sortFilter = {};
  if (isValid(req.query.sort)) {
    let sorting = JSON.parse(req.query.sort);
    sortFilter[sorting[0]] = sorting[1] == "ASC" ? 1 : -1;
    console.log(sortFilter);
  }
  // console.log(options);
  NFT.find(filters)
    .sort(sortFilter)
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await NFT.find({}).count();
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
    NFT.findById({ _id: convertRawIDToMongoDBId(req.params.id) })
      .then((nft) => {
        res.json(rename_IdToId(nft));
      })
      .catch((err) => {
        console.log("here");
      });
  } else {
    return res.status(400).send({ error: "NFT id not provided." });
  }
});

router.put("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid NFT id." }));
  }

  const dataToUpdate = {};
  if (req.body.address) {
    dataToUpdate.address = req.body.address;
  }
  if (req.body.tokenId) {
    dataToUpdate.tokenId = req.body.tokenId;
  }
  if (req.body.tokenUri) {
    dataToUpdate.tokenUri = req.body.tokenUri;
  }
  if (req.body.noOfGems) {
    dataToUpdate.noOfGems = req.body.noOfGems;
  }

  NFT.findOneAndUpdate({ _id: req.params.id }, dataToUpdate)
    .then((success) => {
      console.log("here");
      res.json(rename_IdToId(success));
    })
    .catch((error) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

router.post("/", (req, res, next) => {
  try {
    console.log("body", req.body);
    const { address, tokenId, tokenUri, noOfGems } = req.body;
    const nft = new NFT({ address, tokenId, tokenUri, noOfGems });
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
    next(new BadRequestResponse({ message: "Please provide valid NFT id." }));
  }
  NFT.findByIdAndRemove({ _id: req.params.id })
    .then((result) => {
      next(new OkResponse({ message: "NFT deleted successfully" }));
    })
    .catch((err) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

module.exports = router;
