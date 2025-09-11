const express = require("express");
const leadRouter = express.Router();
const { leadController } = require("../../controllers/index");

const { handleToken } = require("../../utils/handleToken");

// Create lead data
leadRouter.post("/", handleToken, leadController.createLeadController);

// Get all leads
leadRouter.get("/", handleToken, leadController.getLeadController);
leadRouter.get("/:empId", handleToken, leadController.getLeadController);

// ---------- FOLLOW-UP ROUTES (more specific) ----------

// Create follow up
leadRouter.post(
  "/followup",
  handleToken,
  leadController.createFollowUpController
);

// Get all follow ups
leadRouter.get("/followup", handleToken, leadController.getFollowUpController);

// Get follow up by lead ID
leadRouter.get(
  "/followup/:leadId",
  handleToken,
  leadController.getFollowUpByLeadIdController
);

// Update follow up
leadRouter.put(
  "/followup/:id",
  handleToken,
  leadController.updateFollowUpController
);

// Delete follow up
leadRouter.delete(
  "/followup/:id",
  handleToken,
  leadController.deleteFollowUpController
);

// ---------- LEAD ROUTES WITH PARAMS (less specific, must go last) ----------

// Get lead by ID
leadRouter.get("/:id", handleToken, leadController.getLeadControllerById);

// Update lead
leadRouter.put("/:id", handleToken, leadController.updateLeadController);

// Delete lead
leadRouter.delete("/:id", handleToken, leadController.deleteLeadController);

module.exports = leadRouter;
