import { log } from 'console';
import { QueryInterface, DataTypes } from "sequelize";

interface companyMigration{
  id: string | number;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tempCompaniesWithoutKey = await queryInterface.sequelize.query(
      `SELECT id FROM "Companies" WHERE id NOT IN
      (SELECT "companyId" FROM "Settings" WHERE key = 'userViewTicketsWithoutQueue');`
    )

    const insertPromises = [];
    const companiesWithoutKey = tempCompaniesWithoutKey[0] as companyMigration[];

    companiesWithoutKey.forEach(company => {

      insertPromises.push(
        queryInterface.bulkInsert('Settings', [{
          key: 'userViewTicketsWithoutQueue',
          value: 'disabled',
          createdAt: new Date(),
          updatedAt: new Date(),
          companyId: company?.id,
        }])
      );
    });

    // Executar todas as inserções em paralelo
    await Promise.all(insertPromises);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Settings', {
      key: 'userViewTicketsWithoutQueue'
    });
  }
};
