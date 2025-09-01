const express = require("express");
const InvoiceRouter = express.Router();
const { InvoiceRegistrationController } = require("../../controllers/index");
const { handleToken } = require("../../utils/handleToken");

InvoiceRouter.get("/", handleToken, InvoiceRegistrationController.getAllInvoice);
InvoiceRouter.post("/", handleToken,  InvoiceRegistrationController.createInvoice);
InvoiceRouter.delete("/:id", handleToken, InvoiceRegistrationController.deleteInvoice);
InvoiceRouter.get("/:id",handleToken, InvoiceRegistrationController.getInvoiceById);
InvoiceRouter.put("/:id",handleToken, InvoiceRegistrationController.updateInvoice);

module.exports = InvoiceRouter;
