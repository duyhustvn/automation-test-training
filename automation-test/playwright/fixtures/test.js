import { test as base } from '@playwright/test';
import { MongoClient } from 'mongodb';

export const test = base.extend({
  // Custom Fixture: Quản lý kết nối tới MongoDB cho từng test
  db: async ({}, use) => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUri);
    await client.connect();

    // Bàn giao database 'training_db' cho test case sử dụng
    await use(client.db('training_db'));

    // Tự động ngắt kết nối sau khi test case hoàn tất (Teardown)
    await client.close();
  },
});

export { expect } from '@playwright/test';
