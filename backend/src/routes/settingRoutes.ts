import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SettingController from "../controllers/SettingController";

const settingRoutes = Router();

settingRoutes.get("/settings", isAuth, SettingController.index);

settingRoutes.get("/public-settings/:settingKey", isAuth, SettingController.publicShow);

// routes.get("/settings/:settingKey", isAuth, SettingsController.show);

// change setting key to key in future
settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);

export default settingRoutes;
