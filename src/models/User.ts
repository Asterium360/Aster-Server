import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import {sequelize} from "..db.js"

// NOTA: mantenemos 'users' como nombre de tabla
const UserModel = db_connection.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "este campo no puede estar vacío" },
        len: { args: [2, 100], msg: "este campo no permite menos de 2 caracteres" },
      },
    },

    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      set(value) {
        // normalizamos email
        this.setDataValue("email", String(value).trim().toLowerCase());
      },
      validate: {
        notNull: { msg: "este campo no puede estar vacío" },
        isEmail: { msg: "email inválido" },
      },
    },

    // Guardamos SIEMPRE el HASH aquí.
    // Puedes enviar password en texto plano desde el controlador;
    // este modelo lo hashea automáticamente en los hooks.
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "este campo no puede estar vacío" },
      },
    },

    role: {
      type: DataTypes.STRING(10),
      defaultValue: "user",
      validate: {
        isIn: {
          args: [["admin", "user"]],
          msg: "rol inválido",
        },
      },
    },
  },
  {
    tableName: "users",
    timestamps: false, // déjalo en false si tu tabla no tiene createdAt/updatedAt
    defaultScope: {
      // Nunca exponer el hash por defecto
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {}, // sin exclusiones (útil para login)
    },
    indexes: [{ unique: true, fields: ["email"] }],
  }
);

// ---- Hooks: hashear si la contraseña cambió y no parece un hash
UserModel.addHook("beforeSave", async (user) => {
  if (user.changed("password")) {
    const raw = String(user.getDataValue("password") || "");
    const looksHashed = raw.startsWith("$2a$") || raw.startsWith("$2b$") || raw.startsWith("$2y$");
    if (!looksHashed) {
      const hash = await bcrypt.hash(raw, 10);
      user.setDataValue("password", hash);
    }
  }
});

// Método de instancia para comparar contraseñas
UserModel.prototype.checkPassword = function (plain) {
  const hash = this.getDataValue("password");
  return bcrypt.compare(String(plain), String(hash || ""));
};

export default UserModel;