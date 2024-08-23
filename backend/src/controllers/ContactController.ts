import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import GetContactService from "../services/ContactServices/GetContactService";

import CheckContactNumber from "../services/WbotServices/CheckNumber";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import AppError from "../errors/AppError";
import SimpleListService, {
  SearchContactParams
} from "../services/ContactServices/SimpleListService";
import ContactCustomField from "../models/ContactCustomField";
import NumberSimpleListService from "../services/ContactServices/NumberSimpleListService";
import ToggleDisableBotContactService from "../services/ContactServices/ToggleDisableBotContactService";
import CreateOrUpdateContactServiceForImport from "../services/ContactServices/CreateOrUpdateContactServiceForImport";
import Contact from "../models/Contact";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexGetContactQuery = {
  name: string;
  number: string;
};

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}
interface ContactData {
  name: string;
  number: string;
  email?: string;
  extraInfo?: ExtraInfo[];
  disableBot?: boolean;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ contacts, count, hasMore });
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;
  const { companyId } = req.user;

  const contact = await GetContactService({
    name,
    number,
    companyId
  });

  return res.status(200).json(contact);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const newContact: ContactData = req.body;
  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }
  try {

    await CheckIsValidContact(newContact.number, companyId);
    const validNumber = await CheckContactNumber(newContact.number, companyId);
    /**
     * Código desabilitado por demora no retorno
     */
    // const profilePicUrl = await GetProfilePicUrl(validNumber.jid, companyId);

    const contact = await CreateContactService({
      ...newContact,
      number: validNumber,
      // profilePicUrl,
      companyId
    });

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });

    return res.status(200).json(contact);
  } catch (error) {
    if (error.message === "ERR_CHECK_NUMBER") return res.status(400).send("this contact is not whatsapp");
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await ShowContactService(contactId, companyId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string(),
    number: Yup.string().matches(
      /^\d+$/,
      "Invalid number format. Only numbers is allowed."
    )
  });

  try {
    await schema.validate(contactData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await CheckIsValidContact(contactData.number, companyId);
  const validNumber = await CheckContactNumber(contactData.number, companyId);
  const number = validNumber;
  contactData.number = number;

  const { contactId } = req.params;

  const contact = await UpdateContactService({
    contactData,
    contactId,
    companyId
  });

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  await ShowContactService(contactId, companyId);

  await DeleteContactService(contactId);

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "delete",
    contactId
  });

  return res.status(200).json({ message: "Contact deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.query as unknown as SearchContactParams;
  const { companyId } = req.user;

  const contacts = await SimpleListService({ name, companyId });

  return res.json(contacts);
};

export const getContactProfileURL = async (req: Request, res: Response) => {
  const { number } = req.params
  const { companyId } = req.user;

  if (number) {
    const validNumber = await CheckContactNumber(number, companyId);

    const profilePicUrl = await GetProfilePicUrl(validNumber, companyId);

    const contact = await NumberSimpleListService({ number: validNumber, companyId: companyId })

    let obj: any;
    if (contact.length > 0) {
      obj = {
        contactId: contact[0].id,
        profilePicUrl: profilePicUrl
      }
    } else {
      obj = {
        contactId: 0,
        profilePicUrl: profilePicUrl
      }
    }
    return res.status(200).json(obj);
  }
};

export const toggleDisableBot = async (req: Request, res: Response): Promise<Response> => {
  var { contactId } = req.params;
  const { companyId } = req.user;
  const contact = await ToggleDisableBotContactService({ contactId });

  const io = getIO();

  io.emit(`company-${companyId}-contact`, {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const importXls = async (req: Request, res: Response): Promise<Response> => {

  const { companyId } = req.user;
  const { number, name, email } = req.body;
  const simpleNumber = number.replace(/[^\d.-]+/g, '');
  console.log("simpleNumber> ", simpleNumber)
  console.log("name> ", name)
  const validNumber = await CheckContactNumber(simpleNumber, companyId);
  console.log("60", validNumber)
  /**
   * Código desabilitado por demora no retorno
   */
  //
  const profilePicUrl = await GetProfilePicUrl(validNumber, companyId);

  const contactData = {
    name: `${name}`,
    number: validNumber,
    profilePicUrl,
    isGroup: false,
    email,
    companyId
  };

  const contact = await CreateOrUpdateContactServiceForImport(contactData);

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "create",
    contact
  });

  return res.status(200).json(contact);
};

export const deleteAllContactsFromCompanie = async (req: Request, res: Response): Promise<Response> => {

  const { companyId } = req.user;

  const contacts = await Contact.findAll({
    where: { companyId }
  });

  contacts.forEach(async (contact) => {
    await DeleteContactService(contact.id.toString());
  });

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "delete",
    contactId: 0
  });

  return res.status(200).json({ message: "Contacts deleted" });
}


