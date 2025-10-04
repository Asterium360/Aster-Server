/**
 * Jest Configuration for ES Modules (ESM) with ts-jest.
 *
 * NOTE: The config file must use CommonJS (module.exports) to avoid the
 * "module is not defined" ReferenceError during Jest initialization.
 */
module.exports = {
  // Usamos el preset dedicado a ES Modules (ESM)
  preset: 'ts-jest/presets/default-esm', 
  
  testEnvironment: 'node',
  
  // Asegura que Jest busque solo archivos .test.ts
  testMatch: ['**/tests/**/*.test.ts'],
  
  // Esencial para cargar variables de entorno como JWT_SECRET
  setupFiles: ['dotenv/config'],
  roots: ['./src/tests'],

  // Configuración de Módulos (Crucial para que ts-jest reconozca el ESM)
  extensionsToTreatAsEsm: ['.ts', '.tsx'], 
  
  transform: {
      '^.+\\.tsx?$': [
          'ts-jest',
          {
              // Forzamos el uso de ESM para la transformación de archivos
              useESM: true, 
              // Usamos tu tsconfig.json para las reglas de compilación
              tsconfig: 'tsconfig.json',
          },
      ],
  },
  
  // Permite que las importaciones relativas funcionen correctamente en ESM
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testRegex: ['(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};