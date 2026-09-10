CREATE DATABASE IF NOT EXISTS `fiverr_clone`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `fiverr_clone`;

-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: fiverr_clone
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `parent_id` int DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10070 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (10000,'Digital Marketing',NULL),(10001,'Graphics & Design',NULL),(10002,'Video & Animation',NULL),(10003,'Data',NULL),(10004,'Affiliate Marketing',10000),(10005,'Email Marketing',10000),(10006,'SEO',10000),(10007,'Social Media Marketing',10000),(10008,'Content Marketing',10000),(10009,'Advertising',10000),(10010,'Public Relations',10000),(10011,'Video Marketing',10000),(10012,'Logo Design',10001),(10013,'UX/UI Design',10001),(10014,'Illustration',10001),(10015,'Branding',10001),(10016,'Packaging Design',10001),(10017,'Web Design',10001),(10018,'3D Modeling',10001),(10019,'Video Editing',10002),(10020,'2D Animation',10002),(10021,'3D Animation',10002),(10022,'Motion Graphics',10002),(10023,'Explainer Videos',10002),(10024,'Music Videos',10002),(10025,'Character Animation',10002),(10026,'Data Analysis',10003),(10027,'Data Visualization',10003),(10028,'Machine Learning',10003),(10029,'Python',10003),(10030,'SQL',10003),(10031,'Data Cleaning',10003),(10032,'Statistics',10003),(10033,'Writing & Translation',NULL),(10034,'Programming & Tech',NULL),(10035,'Music & Audio',NULL),(10036,'Business',NULL),(10037,'Lifestyle',NULL),(10038,'AI Services',NULL),(10039,'Copywriting',10033),(10040,'Technical Writing',10033),(10041,'Translation',10033),(10042,'Creative Writing',10033),(10043,'Proofreading & Editing',10033),(10044,'Website Development',10034),(10045,'Mobile App Development',10034),(10046,'Game Development',10034),(10047,'AI & Machine Learning',10034),(10048,'DevOps & Cloud',10034),(10049,'WordPress',10034),(10050,'Voice Over',10035),(10051,'Mixing & Mastering',10035),(10052,'Podcast Editing',10035),(10053,'Jingles & Intros',10035),(10054,'Sound Design',10035),(10055,'Virtual Assistant',10036),(10056,'Market Research',10036),(10057,'Business Plans',10036),(10058,'Project Management',10036),(10059,'Financial Consulting',10036),(10060,'Online Tutoring',10037),(10061,'Fitness Coaching',10037),(10062,'Life Coaching',10037),(10063,'Relationship Advice',10037),(10064,'Astrology & Tarot',10037),(10065,'Chatbot Development',10038),(10066,'AI Image Generation',10038),(10067,'AI Video Creation',10038),(10068,'Data Annotation',10038),(10069,'Prompt Engineering',10038);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_pending_requests`
--

DROP TABLE IF EXISTS `client_pending_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_pending_requests` (
  `pending_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `freelancer_id` int NOT NULL,
  `client_id` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `price` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `skills` text,
  `tags` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pending_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_pending_requests`
--

LOCK TABLES `client_pending_requests` WRITE;
/*!40000 ALTER TABLE `client_pending_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_pending_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'2025-11-04 00:51:48'),(3,'2025-11-04 00:58:47'),(4,'2025-11-04 00:59:12'),(5,'2025-11-04 00:59:31'),(6,'2025-11-04 00:59:48'),(18,'2025-12-30 10:27:19');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freelancer_payouts`
--

DROP TABLE IF EXISTS `freelancer_payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freelancer_payouts` (
  `finID` bigint NOT NULL AUTO_INCREMENT,
  `orderID` bigint NOT NULL,
  `freelancerID` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(8) NOT NULL DEFAULT 'USD',
  `paidAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`finID`),
  KEY `orderID` (`orderID`),
  KEY `freelancerID` (`freelancerID`),
  CONSTRAINT `fk_payout_freelancer` FOREIGN KEY (`freelancerID`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payout_order` FOREIGN KEY (`orderID`) REFERENCES `orders` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freelancer_payouts`
--

LOCK TABLES `freelancer_payouts` WRITE;
/*!40000 ALTER TABLE `freelancer_payouts` DISABLE KEYS */;
INSERT INTO `freelancer_payouts` VALUES (1,1,7,30.00,'USD','2025-11-04 02:28:45'),(2,2,2,40.00,'USD','2025-11-04 02:31:40'),(3,3,10,30.00,'USD','2025-11-04 05:00:05'),(4,4,2,40.00,'USD','2025-11-04 05:33:40'),(5,5,12,30.00,'USD','2025-11-04 06:44:41'),(6,7,16,30.00,'USD','2025-11-04 07:06:43'),(7,8,9,30.00,'USD','2025-11-04 07:20:10'),(8,9,9,40.00,'USD','2025-11-04 07:20:13'),(9,10,13,30.00,'USD','2025-11-04 10:57:48'),(10,13,2,50.00,'USD','2025-11-06 03:46:37'),(11,14,2,50.00,'USD','2025-12-30 09:54:05'),(12,15,19,40.00,'USD','2025-12-30 10:36:36');
/*!40000 ALTER TABLE `freelancer_payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freelancers`
--

DROP TABLE IF EXISTS `freelancers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freelancers` (
  `user_id` int NOT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `skills` text,
  `education` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `freelancers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freelancers`
--

LOCK TABLES `freelancers` WRITE;
/*!40000 ALTER TABLE `freelancers` DISABLE KEYS */;
INSERT INTO `freelancers` VALUES (2,'Graphics & Design','3D Modeling, Packaging Design, UX/UI Design','Btech','123465789','I will do any graphics job','2025-11-04 00:55:10'),(7,'AI Services','AI Image Generation, AI Video Creation','Diploma','123456789','I will do any AI job you request me to do ','2025-11-04 01:01:03'),(9,'Business','Project Management, Business Plans','Commerce','123456789','I will do anything related to business','2025-11-04 01:04:04'),(10,'Data','Data Cleaning, Data Analysis, Machine Learning','Btech In DA','123456789','I will do any DataAnalysis and statistical model building jobs','2025-11-04 01:05:08'),(11,'Business','Business Plans, Virtual Assistant, Project Management','Commerce','789456123','I will do your business stuff','2025-11-04 06:26:21'),(12,'Programming & Tech','Website Development','Btech','123456879','I will do web\n','2025-11-04 06:42:28'),(13,'Digital Marketing','Social Media Marketing, Email Marketing, Advertising','Btech in Online','123456789','I will do online service','2025-11-04 06:56:26'),(14,'Lifestyle','Fitness Coaching, Life Coaching','Btech in Fitness','1234598','I will help you guide through your life\n','2025-11-04 06:59:25'),(15,'Music & Audio','Sound Design, Jingles & Intros','Masters in Music','123456789','I will help you create music and other music related stuff\n','2025-11-04 07:01:39'),(16,'Video & Animation','Explainer Videos, Video Editing','Course in Editing','123456789','I will create whatever video explainers you need\n','2025-11-04 07:04:57'),(17,'Digital Marketing','Email Marketing','Btech','123456789','I will do something','2025-11-05 04:47:57'),(19,'Data','Statistics, Data Analysis','Btech ','123456789','Data Scientist from Harvard','2025-12-30 10:30:57');
/*!40000 ALTER TABLE `freelancers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_requests_log`
--

DROP TABLE IF EXISTS `listing_requests_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_requests_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `listingID` int NOT NULL,
  `user_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `accepted_by` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `selectedSkills` text,
  `tags` text,
  `price` decimal(10,2) NOT NULL,
  `duration` int NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `requested_by` (`requested_by`),
  KEY `user_id` (`user_id`),
  KEY `listing_requests_log_ibfk_1` (`listingID`),
  CONSTRAINT `listing_requests_log_ibfk_1` FOREIGN KEY (`listingID`) REFERENCES `listings` (`listingID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `listing_requests_log_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `listing_requests_log_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_requests_log`
--

LOCK TABLES `listing_requests_log` WRITE;
/*!40000 ALTER TABLE `listing_requests_log` DISABLE KEYS */;
INSERT INTO `listing_requests_log` VALUES (3,8,9,6,9,'I will handle paper work for enlisting ','I will handle all paper work for enlisting as  a company','Project Management','enlisting',40.00,4,'Business','2025-11-04 02:35:57'),(4,9,10,1,10,'I will help handle time series data','Will do any time series analysis forecast and prediction','Data Analysis','timeseries',30.00,3,'Data','2025-11-04 04:56:13'),(6,12,12,3,12,'I will make nice 3d website','I will make nice 3d website','Website Development','fajsd',30.00,3,'Programming & Tech','2025-11-04 06:43:30'),(7,14,14,5,14,'I will help you get 6 pack','I will help you get 6 pack','Fitness Coaching','abs',30.00,3,'Lifestyle','2025-11-04 07:00:12'),(9,7,9,6,9,'I will create a business model for your business','Business model building','Business Plans','business',30.00,3,'Business','2025-11-04 07:19:50'),(10,5,7,3,NULL,'I will do AI poster creation','I will create complex posters for your buisiness','AI Image Generation','poster',20.00,2,'AI Services','2025-11-04 10:56:55'),(12,12,12,4,12,'I will make nice 3d website','I will make nice 3d website','Website Development','fajsd',30.00,3,'Programming & Tech','2025-11-04 11:00:56'),(14,10,10,3,NULL,'I will handle any data cleaning','any data cleaning job for files of size 20Gb or less','Data Cleaning','cleaning',30.00,3,'Data','2025-11-06 03:45:25'),(15,1,2,5,2,'I will create any 3d model ','I will create any 3d model you ask ','3D Modeling','blender',50.00,3,'Graphics & Design','2025-11-06 03:46:09'),(16,1,2,6,2,'I will create any 3d model ','I will create any 3d model you ask ','3D Modeling','blender',50.00,3,'Graphics & Design','2025-12-30 09:44:26'),(17,25,19,18,19,'I will do analysis of time series data','I perform time series analysis to uncover trends, seasonality, and anomalies in temporal data, and build forecasting models to help businesses understand past behavior and predict future outcomes.','Data Analysis','timeseries',40.00,4,'Data','2025-12-30 10:35:42');
/*!40000 ALTER TABLE `listing_requests_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_listing_request_accepted` AFTER UPDATE ON `listing_requests_log` FOR EACH ROW BEGIN
    IF NEW.accepted_by IS NOT NULL AND OLD.accepted_by IS NULL THEN
        INSERT INTO orders (
            listingID,
            accepted_by,
            requested_by,
            duration
        )
        VALUES (
            NEW.listingID,
            NEW.accepted_by,
            NEW.requested_by,
            NEW.duration
        );
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `listings`
--

DROP TABLE IF EXISTS `listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listings` (
  `listingID` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `requested_by` int DEFAULT NULL,
  `accepted_by` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `selectedSkills` text,
  `tags` text,
  `price` decimal(10,2) NOT NULL,
  `duration` int NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`listingID`),
  KEY `fk_listing_freelancer` (`user_id`),
  KEY `fk_listing_client` (`requested_by`),
  KEY `fk_listing_acceptor` (`accepted_by`),
  CONSTRAINT `fk_listing_acceptor` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_listing_client` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_listing_freelancer` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_listings_accepted_by` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_listings_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listings`
--

LOCK TABLES `listings` WRITE;
/*!40000 ALTER TABLE `listings` DISABLE KEYS */;
INSERT INTO `listings` VALUES (1,2,6,NULL,'I will create any 3d model ','I will create any 3d model you ask ','3D Modeling','blender',50.00,3,'Graphics & Design','2025-11-04 01:06:25'),(4,7,NULL,NULL,'I will do AI video generation','I will do AI video generation of any kind','AI Video Creation','Ai',20.00,2,'AI Services','2025-11-04 02:21:23'),(5,7,3,NULL,'I will do AI poster creation','I will create complex posters for your buisiness','AI Image Generation','poster',20.00,2,'AI Services','2025-11-04 02:21:57'),(7,9,6,NULL,'I will create a business model for your business','Business model building','Business Plans','business',30.00,3,'Business','2025-11-04 02:23:51'),(8,9,6,NULL,'I will handle paper work for enlisting ','I will handle all paper work for enlisting as  a company','Project Management','enlisting',40.00,4,'Business','2025-11-04 02:24:45'),(9,10,1,NULL,'I will help handle time series data','Will do any time series analysis forecast and prediction','Data Analysis','timeseries',30.00,3,'Data','2025-11-04 02:25:39'),(10,10,3,NULL,'I will handle any data cleaning','any data cleaning job for files of size 20Gb or less','Data Cleaning','cleaning',30.00,3,'Data','2025-11-04 02:27:03'),(11,11,NULL,NULL,'I will help you create a new business','I will help you create a new business','Business Plans, Project Management','new',30.00,3,'Business','2025-11-04 06:27:17'),(12,12,4,NULL,'I will make nice 3d website','I will make nice 3d website','Website Development','fajsd',30.00,3,'Programming & Tech','2025-11-04 06:43:16'),(14,14,5,NULL,'I will help you get 6 pack','I will help you get 6 pack','Fitness Coaching','abs',30.00,3,'Lifestyle','2025-11-04 07:00:00'),(15,15,NULL,NULL,'I will help you create some nice christmas music','I will help you create some nice christmas music','Sound Design, Jingles & Intros','christmas',30.00,3,'Music & Audio','2025-11-04 07:03:24'),(18,2,NULL,NULL,'I will create some 3d mdel','I will create some 3d mdel','3D Modeling','3d model',30.00,3,'Graphics & Design','2025-11-04 10:56:10'),(25,19,18,NULL,'I will do analysis of time series data','I perform time series analysis to uncover trends, seasonality, and anomalies in temporal data, and build forecasting models to help businesses understand past behavior and predict future outcomes.','Data Analysis','timeseries',40.00,4,'Data','2025-12-30 10:34:23');
/*!40000 ALTER TABLE `listings` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `log_listing_request_change` AFTER UPDATE ON `listings` FOR EACH ROW BEGIN

  IF (
    (OLD.requested_by IS NULL AND NEW.requested_by IS NOT NULL) OR
    (OLD.requested_by IS NOT NULL AND NEW.requested_by IS NULL) OR
    (OLD.requested_by <> NEW.requested_by)
  ) THEN
    INSERT INTO listing_requests_log (
      listingID,
      user_id,
      requested_by,
      accepted_by,
      title,
      description,
      selectedSkills,
      tags,
      price,
      duration,
      category,
      created_at
    )
    VALUES (
      NEW.listingID,
      NEW.user_id,
      NEW.requested_by,
      NEW.accepted_by,
      NEW.title,
      NEW.description,
      NEW.selectedSkills,
      NEW.tags,
      NEW.price,
      NEW.duration,
      NEW.category,
      NOW()
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `message_logs`
--

DROP TABLE IF EXISTS `message_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_logs` (
  `msg_id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `freelancer_id` int NOT NULL,
  `client_id` int NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`msg_id`),
  KEY `order_id` (`order_id`),
  KEY `freelancer_id` (`freelancer_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `message_logs_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`orderID`) ON DELETE CASCADE,
  CONSTRAINT `message_logs_ibfk_2` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_logs_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_logs`
--

LOCK TABLES `message_logs` WRITE;
/*!40000 ALTER TABLE `message_logs` DISABLE KEYS */;
INSERT INTO `message_logs` VALUES (1,3,10,1,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_3_freelancer_10_client_1.csv','2025-11-04 04:58:59'),(2,3,10,1,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_3_freelancer_10_client_1.csv','2025-11-04 04:58:59'),(3,5,12,3,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_5_freelancer_12_client_3.csv','2025-11-04 06:44:03'),(4,5,12,3,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_5_freelancer_12_client_3.csv','2025-11-04 06:44:03'),(5,7,16,3,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_7_freelancer_16_client_3.csv','2025-11-04 11:15:58'),(6,7,16,3,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_7_freelancer_16_client_3.csv','2025-11-04 11:15:58'),(7,13,2,5,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_13_freelancer_2_client_5.csv','2025-11-06 03:46:59'),(8,13,2,5,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_13_freelancer_2_client_5.csv','2025-11-06 03:46:59'),(9,15,19,18,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_15_freelancer_19_client_18.csv','2025-12-30 10:37:39'),(10,15,19,18,'/home/noxpx/Documents/DBMS/new/my-app/server/messages/messages_order_15_freelancer_19_client_18.csv','2025-12-30 10:37:39');
/*!40000 ALTER TABLE `message_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `orderID` bigint NOT NULL AUTO_INCREMENT,
  `listingID` int DEFAULT NULL,
  `requestID` int DEFAULT NULL,
  `accepted_by` int DEFAULT NULL,
  `requested_by` int DEFAULT NULL,
  `duration` int NOT NULL,
  `progress` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finished` enum('yes','no') DEFAULT 'no',
  PRIMARY KEY (`orderID`),
  KEY `fk_orders_listing` (`listingID`),
  KEY `fk_orders_request` (`requestID`),
  KEY `fk_orders_accepted_by` (`accepted_by`),
  KEY `fk_orders_requested_by` (`requested_by`),
  CONSTRAINT `fk_orders_accepted_by` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_listing` FOREIGN KEY (`listingID`) REFERENCES `listings` (`listingID`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_request` FOREIGN KEY (`requestID`) REFERENCES `requests` (`request_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,NULL,NULL,7,1,3,100,'2025-11-04 02:28:00','yes'),(2,NULL,NULL,2,5,4,100,'2025-11-04 02:31:33','yes'),(3,9,NULL,10,1,3,100,'2025-11-04 04:56:34','yes'),(4,NULL,NULL,2,3,4,100,'2025-11-04 05:33:24','yes'),(5,12,NULL,12,3,3,100,'2025-11-04 06:43:43','yes'),(6,14,NULL,14,5,3,0,'2025-11-04 07:00:23','no'),(7,NULL,NULL,16,3,3,100,'2025-11-04 07:06:19','yes'),(8,7,NULL,9,6,3,100,'2025-11-04 07:20:01','yes'),(9,8,NULL,9,6,4,100,'2025-11-04 07:20:03','yes'),(10,NULL,NULL,13,4,2,75,'2025-11-04 10:57:35','yes'),(11,12,NULL,12,4,3,0,'2025-11-04 11:01:41','no'),(12,NULL,NULL,13,3,3,70,'2025-11-05 01:24:17','no'),(13,1,NULL,2,5,3,100,'2025-11-06 03:46:19','yes'),(14,1,NULL,2,6,3,100,'2025-12-30 09:45:34','yes'),(15,25,NULL,19,18,4,100,'2025-12-30 10:36:26','yes');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `set_finished_on_progress` BEFORE UPDATE ON `orders` FOR EACH ROW BEGIN

  IF NEW.progress = 100 AND (OLD.progress IS NULL OR OLD.progress < 100) THEN
    SET NEW.finished = 'yes';
  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_order_finished_payout` AFTER UPDATE ON `orders` FOR EACH ROW BEGIN

  DECLARE payout_amount DECIMAL(12,2);


  IF NEW.finished = 'yes' AND OLD.finished <> 'yes' THEN


    IF NOT EXISTS (SELECT 1 FROM freelancer_payouts WHERE orderID = NEW.orderID) THEN


      SELECT price INTO payout_amount
      FROM listing_requests_log
      WHERE listingID = NEW.listingID
      LIMIT 1;


      IF payout_amount IS NULL THEN
        SET payout_amount = 0.00;
      END IF;


      INSERT INTO freelancer_payouts (orderID, freelancerID, amount, currency)
      VALUES (NEW.orderID, NEW.accepted_by, payout_amount, 'USD');

    END IF;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `skills` varchar(255) DEFAULT NULL,
  `tags` text,
  `price_range` varchar(100) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accepted_by` int DEFAULT NULL,
  `confirmed` int DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (1,1,'I want web dec','I want webdev','UX/UI Design','webdec','30',3,'2025-11-04 05:04:18',2,1),(2,3,'Yo','Yo','Data Annotation','new','4',4,'2025-11-04 06:07:58',10,3),(3,5,'I want to make a youtube video','I want to make a youtube video','2D Animation, Video Editing','yt','30',3,'2025-11-04 06:34:31',11,5),(4,3,'I want to make youtube video about ','I want to make youtube video about ','2D Animation, Video Editing','youtube','30',3,'2025-11-04 09:31:24',11,3),(5,4,'I want to do data','I want to do data','Data Analysis','data','30',3,'2025-11-04 09:43:02',16,NULL),(6,3,'I want ','I want','AI & Machine Learning, Technical Writing','hi','30',3,'2025-11-04 09:50:33',NULL,NULL),(7,5,'content creation','want to make a content for my yt video','Explainer Videos, Video Editing','content','.5',3,'2025-11-06 03:48:49',16,5);
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_requests_after_confirm` AFTER UPDATE ON `requests` FOR EACH ROW BEGIN

  IF NEW.accepted_by IS NOT NULL
     AND NEW.confirmed IS NOT NULL
     AND (OLD.accepted_by IS NULL OR OLD.confirmed IS NULL)
  THEN
    INSERT INTO `requests_log` (
      rq_requestID,
      rq_user_id,
      rq_requested_by,
      rq_accepted_by,
      rq_title,
      rq_description,
      rq_selectedSkills,
      rq_tags,
      rq_price,
      rq_duration,
      rq_created_at
    )
    VALUES (
      NEW.request_id,
      NEW.accepted_by,
      NEW.user_id,
      NEW.accepted_by,
      NEW.title,
      NEW.description,
      NEW.skills,
      NEW.tags,
      NEW.price_range,
      NEW.duration,
      NEW.created_at
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `requests_log`
--

DROP TABLE IF EXISTS `requests_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests_log` (
  `rq_log_id` bigint NOT NULL AUTO_INCREMENT,
  `rq_requestID` int NOT NULL,
  `rq_user_id` int NOT NULL,
  `rq_requested_by` int NOT NULL,
  `rq_accepted_by` int DEFAULT NULL,
  `rq_title` varchar(255) NOT NULL,
  `rq_description` text NOT NULL,
  `rq_selectedSkills` text,
  `rq_tags` text,
  `rq_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rq_duration` int NOT NULL,
  `rq_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finished` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`rq_log_id`),
  KEY `rq_requestID` (`rq_requestID`),
  KEY `rq_user_id` (`rq_user_id`),
  KEY `rq_requested_by` (`rq_requested_by`),
  KEY `rq_accepted_by` (`rq_accepted_by`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests_log`
--

LOCK TABLES `requests_log` WRITE;
/*!40000 ALTER TABLE `requests_log` DISABLE KEYS */;
INSERT INTO `requests_log` VALUES (1,2,10,3,10,'Yo','Yo','Data Annotation','new',4.00,4,'2025-11-04 06:07:58',0),(2,3,11,5,11,'I want to make a youtube video','I want to make a youtube video','2D Animation, Video Editing','yt',30.00,3,'2025-11-04 06:34:31',1),(3,4,11,3,11,'I want to make youtube video about ','I want to make youtube video about ','2D Animation, Video Editing','youtube',30.00,3,'2025-11-04 09:31:24',0),(4,7,16,5,16,'content creation','want to make a content for my yt video','Explainer Videos, Video Editing','content',0.50,3,'2025-11-06 03:48:49',1);
/*!40000 ALTER TABLE `requests_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `reviewID` bigint NOT NULL AUTO_INCREMENT,
  `orderID` bigint NOT NULL,
  `clientID` int NOT NULL,
  `freelancerID` int NOT NULL,
  `stars` int NOT NULL,
  `comment` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reviewID`),
  UNIQUE KEY `unique_order_review` (`orderID`),
  KEY `clientID` (`clientID`),
  KEY `freelancerID` (`freelancerID`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`orderID`) REFERENCES `orders` (`orderID`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`clientID`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`freelancerID`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK (((`stars` >= 1) and (`stars` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,1,7,5,'Yeah they did a good job','2025-11-04 02:29:13'),(2,2,5,2,3,'Good job but could be better\n','2025-11-04 02:32:15'),(3,3,1,10,4,'He did a nice job but could have been better','2025-11-04 05:00:35'),(4,4,3,2,4,'Done nice','2025-11-04 05:33:56'),(5,5,3,12,5,'nice ','2025-11-04 06:45:03'),(6,7,3,16,5,'Nice video nice job no problems','2025-11-04 07:07:07'),(7,9,6,9,5,'goodjob\n','2025-11-04 07:20:32'),(8,8,6,9,3,'ok job','2025-11-04 07:20:41'),(10,13,5,2,5,'nice job\n','2025-11-06 03:46:55'),(11,15,18,19,4,'Overall good but time could have been faster ','2025-12-30 10:39:56');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('client','freelancer') NOT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Jayesh','J123@gmail.com','client','2025-11-04 00:51:48'),(2,'HB','HB@123','freelancer','2025-11-04 00:55:10'),(3,'Alice','Alice@123','client','2025-11-04 00:58:47'),(4,'Bob','Bb@123','client','2025-11-04 00:59:12'),(5,'John','John@123','client','2025-11-04 00:59:31'),(6,'Mark','Mark@123','client','2025-11-04 00:59:48'),(7,'W1','W1@123','freelancer','2025-11-04 01:01:03'),(9,'W2','W2@123','freelancer','2025-11-04 01:04:04'),(10,'W3','W3@123','freelancer','2025-11-04 01:05:08'),(11,'N1','N1@123','freelancer','2025-11-04 06:26:21'),(12,'HritikB','HritikB@123','freelancer','2025-11-04 06:42:28'),(13,'N2','N2@123','freelancer','2025-11-04 06:56:26'),(14,'N3','N3@123','freelancer','2025-11-04 06:59:25'),(15,'N4','N4@123','freelancer','2025-11-04 07:01:39'),(16,'N5','N5@123','freelancer','2025-11-04 07:04:57'),(17,'New','New@123','freelancer','2025-11-05 04:47:57'),(18,'User123','User123@gmail.com','client','2025-12-30 10:27:19'),(19,'Freelancer1','Freelancer1@gmail.com','freelancer','2025-12-30 10:30:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-09 13:01:14
