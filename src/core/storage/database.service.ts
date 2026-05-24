// src/core/storage/database.service.ts

import * as SQLite
    from "expo-sqlite";

import {
    logInfo,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Database Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - SQLite connection management
| - schema initialization
| - migrations foundation
| - query execution
| - persistence runtime
|
| IMPORTANT:
| This becomes the ROOT persistence layer.
|
*/

export class DatabaseService {
    /*
    |--------------------------------------------------------------------------
    | SQLite Database
    |--------------------------------------------------------------------------
    */

    private static db:
        SQLite.SQLiteDatabase;

    /*
    |--------------------------------------------------------------------------
    | Initialize Database
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            logInfo(
                "Initializing SQLite database..."
            );

            /*
            |--------------------------------------------------------------------------
            | Open Database
            |--------------------------------------------------------------------------
            */

            this.db =
                await SQLite.openDatabaseAsync(
                    "automation-platform.db"
                );

            /*
            |--------------------------------------------------------------------------
            | Enable WAL
            |--------------------------------------------------------------------------
            */

            await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
      `);

            /*
            |--------------------------------------------------------------------------
            | Create Base Tables
            |--------------------------------------------------------------------------
            */

            await this.createTables();

            logInfo(
                "SQLite database initialized"
            );
        } catch (error) {
            logError(
                "Database initialization failed",
                error
            );

            throw error;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create Tables
    |--------------------------------------------------------------------------
    */

    private static async createTables():
        Promise<void> {
        /*
        |--------------------------------------------------------------------------
        | Runtime Events
        |--------------------------------------------------------------------------
        */

        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS runtime_events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        workflow_id TEXT,
        session_id TEXT,
        execution_id TEXT,
        payload TEXT,
        created_at INTEGER NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | Runtime States
        |--------------------------------------------------------------------------
        */

        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS runtime_states (
        workflow_id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        state TEXT NOT NULL,
        metadata TEXT,
        updated_at INTEGER NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | Notification History
        |--------------------------------------------------------------------------
        */

        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        session_id TEXT,
        notification_id TEXT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | AI Memory
        |--------------------------------------------------------------------------
        */

        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_memory (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | Assistant Memory
        |--------------------------------------------------------------------------
        */

        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS assistant_memory (
        id TEXT PRIMARY KEY,
        summary TEXT NOT NULL,
        recommendations TEXT,
        insights TEXT,
        created_at INTEGER NOT NULL
      );
    `);

        /*
        |--------------------------------------------------------------------------
        | Evolution History
        |--------------------------------------------------------------------------
        */

        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_evolution (
        generation INTEGER PRIMARY KEY,
        intelligence_score INTEGER NOT NULL,
        improvements TEXT,
        evolved_at INTEGER NOT NULL
      );
    `);

        logInfo(
            "Database tables ready"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Database
    |--------------------------------------------------------------------------
    */

    static getDatabase():
        SQLite.SQLiteDatabase {
        return this.db;
    }

    /*
    |--------------------------------------------------------------------------
    | Execute Query
    |--------------------------------------------------------------------------
    */

    static async exec(
        query: string
    ): Promise<void> {
        await this.db.execAsync(
            query
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Run Query
    |--------------------------------------------------------------------------
    */

    static async run(
        query: string,
        params: unknown[] = []
    ) {
        return this.db.runAsync(
            query,
            params
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get All
    |--------------------------------------------------------------------------
    */

    static async getAll<T>(
        query: string,
        params: unknown[] = []
    ): Promise<T[]> {
        return this.db.getAllAsync<T>(
            query,
            params
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get First
    |--------------------------------------------------------------------------
    */

    static async getFirst<T>(
        query: string,
        params: unknown[] = []
    ): Promise<T | null> {
        return this.db.getFirstAsync<T>(
            query,
            params
        );
    }
}