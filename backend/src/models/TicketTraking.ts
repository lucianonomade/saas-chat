import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";
import Ticket from "./Ticket";
import Whatsapp from "./Whatsapp";
import Contact from "./Contact";
import Queue from "./Queue";

@Table({
  tableName: "TicketTraking"
})
class TicketTraking extends Model<TicketTraking> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  rated: boolean;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  startedAt: Date;

  @Column
  queuedAt: Date;

  @Column
  finishedAt: Date;

  @Column
  ratingAt: Date;

  @Column
  chatbotAt: Date;

  @Column
  @ForeignKey(() => Contact)
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @Column
  @ForeignKey(() => Queue)
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @Column
  status: string;

  @Column
  lastMessage: string;
}

export default TicketTraking;
