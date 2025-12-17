import { DataTypes } from "sequelize";
import  sequelize  from "../configs/sequelize.js";

export const ThamSo = sequelize.define(
  "THAMSO",
  {
    MaThamSo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Tuoi_Toi_Da: { type: DataTypes.INTEGER, allowNull: true },
    Tuoi_Toi_Thieu: { type: DataTypes.INTEGER, allowNull: true },
    Si_So_Toi_Da: { type: DataTypes.INTEGER, allowNull: true },
    Diem_Toi_Thieu: { type: DataTypes.INTEGER, allowNull: true },
    Diem_Toi_Da: { type: DataTypes.INTEGER, allowNull: true },
    Diem_Dat_Mon: { type: DataTypes.INTEGER, allowNull: true },
    Diem_Dat: { type: DataTypes.INTEGER, allowNull: true },
    MaNamHoc: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "THAMSO", timestamps: false }
);
