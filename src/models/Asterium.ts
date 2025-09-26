import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import { sequelize } from '../db.js';

export interface AsteriumAttrs {
  id: number;
  author_id: number;                  // FK a users.id
  title: string;
  slug: string;
  excerpt?: string | null;
  content_md: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: Date | null;
  like_count: number;
  created_at?: Date;
  updated_at?: Date;
}

type AsteriumCreation = Optional<
  AsteriumAttrs,
  'id' | 'excerpt' | 'published_at' | 'like_count' | 'created_at' | 'updated_at'
>;

export class Asterium extends Model<AsteriumAttrs, AsteriumCreation> implements AsteriumAttrs {
  declare id: number;
  declare author_id: number;
  declare title: string;
  declare slug: string;
  declare excerpt: string | null;
  declare content_md: string;
  declare status: 'draft' | 'published' | 'archived';
  declare published_at: Date | null;
  declare like_count: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Asterium.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    author_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    excerpt: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    content_md: { type: DataTypes.TEXT('long'), allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'published', 'archived'), allowNull: false, defaultValue: 'draft' },
    published_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    like_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'asteriums', timestamps: false }
);
