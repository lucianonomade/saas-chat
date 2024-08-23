import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([

      queryInterface.addColumn("Whatsapps", "mediaPath", {
        type: DataTypes.TEXT,
        allowNull: true,
      }),

      queryInterface.addColumn("Whatsapps", "mediaName", {
        type: DataTypes.TEXT,
        allowNull: true,
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Whatsapps", "mediaName"),
      queryInterface.removeColumn("Whatsapps", "mediaPath")
    ]);
  }
};
