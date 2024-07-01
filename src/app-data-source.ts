import 'reflect-metadata';
import localforage from 'localforage';
import initSqlJs from 'sql.js';
import { DataSource } from 'typeorm';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm';
import User from './entity/User';

// Créez une variable pour stocker l'instance de DataSource
// eslint-disable-next-line import/no-mutable-exports
let AppDataSource: DataSource;

async function initDatabase() {
  const SQL = await initSqlJs({ locateFile: () => sqlWasm });
  AppDataSource = new DataSource({
    type: 'sqljs',
    location: 'database.sqlite',
    useLocalForage: true,
    autoSave: true,
    entities: [
      User,
    ],
    synchronize: true,
    driver: SQL,
  });
  await AppDataSource.initialize();
  console.log('Database initialized successfully.');

  return AppDataSource;
}

async function clearDatabase() {
  try {
    await localforage.clear();
    console.log('All database data has been deleted');
  } catch (error) {
    console.error('Error clearing database data:', error);
  }
}

// Exportez également l'instance pour une utilisation directe après initialisation
export { AppDataSource, initDatabase, clearDatabase };
