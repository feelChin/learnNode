const express = require("express");
const router = express.Router();
const services = require("../services/base_article");

router.get("/base_article", services.queryList);
router.post("/base_article", services.saveList);
router.get("/base_article/group", services.queryGroupList);
router.post("/base_article/group", services.saveGroupList);
router.get("/base_article/detail", services.queryDetail);
router.delete("/base_article/detail", services.deleteDetail);

module.exports = router;
