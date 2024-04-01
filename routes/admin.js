const express = require("express");
const router = express.Router();
const services = require("../services/admin");

router.get("/admin/route", services.queryRoute);
router.get("/admin/menu", services.queryAllMenu);
router.get("/admin/list", services.queryAdminList);
router.post("/admin/register", services.registerAdmin);
router.post("/admin/user_info", services.updateAdmin);
router.put("/admin/user_info", services.disableAdmin);

module.exports = router;
