const express = require('express')
const router = express.Router()
const controller = require("../controllers/controller")

router.get("/list",controller.userslist)
router.delete("/delete",controller.delete)
router.post("/register",controller.register)
router.post("/login",controller.login)
router.delete("/logout",controller.logout)
router.put("/changepassword",controller.changePassword)
router.post("/createclient",controller.createClient)
router.get("/getclients/:email",controller.getclients)

module.exports = router