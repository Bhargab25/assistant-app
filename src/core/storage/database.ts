// src/core/storage/database.ts

import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "assistant.db";

/*
|--------------------------------------------------------------------------
| Open Database
|--------------------------------------------------------------------------
*/

export const db = SQLite.openDatabaseSync(DATABASE_NAME);

/*
|--------------------------------------------------------------------------
| Initialize Database
|--------------------------------------------------------------------------
*/

export const initializeDatabase = async (): Promise<void> => {
    try {
        /*
        |--------------------------------------------------------------------------
        | Workflows Table
        |--------------------------------------------------------------------------
        */

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        workflow_json TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        state TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | Workflow Logs Table
        |--------------------------------------------------------------------------
        */

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workflow_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        created_at TEXT NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | Locations Table
        |--------------------------------------------------------------------------
        */

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius REAL NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | Settings Table
        |--------------------------------------------------------------------------
        */

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Database initialization failed:", error);
        throw error;
    }
};