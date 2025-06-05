const express = require("express");
const router = express.Router();
const { register, login,getAllUsers,
  getUserById,
  updateUser,
  deleteUser } = require('../Controllers/UserController');
const auth = require("../Middleware/auth");

router.post("/user/register", register);
router.post("/user/login", login);
router.get("/user/", auth, getAllUsers);
router.get("/employeeget/:id", auth, getUserById);
router.put("/employeeget/:id", auth, updateUser);
router.delete("/employeedelete/:id", auth, deleteUser);

module.exports = router;