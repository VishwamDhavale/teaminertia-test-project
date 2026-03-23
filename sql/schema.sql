CREATE TABLE IF NOT EXISTS players (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  seat_number INT NOT NULL UNIQUE CHECK (seat_number BETWEEN 1 AND 6),
  player_id   INT DEFAULT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

-- Seed the 6 seats on setup (using IGNORE to avoid errors if already seeded)
INSERT IGNORE INTO seats (seat_number) VALUES (1),(2),(3),(4),(5),(6);

CREATE TABLE IF NOT EXISTS rounds (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bets (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  round_id   INT NOT NULL,
  player_id  INT NOT NULL,
  amount     INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (round_id)  REFERENCES rounds(id)  ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_round_player (round_id, player_id)
);
