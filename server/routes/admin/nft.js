let router = require("express").Router();
let mongoose = require("mongoose");
let NFT = mongoose.model("NFT");
let httpResponse = require("express-http-response");
let OkResponse = httpResponse.OkResponse;
let ForbiddenResponse = httpResponse.ForbiddenResponse;
let BadRequestResponse = httpResponse.BadRequestResponse;
const {
  convertRawIDToMongoDBId,
  rename_IdToId
} = require("../../utilities/utils");

router.get("/", (req, res, next) => {
  const options = {
    page: +req.query.page || 1,
    limit: +req.query.limit || 10
  };

  NFT.paginate({}, options, async (err, result) => {
    if (err) {
      console.log(err);
      next(new BadRequestResponse({ err: err }));
    } else {
      let count = await NFT.find({}).count();
      const data = (result && result.docs.map(rename_IdToId)) || [];
      res.set({
        "Content-Range": `nfts 0-10/${count}`,
        "Access-Control-Expose-Headers": "X-Total-Count",
        "X-Total-Count": count
      });
      res.json(data);
    }
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
