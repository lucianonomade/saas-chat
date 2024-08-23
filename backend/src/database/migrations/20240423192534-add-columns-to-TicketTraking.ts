import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("TicketTraking", "queueId", {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("TicketTraking", "contactId", {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("TicketTraking", "status", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("TicketTraking", "lastMessage", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("TicketTraking", "queueId"),
      queryInterface.removeColumn("TicketTraking", "contactId"),
      queryInterface.removeColumn("TicketTraking", "status"),
      queryInterface.removeColumn("TicketTraking", "lastMessage")
    ]);
  }
};
