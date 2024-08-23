import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import { isNil } from "lodash";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  extraInfo?: ExtraInfo[];
  whatsappId?: number;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  companyId,
  extraInfo = [],
  whatsappId
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({
    where: {
      number,
      companyId
    }
  });

  if (contact) {
    contact.update({ profilePicUrl });

    try {
      if (isNil(contact.whatsappId)) {
        const whatsapp = await Whatsapp.findOne({
          where: {
            id: whatsappId,
            companyId
          }
        });

        if (whatsapp) {
          contact.update({
            whatsappId
          });
        }
      }
    } catch (err) {
      logger.error("Error to update WhatsappId on contact:", err);
      throw err;
    }
    
    io.emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      extraInfo,
      companyId,
      whatsappId
    });

    io.emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;
