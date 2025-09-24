const express = require("express");
const clientRegistrationRouter = express.Router();
const upload = require("../../utils/multer");

const { clientRegistrationController } = require("../../controllers/index");

const { handleToken } = require("../../utils/handleToken");

clientRegistrationRouter.get(
  "/",
  clientRegistrationController.getAllClientRegistration
);
// upload.single('logo')
clientRegistrationRouter.post(
  "/",
  handleToken,
  upload.single("logo"),
  clientRegistrationController.createClientRegistration
);
// clientLogin

clientRegistrationRouter.post(
  "/login",
  clientRegistrationController.clientLogin
);
// upload.single('logo')
clientRegistrationRouter.put(
  "/:id",
  handleToken,
  upload.single("logo"),
  clientRegistrationController.updateClientRegistration
);
clientRegistrationRouter.delete(
  "/:id",
  handleToken,
  clientRegistrationController.deleteClientRegistration
);
clientRegistrationRouter.get(
  "/:id",
  handleToken,
  clientRegistrationController.getClientRegistrationById
);

module.exports = clientRegistrationRouter;
