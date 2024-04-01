const express = require("express");
const router = express.Router();
const services = require("../services/list");

router.get("/list", services.queryList);
router.post("/list", services.saveList);
router.delete("/list", services.deleteList);

module.exports = router;
