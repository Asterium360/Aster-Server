import express from "express";
import { getAllDiscoveriesForAdmin, getDeletedDiscovery, getDeletedDiscoveries } from "../controllers/asterium.controller.js";

const adminRouter = express.Router();

adminRouter.get("/all", getAllDiscoveriesForAdmin);
adminRouter.get("/deleted", getDeletedDiscoveries);
adminRouter.get("/deleted/:id", getDeletedDiscovery);

export default adminRouter;