const express = require('express')
const router = express.Router()
const controller = require("../controllers/controller")

router.get("/list",controller.userslist)
router.delete("/delete",controller.delete)
router.post("/register",controller.register)
router.post("/login",controller.login)
router.get("/user/:id",controller.private)
router.delete("/logout",controller.logout)
router.put("/changepassword",controller.changePassword)

module.exports = router