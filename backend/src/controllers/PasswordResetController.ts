import * as nodemailer from 'nodemailer';
import * as randomstring from 'randomstring';
import { Request, Response } from 'express';
import User from '../models/User';
import GetDefaultWhatsApp from '../helpers/GetDefaultWhatsApp';
import { SendMessage } from '../helpers/SendMessage';
import GetWhatsappWbot from '../helpers/GetWhatsappWbot';
import AppError from '../errors/AppError';

export const updatePassword = async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;

  console.log('Dados recebidos para atualização de senha:', userId, newPassword);

  try {
    const userToUpdate = await User.findByPk(userId);

    if (userToUpdate) {
      userToUpdate.password = newPassword;
      await userToUpdate.save();

      res.status(200).json({ message: 'Senha atualizada com sucesso.' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha.' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  secure: false, // Usar uma conexão não segura
  port: 587, // Porta típica para STARTTLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  debug: true,
  connectionTimeout: 80000,
});

export const verificationCodes: Record<string, { code: string; timestamp: number }> = {};


const generateRandomCode = () => {
  return randomstring.generate({
    length: 6,
    charset: 'numeric',
  });
};

export const sendEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log('Email recebido para envio:', email);
  const verificationCode = generateRandomCode();

  // Armazenar código e timestamp no objeto
  verificationCodes[email] = {
    code: verificationCode,
    timestamp: Date.now(),
  };

  // Agendar a remoção do código após 5 minutos
  setTimeout(() => {
    delete verificationCodes[email];
    console.log(`Código para ${email} removido após 5 minutos.`);
  }, 5 * 60 * 1000); // 5 minutos em milissegundos

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: `${email}`,
    subject: 'Código de Verificação',
    text: `Seu código de verificação é: ${verificationCode}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.response);
    res.status(200).json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
};


export const getVerificationData = (req: Request, res: Response) => {
  const { email } = req.params;

  // Verificar se há dados de verificação para o e-mail fornecido
  if (verificationCodes[email]) {
    res.status(200).json(verificationCodes[email]);
  } else {
    res.status(404).json({ error: 'Nenhum código de verificação encontrado para o e-mail fornecido.' });
  }
};

export const sendCodeVerifycation = async (req: Request, res: Response) => {

  try {
    const { wpp } = req.body;

    const user = await seachUserFromNumber(wpp);


    const verificationCode = generateRandomCode();

    // Armazenar código e timestamp no objeto
    verificationCodes[wpp] = {
      code: verificationCode,
      timestamp: Date.now(),
    };

    // Agendar a remoção do código após 5 minutos
    setTimeout(() => {
      delete verificationCodes[wpp];
      console.log(`Código para ${wpp} removido após 5 minutos.`);
    }, 5 * 60 * 1000); // 5 minutos em milissegundos

    const message = `\u200e Seu código de verificação é: ${verificationCode}`;


    if (!user) {
      res.status(500).json({ error: 'Nenhum usuário encontrado com esse Whatsapp cadastrado.' });
    }

    const whatsapp = await GetDefaultWhatsApp(user?.companyId);

    const wbot = await GetWhatsappWbot(whatsapp);

    await wbot.sendMessage(`${wpp}@s.whatsapp.net`, { text: message });



    res.status(200).json({ message: 'Código enviado com sucesso!', userId: user?.id });
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    res.status(500).json({ error: 'Erro ao enviar código de verificação. ' + error });
  }

};


export const seachUserFromNumber = async (number: string) => {

  try {
    const user = await User.findOne({
      where: {
        wpp: number
      }
    });

    return user;

  } catch (error) {
    return null;
  }

};
