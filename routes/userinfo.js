const express = require("express");
const router = express.Router();
const services = require("../services/userinfo");

router.get("/userInfo", services.queryUserInfo);
router.put("/userInfo", services.updateUserInfo);
router.post("/sign", services.sign);

module.exports = router;
