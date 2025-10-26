const express = require("express");
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", usersController.login);

router.get(
  "/patient/:hhNumber",
  usersController.getPatient
);

router.get(
  "/doctor/:hhNumber",
  authMiddleware,
  usersController.getDoctor
);

router.get(
  "/doctor/:hhNumber/patients",
  authMiddleware,
  usersController.getDoctorPatients
);

router.get(
  "/diagnostic/:hhNumber",
  authMiddleware,
  usersController.getDiagnostic
);

module.exports = router;
