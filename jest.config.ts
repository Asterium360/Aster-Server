// /**
//  * Jest Configuration for ES Modules (ESM) with ts-jest.
//  *
//  * NOTE: The config file must use CommonJS (module.exports) to avoid the
//  * "module is not defined" ReferenceError during Jest initialization.
//  */

// import type { Config } from '@jest/types';

// module.exports = {
//   // Usamos el preset dedicado a ES Modules (ESM)
//   preset: 'ts-jest/presets/default-esm', 
  
//   testEnvironment: 'node',
  
//   // Asegura que Jest busque solo archivos .test.ts
//   testMatch: ['**/tests/**/*.test.ts'],
  
//   // Esencial para cargar variables de entorno como JWT_SECRET
//   setupFiles: ['dotenv/config'],
//   roots: ['./src/test'],

//   // Configuración de Módulos (Crucial para que ts-jest reconozca el ESM)
//   extensionsToTreatAsEsm: ['.ts', '.tsx'], 
  
//   // transform: {
//   //     '^.+\\.tsx?$': [
//   //         'ts-jest',
//   //         {
//   //             // Forzamos el uso de ESM para la transformación de archivos
//   //             useESM: true, 
//   //             // Usamos tu tsconfig.json para las reglas de compilación
//   //             tsconfig: 'tsconfig.json',
//   //         },
//   //     ],
//   // },

//   // Transform configuration para ESM
//   transform: {
//     '^.+\.tsx?$': [
//       'ts-jest',
//       {
//         useESM: true,
//         tsconfig: {
//           module: 'ESNext',
//           moduleResolution: 'node',
//           esModuleInterop: true,
//         },
//       },
//     ],
//   },

  
//   // Permite que las importaciones relativas funcionen correctamente en ESM
//   moduleNameMapper: {
//     '^(\\.{1,2}/.*)\\.js$': '$1',
//   },
//   testRegex: ['(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$'],
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
// };

// export default config;

// mariany code

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Preset para ESM
  preset: 'ts-jest/presets/default-esm',

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // coveragePathIgnorePatterns: [
  //   "/node_modules/",
  //   "/tests/",
  //   "/database/",
  //   "/config/"
  // ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // Extensions to treat as ESM
  extensionsToTreatAsEsm: ['.ts'],

  // Module file extensions
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node"
  ],

  // CRÍTICO: Module name mapper para resolver imports com .js
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>./src/tests"],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Transform configuration para ESM
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node',
          esModuleInterop: true,
        },
      },
    ],
  },
};

export default config;