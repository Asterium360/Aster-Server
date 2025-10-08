import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import { sequelize } from '../db.js';

interface UserAttrs {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  role_id: number;                 // 1=admin, 2=user (por defecto)
  display_name?: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type UserCreation = Optional<
  UserAttrs,
  'id' | 'display_name' | 'is_active' | 'created_at' | 'updated_at' | 'role_id'
>;

export class User extends Model<UserAttrs, UserCreation> implements UserAttrs {
  declare id: number;
  declare email: string;
  declare username: string;
  declare password_hash: string;
  declare role_id: number;
  declare display_name: string | null;
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(100), allowNull: false },

    // ← user por defecto
    role_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 2 },

    display_name: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    defaultScope: { attributes: { exclude: ["password_hash"] } },
     scopes: {
      // 👉 así sí tipa: incluye password_hash cuando necesites el hash
      withPassword: { attributes: { include: ["password_hash"] } },
    },
  }
);
