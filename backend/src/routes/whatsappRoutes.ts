import express from "express";
import isAuth from "../middleware/isAuth";

import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

whatsappRoutes.post("/closedimported/:whatsappId", isAuth, WhatsAppController.closedTickets);

whatsappRoutes.post("/whatsapp/:id/media-upload", isAuth, upload.array("file"), WhatsAppController.mediaUpload);

whatsappRoutes.delete("/whatsapp/:id/media-upload", isAuth, WhatsAppController.deleteMedia);

whatsappRoutes.delete("/whatsapp/:whatsappId", isAuth, WhatsAppController.remove);


export default whatsappRoutes;
