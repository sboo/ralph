import {
  SQLiteDatabase,
  enablePromise,
  openDatabase,
} from 'react-native-sqlite-storage';
import {Measurement} from '../models/measurements';

enablePromise(true);

const databaseName = 'Ralph.db';
type Table = 'Measurements';

export const connectToDatabase = async () => {
  return openDatabase(
    {name: databaseName, location: 'default'},
    () => {},
    error => {
      console.error(error);
      throw Error('Could not connect to database');
    },
  );
};

export const createTables = async (db: SQLiteDatabase) => {
  const measurementsQuery = `
  CREATE TABLE IF NOT EXISTS Measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    date TEXT, 
    score INTEGER, 
    hurt INTEGER, 
    hunger INTEGER, 
    hydration INTEGER, 
    hygiene INTEGER, 
    happiness INTEGER, 
    mobility INTEGER, 
    moreGoodDays INTEGER
  )
  `;
  const uniqueMeasurementsQuery = `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_date
  ON Measurements (date);
  `;
  try {
    await db.executeSql(measurementsQuery);
    await db.executeSql(uniqueMeasurementsQuery);
  } catch (error) {
    console.error(error);
    throw Error('Failed to create tables');
  }
};

export const getTableNames = async (db: SQLiteDatabase): Promise<string[]> => {
  try {
    const tableNames: string[] = [];
    const results = await db.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        tableNames.push(result.rows.item(index).name);
      }
    });
    return tableNames;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get table names from database');
  }
};

export const removeTable = async (db: SQLiteDatabase, tableName: Table) => {
  const query = `DROP TABLE IF EXISTS ${tableName}`;
  try {
    await db.executeSql(query);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to drop table ${tableName}`);
  }
};

export const insertMeasurement = async (
  db: SQLiteDatabase,
  measurement: Measurement,
): Promise<void> => {
  const {
    date,
    score,
    hurt,
    hunger,
    hydration,
    hygiene,
    happiness,
    mobility,
    moreGoodDays,
  } = measurement;
  try {
    await db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO Measurements (date, score, hurt, hunger, hydration, hygiene, happiness, mobility, moreGoodDays) VALUES (?, ? ,?, ?, ?, ?, ?, ?, ?)',
        [
          date,
          score,
          hurt,
          hunger,
          hydration,
          hygiene,
          happiness,
          mobility,
          moreGoodDays,
        ],
      );
    });
    console.log('Measurement inserted successfully');
  } catch (error) {
    console.error('Error inserting measurement: ', error);
    throw error;
  }
};

export const fetchMeasurements = async (
  db: SQLiteDatabase,
): Promise<Measurement[]> => {
  try {
    const results = await db.executeSql('SELECT * FROM Measurements');
    let measurements: Measurement[] = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      measurements.push(results[0].rows.item(i));
    }
    return measurements;
  } catch (error) {
    console.error('Error fetching measurements: ', error);
    throw error;
  }
};

export const fetchMeasurementByDate = async (
  db: SQLiteDatabase,
  date: string,
): Promise<Measurement> => {
  try {
    const results = await db.executeSql(
      'SELECT * FROM Measurements WHERE date = ?',
      [date],
    );
    return results[0].rows.item(0);
  } catch (error) {
    console.error('Error fetching measurements: ', error);
    throw error;
  }
};
