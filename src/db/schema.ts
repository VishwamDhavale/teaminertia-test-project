import { mysqlTable, int, varchar, timestamp, unique } from 'drizzle-orm/mysql-core';

export const players = mysqlTable('players', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const seats = mysqlTable('seats', {
  id: int('id').autoincrement().primaryKey(),
  seat_number: int('seat_number').notNull().unique(),
  player_id: int('player_id').references(() => players.id, { onDelete: 'set null' }),
});

export const rounds = mysqlTable('rounds', {
  id: int('id').autoincrement().primaryKey(),
  created_at: timestamp('created_at').defaultNow(),
});

export const bets = mysqlTable('bets', {
  id: int('id').autoincrement().primaryKey(),
  round_id: int('round_id').notNull().references(() => rounds.id, { onDelete: 'cascade' }),
  player_id: int('player_id').notNull().references(() => players.id, { onDelete: 'restrict' }),
  amount: int('amount').notNull(),
  created_at: timestamp('created_at').defaultNow(),
}, (t) => ({
  uq_round_player: unique('uq_round_player').on(t.round_id, t.player_id),
}));
