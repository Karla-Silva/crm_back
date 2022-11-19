const express = require('express')
const router = express.Router()
const controller = require("../controllers/controller")

router.get("/list",controller.userslist)
router.delete("/delete/:id",controller.delete)
router.put("/update/:id",controller.update)
router.post("/register",controller.register)
router.post("/login",controller.login)
router.get("/user/:id",controller.private)

module.exports = router