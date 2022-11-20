const express = require('express')
const router = express.Router()
const controller = require("../controllers/controller")

router.get("/list",controller.userslist)
router.delete("/delete/:id",controller.delete)
router.put("/update/:id",controller.update)
router.post("/register",controller.register)
router.post("/login",controller.login)
router.get("/user/:id",controller.private)
router.delete("/logout/:id",controller.logout)
router.put("/changepassword/:id",controller.changePassword) //náo funciona

module.exports = router