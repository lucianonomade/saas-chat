import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("UserRatings", "ticketTrakingId", {
      type: DataTypes.INTEGER,
      references: { model: "TicketTraking", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("UserRatings", "ticketTrakingId");
  }
};
