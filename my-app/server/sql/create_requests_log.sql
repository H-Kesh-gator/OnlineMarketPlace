-- Create a requests_log table (columns suffixed with 'rq')
-- This is a lightweight table mirroring listing_requests_log but for requests
-- (no category column). Run this in your MySQL server to create the table.

CREATE TABLE IF NOT EXISTS `requests_log` (
  `rq_log_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `rq_requestID` INT NOT NULL,
  `rq_user_id` INT NOT NULL,
  `rq_requested_by` INT NOT NULL,
  `rq_accepted_by` INT DEFAULT NULL,
  `rq_title` VARCHAR(255) NOT NULL,
  `rq_description` TEXT NOT NULL,
  `rq_selectedSkills` TEXT DEFAULT NULL,
  `rq_tags` TEXT DEFAULT NULL,
  `rq_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `rq_duration` INT NOT NULL,
  `rq_created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (`rq_requestID`),
  INDEX (`rq_user_id`),
  INDEX (`rq_requested_by`),
  INDEX (`rq_accepted_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
