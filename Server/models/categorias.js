// categorias.js
import { DataTypes, Model } from "sequelize";
import db from "../database/db.js";

const Categorias = db.define(
  "categorias",
  {
    uuid: {
      type: DataTypes.INTEGER(4),
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

// Categorias.hasMany(Servicios, { foreignKey: 'COD_categorias', as: 'servicios' });

export default Categorias;
