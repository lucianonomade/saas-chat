import { QueryTypes } from "sequelize";
import sequelize from "../../database";

type Result = {
  id: number;
  currentSchedule: [];
  startTime: string;
  endTime: string;
  inActivity: boolean;
};

const VerifyCurrentScheduleOld = async (id: string | number): Promise<Result> => {
  const sql = `
    select
      s.id,
      s.currentWeekday,
      s.currentSchedule,
        (s.currentSchedule->>'startTime')::time "startTime",
        (s.currentSchedule->>'endTime')::time "endTime",
        (
          now()::time >= (s.currentSchedule->>'startTime')::time and
          now()::time <= (s.currentSchedule->>'endTime')::time
        ) "inActivity"
    from (
      SELECT
            c.id,
            to_char(current_date, 'day') currentWeekday,
            (array_to_json(array_agg(s))->>0)::jsonb currentSchedule
      FROM "Companies" c, jsonb_array_elements(c.schedules) s
      WHERE s->>'weekdayEn' like trim(to_char(current_date, 'day')) and c.id = :id
      GROUP BY 1, 2
    ) s
    where s.currentSchedule->>'startTime' not like '' and s.currentSchedule->>'endTime' not like '';
  `;

  const result: Result = await sequelize.query(sql, {
    replacements: { id },
    type: QueryTypes.SELECT,
    plain: true
  });

  return result;
};

const VerifyCurrentSchedule = async (id: string | number): Promise<Result> => {
  const sql = `
  SELECT
  s.id,
  s.currentWeekday,
  s.currentSchedule,
  (s.currentSchedule->>'startTime')::time "startTime",
  (s.currentSchedule->>'endTime')::time "endTime",
  (s.currentSchedule->>'lunchTimeStart')::time "lunchTimeStart",
  (s.currentSchedule->>'lunchTimeEnd')::time "lunchTimeEnd",
  (
    (now()::time >= (s.currentSchedule->>'startTime')::time AND now()::time < (s.currentSchedule->>'lunchTimeStart')::time)
    OR
    (now()::time >= (s.currentSchedule->>'lunchTimeEnd')::time AND now()::time <= (s.currentSchedule->>'endTime')::time)
  ) "inActivity"
FROM (
  SELECT
      c.id,
      to_char(current_date, 'day') currentWeekday,
      (array_to_json(array_agg(s))->>0)::jsonb currentSchedule
  FROM "Companies" c, jsonb_array_elements(c.schedules) s
  WHERE s->>'weekdayEn' LIKE trim(to_char(current_date, 'day')) AND c.id = :id
  GROUP BY 1, 2
) s
WHERE s.currentSchedule->>'startTime' NOT LIKE '' AND s.currentSchedule->>'endTime' NOT LIKE ''
AND s.currentSchedule->>'lunchTimeStart' NOT LIKE '' AND s.currentSchedule->>'lunchTimeEnd' NOT LIKE '';
  `;

  const result: Result = await sequelize.query(sql, {
    replacements: { id },
    type: QueryTypes.SELECT,
    plain: true
  });

  return result;
};


export default VerifyCurrentSchedule;
