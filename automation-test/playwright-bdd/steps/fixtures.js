import { test as base } from 'playwright-bdd';
import { MongoClient } from 'mongodb';

export const test = base.extend({
  // Context cô lập riêng cho từng Scenario, tránh race-condition khi chạy song song
  apiContext: async ({}, use) => {
    const context = {
      username: '',
      response: null,
      responseBody: null,
    };
    await use(context);
  },

  // Custom Fixture: Quản lý kết nối MongoDB phục vụ Database Assertion
  db: async ({}, use) => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUri);
    await client.connect();
    await use(client.db('training_db'));
    await client.close();
  },
});
