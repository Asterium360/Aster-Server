// // src/tests/setupTestDB.ts
// import { sequelize } from './src/db';

// /** Crea/Resetea el esquema antes de las suites */
// export async function setupTestDB() {
//   // force: true → dropea y crea tablas (limpio)
//   await sequelize.sync({  });
// }

// /** Trunca todas las tablas (útil entre tests) */
// export async function truncateAll() {
//   const { models } = sequelize;
//   for (const name of Object.keys(models)) {
//     await models[name].destroy({
//       where: {},
//       truncate: true,
//       cascade: true,
//       restartIdentity: true, // reinicia AUTO_INCREMENT
//     });
//   }
// }

// /** Cierra la conexión al final */
// export async function teardownTestDB() {
//   await sequelize.close();
// }
