import express from "express";
import * as PasswordResetController from "../controllers/PasswordResetController";
import isAuth from "../middleware/isAuth";

const passwordRoutes = express.Router();

// Rota para envio de e-mails
passwordRoutes.post("/api/enviar-email", PasswordResetController.sendCodeVerifycation);

passwordRoutes.get("/api/verificar-code/:email", PasswordResetController.getVerificationData);
// Exporte as rotas

// Rota para obter todos os usuários
passwordRoutes.get("/api/obter-usuarios", PasswordResetController.getAllUsers);

// Rota para atualizar a senha
passwordRoutes.put("/api/atualizar-senha", PasswordResetController.updatePassword);

export default passwordRoutes;
