-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: mysql-dd346f1-vishwamfrover-1317.i.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bets`
--

DROP TABLE IF EXISTS `bets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `round_id` int NOT NULL,
  `player_id` int NOT NULL,
  `amount` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_round_player` (`round_id`,`player_id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `bets_ibfk_1` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bets_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bets`
--

LOCK TABLES `bets` WRITE;
/*!40000 ALTER TABLE `bets` DISABLE KEYS */;
INSERT INTO `bets` VALUES (1,1,6,5000,'2026-03-23 12:29:15'),(2,1,7,10000,'2026-03-23 12:29:21'),(3,1,8,10000,'2026-03-23 12:29:27'),(4,1,9,25000,'2026-03-23 12:29:34'),(5,1,11,25000,'2026-03-23 12:29:39'),(6,1,10,5000,'2026-03-23 12:29:59'),(7,2,6,10000,'2026-03-23 12:30:38'),(8,2,7,25000,'2026-03-23 12:30:44'),(9,2,8,100000,'2026-03-23 12:30:57'),(10,2,9,50000,'2026-03-23 12:31:02'),(11,2,10,50000,'2026-03-23 12:31:08'),(12,2,11,25000,'2026-03-23 12:31:13'),(13,3,6,5000,'2026-03-23 12:31:30'),(14,3,7,10000,'2026-03-23 12:31:34'),(15,3,8,25000,'2026-03-23 12:31:39'),(16,3,9,12000,'2026-03-23 12:31:49'),(17,3,10,25000,'2026-03-23 12:31:58'),(18,3,11,50000,'2026-03-23 12:32:02'),(19,4,6,25000,'2026-03-23 12:32:21'),(20,4,7,25000,'2026-03-23 12:32:26'),(21,4,8,25000,'2026-03-23 12:32:31'),(22,4,9,25000,'2026-03-23 12:32:35'),(23,4,10,25000,'2026-03-23 12:32:39'),(24,4,11,25000,'2026-03-23 12:32:43'),(25,5,6,5000,'2026-03-23 12:33:03'),(26,5,7,10000,'2026-03-23 12:33:09'),(27,5,8,25000,'2026-03-23 12:33:13'),(28,5,9,50000,'2026-03-23 12:33:18'),(29,5,10,100000,'2026-03-23 12:33:22'),(30,5,11,5000,'2026-03-23 12:33:26'),(31,6,6,100000,'2026-03-23 12:33:40'),(32,6,7,50000,'2026-03-23 12:33:46'),(33,6,8,25000,'2026-03-23 12:33:51'),(34,6,9,10000,'2026-03-23 12:33:57'),(35,6,10,5000,'2026-03-23 12:34:01'),(36,6,11,100000,'2026-03-23 12:34:04');
/*!40000 ALTER TABLE `bets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (6,'Rohan','2026-03-23 12:26:37'),(7,'Robert','2026-03-23 12:26:53'),(8,'Peter','2026-03-23 12:27:04'),(9,'Vikram','2026-03-23 12:27:24'),(10,'John','2026-03-23 12:27:46'),(11,'Rahul','2026-03-23 12:28:38'),(12,'Karan','2026-03-23 12:29:03');
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rounds`
--

DROP TABLE IF EXISTS `rounds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rounds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rounds`
--

LOCK TABLES `rounds` WRITE;
/*!40000 ALTER TABLE `rounds` DISABLE KEYS */;
INSERT INTO `rounds` VALUES (1,'2026-03-23 12:29:09'),(2,'2026-03-23 12:30:32'),(3,'2026-03-23 12:31:18'),(4,'2026-03-23 12:32:16'),(5,'2026-03-23 12:32:57'),(6,'2026-03-23 12:33:35');
/*!40000 ALTER TABLE `rounds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seat_number` int NOT NULL,
  `player_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seat_number` (`seat_number`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL,
  CONSTRAINT `seats_chk_1` CHECK ((`seat_number` between 1 and 6))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1,1,6),(2,2,7),(3,3,8),(4,4,9),(5,5,10),(6,6,11);
/*!40000 ALTER TABLE `seats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-23 18:10:20
