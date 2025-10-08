// models/ContactMessage.ts
import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import { sequelize } from '../db.js';

export interface ContactMessageAttrs {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  user_id?: number | null;
  status: 'new' | 'read' | 'replied' | 'closed';
  ip?: string | null;
  user_agent?: string | null;
  source?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
type ContactMessageCreation = Optional<
  ContactMessageAttrs,
  'id' | 'subject' | 'user_id' | 'status' | 'ip' | 'user_agent' | 'source' | 'created_at' | 'updated_at'
>;

export class ContactMessage extends Model<ContactMessageAttrs, ContactMessageCreation> implements ContactMessageAttrs {
  declare id: number;
  declare name: string;
  declare email: string;
  declare subject: string | null;
  declare message: string;
  declare user_id: number | null;
  declare status: 'new' | 'read' | 'replied' | 'closed';
  declare ip: string | null;
  declare user_agent: string | null;
  declare source: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

ContactMessage.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(191), allowNull: false },
    subject: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
    message: { type: DataTypes.TEXT, allowNull: false },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    status: { type: DataTypes.ENUM('new', 'read', 'replied', 'closed'), allowNull: false, defaultValue: 'new' },
    ip: { type: DataTypes.STRING(45), allowNull: true },           // IPv4/IPv6
    user_agent: { type: DataTypes.STRING(255), allowNull: true },
    source: { type: DataTypes.STRING(50), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'contact_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
