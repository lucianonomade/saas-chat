import { Filterable, Op } from "sequelize";
import Ticket from "../../models/Ticket"
import Whatsapp from "../../models/Whatsapp"
import { getIO } from "../../libs/socket"
import formatBody from "../../helpers/Mustache";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { verifyMessage } from "./wbotMessageListener";
import TicketTraking from "../../models/TicketTraking";
import Company from "../../models/Company";
import { logger } from "../../utils/logger";
import { isNil } from "lodash";
import { sub } from "date-fns";
import Contact from "../../models/Contact";

const closeTicket = async (ticket: any, body: string) => {
  await ticket.update({
    status: "closed",
    lastMessage: body,
    unreadMessages: 0,
    amountUsedBotQueues: 0
  });
};

const handleOpenTickets = async (companyId: number, whatsapp: Whatsapp) => {
  const currentTime = new Date();
  const brazilTimeZoneOffset = -3 * 60; // Fuso horário do Brasil é UTC-3
  const currentTimeBrazil = new Date(currentTime.getTime() + brazilTimeZoneOffset * 60000); // Adiciona o offset ao tempo atual

  let expiresTime = Number(whatsapp.expiresTicket || 0);

  if (!isNil(expiresTime) && expiresTime > 0) {

    let whereCondition: Filterable["where"];

    whereCondition = {
      status: "open",
      companyId,
      whatsappId: whatsapp.id,
      updatedAt: {
        [Op.lt]: +sub(new Date(), {
          minutes: Number(expiresTime)
        })
      },
      imported: null,
      fromMe: true
    }

    const ticketsToClose = await Ticket.findAll({
      where: whereCondition,
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "email", "profilePicUrl"]

        },
      ]
    });


    if (ticketsToClose && ticketsToClose.length > 0) {
      logger.info(`Encontrou ${ticketsToClose.length} atendimentos para encerrar na empresa ${companyId} - na conexão ${whatsapp.name}!`);

      for (const ticket of ticketsToClose) {
        await ticket.reload();
        const ticketTraking = await TicketTraking.findOne({
          where: { ticketId: ticket.id, finishedAt: null }
        });

        let bodyExpiresMessageInactive = "";

        if (!isNil(whatsapp.expiresInactiveMessage) && whatsapp.expiresInactiveMessage !== "") {
          bodyExpiresMessageInactive = formatBody(`\u200e${whatsapp.expiresInactiveMessage}`, ticket.contact);
          const sentMessage = await SendWhatsAppMessage({ body: bodyExpiresMessageInactive, ticket: ticket });
          // await verifyMessage(sentMessage, ticket, ticket.contact);
        }

        // Como o campo sendInactiveMessage foi atualizado, podemos garantir que a mensagem foi enviada
        await closeTicket(ticket, bodyExpiresMessageInactive);

        await ticketTraking.update({
          finishedAt: new Date(),
          closedAt: new Date(),
          whatsappId: ticket.whatsappId,
          userId: ticket.userId,
        });

        getIO().emit(`company-${companyId}-ticket`, {
          action: "delete",
          ticketId: ticket.id
        });
      }
    }
  }
};

export const ClosedAllOpenTickets = async (companyId: number): Promise<void> => {
  try {
    const whatsapps = await Whatsapp.findAll({
      attributes: ["id", "name", "status", "timeSendQueue", "sendIdQueue",
        "expiresInactiveMessage", "expiresTicket",
        "complationMessage"],
      where: {
        expiresTicket: { [Op.gt]: '0' },
        companyId: companyId, // Filtrar pelo companyId fornecido como parâmetro
        status: "CONNECTED"
      }
    });

    // Agora você pode iterar sobre as instâncias de Whatsapp diretamente
    if (whatsapps.length > 0) {
      for (const whatsapp of whatsapps) {
        if (whatsapp.expiresTicket) {
          await handleOpenTickets(companyId, whatsapp);
        }
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  }
};
