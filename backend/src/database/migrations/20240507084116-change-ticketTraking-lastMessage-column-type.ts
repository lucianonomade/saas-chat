import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("TicketTraking", "lastMessage", {
      defaultValue: "",
      type: DataTypes.TEXT
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("TicketTraking", "lastMessage", {
      defaultValue: "",
      type: DataTypes.TEXT
    });
  }
};
