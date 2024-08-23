/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

export interface DashboardData {
  tickets: any[];
  totalTickets: any;
}

export interface Params {
  searchParam: string;
  contactId: string;
  whatsappId: string[];
  dateFrom: string;
  dateTo: string;
  status: string[];
  queueIds: number[];
  tags: number[];
  users: number[];
  userId: string;
}

export default async function ListTicketsServiceReport(
  companyId: string | number,
  params: Params,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardData> {
  const offset = (page - 1) * pageSize;

  const query = `
  select 
	  t.id,
	  w."name" as "whatsappName",
    c."name" as "contactName",
	  u."name" as "userName",
	  q."name" as "queueName",
	  tt."lastMessage",
    t.uuid,
    case tt.status
      when 'open' then 'ABERTO'
      when 'closed' then 'FECHADO'
      when 'pending' then 'PENDENTE'
      when 'group' then 'GRUPO'
      when 'nps' then 'NPS'
      when 'lgpd' then 'LGPD'
    end as "status",
    TO_CHAR(tt."createdAt", 'DD/MM/YYYY HH24:MI') as "createdAt",
    TO_CHAR(tt."finishedAt", 'DD/MM/YYYY HH24:MI') as "closedAt",
    coalesce((
      (date_part('day', age(coalesce(tt."ratingAt", tt."finishedAt") , tt."createdAt"))) || ' d, ' || 
      (date_part('hour', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."createdAt"))) || ' hrs e ' ||
      (date_part('minutes', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."createdAt"))) || ' m'
    ), '0') "supportTime",
    ur.rate "NPS"
  from "Tickets" t
   inner JOIN "TicketTraking"  tt  
   		left join "UserRatings" ur on
   			tt.id = ur."ticketTrakingId"
    left join "Contacts" c on 
      tt."contactId" = c.id 
    left join "Whatsapps" w on 
      tt."whatsappId" = w.id 
    left join "Users" u on
      tt."userId" = u.id 
    left join "Queues" q on
      tt."queueId" = q.id 
      on t.id = tt."ticketId"
  -- filterPeriod`;

  let where = `where t."companyId" = ${companyId}`;

  if (_.has(params, "dateFrom")) {
    where += ` and tt."createdAt" >= '${params.dateFrom} 00:00:00'`;
  }

  if (_.has(params, "dateTo")) {
    where += ` and tt."createdAt" <= '${params.dateTo} 23:59:59'`;
  }

  if (params.whatsappId !== undefined && params.whatsappId.length > 0) {
    where += ` and tt."whatsappId" in (${params.whatsappId})`;
  }
  if (params.users.length > 0) {
    where += ` and tt."userId" in (${params.users})`;
  }

  if (params.queueIds.length > 0) {
    where += ` and COALESCE(tt."queueId",0) in (${params.queueIds})`;
  }

  if (params.status.length > 0) {
    where += ` and tt."status" in ('${params.status.join("','")}')`;
  }

  if (params.contactId !== undefined && params.contactId !== "") {
    where += ` and tt."contactId" in (${params.contactId})`;
  }

  const finalQuery = query.replace("-- filterPeriod", where);

  const totalTicketsQuery = `
    SELECT COUNT(*) as total FROM "Tickets" t
    INNER JOIN "TicketTraking" tt ON 
    t.id = tt."ticketId"
    ${where}  `;

  const totalTicketsResult = await sequelize.query(totalTicketsQuery, {
    type: QueryTypes.SELECT
  });
  const totalTickets = totalTicketsResult[0];

  const paginatedQuery = `${finalQuery} ORDER BY tt."createdAt" DESC LIMIT ${pageSize} OFFSET ${offset}`;

  const responseData: any[] = await sequelize.query(paginatedQuery, {
    type: QueryTypes.SELECT
  });

  return { tickets: responseData, totalTickets };
}
