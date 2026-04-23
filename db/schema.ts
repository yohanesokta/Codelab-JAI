import { mysqlTable, serial, varchar, text, timestamp, int, boolean } from 'drizzle-orm/mysql-core';

export const problems = mysqlTable('problems', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  duration: int('duration'), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const testCases = mysqlTable('test_cases', {
  id: int('id').autoincrement().primaryKey(),
  problemId: int('problem_id')
    .notNull()
    .references(() => problems.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).default('standard').notNull(), // 'standard' (input/output) or 'script' (custom python code)
  input: text('input'),
  expectedOutput: text('expected_output'),
  testScript: text('test_script'), // Custom python code to run against user code
});

export const submissions = mysqlTable('submissions', {
  id: int('id').autoincrement().primaryKey(),
  nim: varchar('nim', { length: 50 }).notNull(),
  problemId: int('problem_id')
    .notNull()
    .references(() => problems.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // 'pass', 'fail', 'error', 'pending'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
