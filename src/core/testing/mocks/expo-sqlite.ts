// src/core/testing/mocks/expo-sqlite.ts

export const openDatabaseSync = (name: string) => {
  return {
    execAsync: async (query: string) => {
      return { changes: 0, lastInsertRowId: 0 };
    },
    runAsync: async (query: string, params?: any[]) => {
      return { changes: 0, lastInsertRowId: 0 };
    },
    getFirstAsync: async <T>(query: string, params?: any[]): Promise<T | null> => {
      return null;
    },
    getAllAsync: async <T>(query: string, params?: any[]): Promise<T[]> => {
      return [];
    },
  };
};
