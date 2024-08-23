import {
  WASocket,
  BinaryNode,
  Contact as BContact,
  isJidBroadcast,
  isJidStatusBroadcast,
  isJidUser,
} from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";

import fs from "fs";
import path from "path";

// import { getIO } from "../../libs/socket";
import { Store } from "../../libs/store";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface IContact {
  contacts: BContact[];
}

const wbotMonitor = async (wbot: Session, whatsapp: Whatsapp, companyId: number): Promise<void> => {


  try {
    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content[0] as any;

      if (content.tag === "offer") {
        const { from, id } = node.attrs;

      }

      if (content.tag === "terminate") {
        const sendMsgCall = await Setting.findOne({
          where: { key: "call", companyId },
        });

        if (sendMsgCall.value === "disabled") {
          await wbot.sendMessage(node.attrs.from, {
            text:
              "*Mensagem Automática:*\n\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado",
          });

          const number = node.attrs.from.replace(/\D/g, "");

          const contact = await Contact.findOne({
            where: { companyId, number },
          });

          const ticket = await Ticket.findOne({
            where: {
              contactId: contact.id,
              whatsappId: wbot.id,
              //status: { [Op.or]: ["close"] },
              companyId
            },
          });
          // se não existir o ticket não faz nada.
          if (!ticket) return;

          const date = new Date();
          const hours = date.getHours();
          const minutes = date.getMinutes();

          const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;

          const messageData = {
            id: content.attrs["call-id"],
            ticketId: ticket.id,
            contactId: contact.id,
            body,
            fromMe: false,
            mediaType: "call_log",
            read: true,
            quotedMsgId: null,
            ack: 1,
          };

          await ticket.update({
            lastMessage: body,
          });


          if (ticket.status === "closed") {
            await ticket.update({
              status: "pending",
            });
          }

          return CreateMessageService({ messageData, companyId: companyId });
        }
      }
    });

    function cleanStringForJSON(str) {
      // Remove caracteres de controle, ", \ e '
      return str.replace(/[\x00-\x1F"\\']/g, "");
    }

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {

      const filteredContacts: any[] = [];

      try {
        Promise.all(
          contacts.map(async contact => {
            if (!isJidBroadcast(contact.id) && !isJidStatusBroadcast(contact.id) && isJidUser(contact.id)) {

              const contactArray = {
                'id': contact.id,
                'name': contact.name ? cleanStringForJSON(contact.name) : contact.id.split('@')[0].split(':')[0]
              }

              filteredContacts.push(contactArray);

            }
          })
        );

        const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
        if (!fs.existsSync(path.join(publicFolder, `company${companyId}`))) {
          fs.mkdirSync(path.join(publicFolder, `company${companyId}`), { recursive: true })
          fs.chmodSync(path.join(publicFolder, `company${companyId}`), 0o777)
        }
        const contatcJson = path.join(publicFolder, `company${companyId}`, "contactJson.txt");
        if (fs.existsSync(contatcJson)) {
          await fs.unlinkSync(contatcJson);
        }

        await fs.promises.writeFile(contatcJson, JSON.stringify(filteredContacts, null, 2));
      } catch (err) {
        Sentry.captureException(err);
        logger.error(`Erro contacts.upsert: ${JSON.stringify(err)}`);
      }

      try {
        await createOrUpdateBaileysService({
          whatsappId: whatsapp.id,
          contacts: filteredContacts,
        });
      } catch (err) {
        logger.error(err)
      }
    });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;
