-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 07:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ncnhs-exam`
--

-- --------------------------------------------------------

--
-- Table structure for table `componentsettings`
--

CREATE TABLE `componentsettings` (
  `id` int(11) NOT NULL,
  `role` varchar(191) NOT NULL,
  `componentPath` varchar(191) NOT NULL,
  `componentName` varchar(191) NOT NULL,
  `isEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam`
--

CREATE TABLE `exam` (
  `id` int(11) NOT NULL,
  `testCode` varchar(191) NOT NULL,
  `classCode` varchar(191) NOT NULL,
  `examTitle` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `isDraft` tinyint(1) NOT NULL DEFAULT 1,
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examaccess`
--

CREATE TABLE `examaccess` (
  `id` int(11) NOT NULL,
  `examId` int(11) NOT NULL,
  `grade` int(11) NOT NULL,
  `section` varchar(191) NOT NULL,
  `isEnabled` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examanswer`
--

CREATE TABLE `examanswer` (
  `id` int(11) NOT NULL,
  `examId` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `userAnswer` varchar(191) NOT NULL,
  `isCorrect` tinyint(1) NOT NULL,
  `submittedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gradesection`
--

CREATE TABLE `gradesection` (
  `id` int(11) NOT NULL,
  `grade` int(11) NOT NULL,
  `section` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gradesection`
--

INSERT INTO `gradesection` (`id`, `grade`, `section`, `createdAt`, `updatedAt`) VALUES
(1, 10, 'COURAGE', '2025-05-20 13:58:44.442', '2025-05-20 13:58:44.442'),
(3, 9, 'KERRIA', '2025-05-20 14:08:23.888', '2025-05-20 14:08:23.888'),
(4, 9, 'LILY', '2025-05-20 14:08:23.898', '2025-05-20 14:08:23.898'),
(5, 9, 'BLUEBELL', '2025-05-20 14:08:23.907', '2025-05-20 14:08:23.907'),
(6, 9, 'CAMIA', '2025-05-20 14:08:23.915', '2025-05-20 14:08:23.915'),
(7, 10, 'FAITH', '2025-05-20 14:09:14.181', '2025-05-20 14:09:14.181'),
(8, 9, 'ADELFA', '2025-05-20 15:54:20.674', '2025-05-20 15:54:20.674');

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

CREATE TABLE `question` (
  `id` int(11) NOT NULL,
  `examId` int(11) NOT NULL,
  `questionText` varchar(191) NOT NULL,
  `questionType` varchar(191) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `correctAnswer` varchar(191) NOT NULL,
  `imageUrl` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionbank`
--

CREATE TABLE `questionbank` (
  `id` int(11) NOT NULL,
  `questionText` varchar(191) NOT NULL,
  `questionType` varchar(191) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `correctAnswer` varchar(191) NOT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `subject` varchar(191) DEFAULT NULL,
  `difficulty` varchar(191) NOT NULL,
  `createdBy` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `folderId` int(11) DEFAULT NULL,
  `sourceClassCode` varchar(191) DEFAULT NULL,
  `sourceExamTitle` varchar(191) DEFAULT NULL,
  `sourceTestCode` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionbankfolder`
--

CREATE TABLE `questionbankfolder` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdBy` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `score`
--

CREATE TABLE `score` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `examId` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `percentage` double NOT NULL,
  `submittedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sectionsubject`
--

CREATE TABLE `sectionsubject` (
  `id` int(11) NOT NULL,
  `grade` int(11) NOT NULL,
  `section` varchar(191) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `code` varchar(191) NOT NULL,
  `scheduleType` varchar(191) DEFAULT NULL,
  `daysOfWeek` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`daysOfWeek`)),
  `startTime` varchar(191) DEFAULT NULL,
  `endTime` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjecttask`
--

CREATE TABLE `subjecttask` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `dueDate` datetime(3) NOT NULL,
  `totalScore` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey`
--

CREATE TABLE `survey` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `code` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `surveyanswer`
--

CREATE TABLE `surveyanswer` (
  `id` int(11) NOT NULL,
  `responseId` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `answer` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `surveyquestion`
--

CREATE TABLE `surveyquestion` (
  `id` int(11) NOT NULL,
  `surveyId` int(11) NOT NULL,
  `questionText` varchar(191) NOT NULL,
  `questionType` varchar(191) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `required` tinyint(1) NOT NULL DEFAULT 1,
  `order` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `surveyresponse`
--

CREATE TABLE `surveyresponse` (
  `id` int(11) NOT NULL,
  `surveyId` int(11) NOT NULL,
  `respondent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taskfile`
--

CREATE TABLE `taskfile` (
  `id` int(11) NOT NULL,
  `fileUrl` varchar(191) NOT NULL,
  `fileName` varchar(191) NOT NULL,
  `taskId` int(11) DEFAULT NULL,
  `submissionId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasksubmission`
--

CREATE TABLE `tasksubmission` (
  `id` int(11) NOT NULL,
  `taskId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `submittedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `score` int(11) DEFAULT NULL,
  `comment` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taskvisibility`
--

CREATE TABLE `taskvisibility` (
  `id` int(11) NOT NULL,
  `taskId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachersubject`
--

CREATE TABLE `teachersubject` (
  `id` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `role` varchar(191) NOT NULL,
  `lrn` varchar(191) DEFAULT NULL,
  `gradeLevel` int(11) DEFAULT NULL,
  `section` varchar(191) DEFAULT NULL,
  `domain` varchar(191) DEFAULT NULL,
  `department` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `profilePicture` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `firstName`, `lastName`, `email`, `password`, `phone`, `address`, `role`, `lrn`, `gradeLevel`, `section`, `domain`, `department`, `createdAt`, `updatedAt`, `profilePicture`) VALUES
(1, 'JOHN MEL', 'HANIBA', 'admin@example.com', '$2y$10$2/FH1K39g2owDENV3xNt6.3HJVAMCp1wzSBUu0BpVKUv3DAxP48.K', NULL, NULL, 'admin', NULL, NULL, NULL, NULL, NULL, '2025-05-20 21:46:55.000', '2025-05-28 21:46:55.000', NULL),
(23, 'RUSSELL', 'APALIT', 'russellapalit@ncnhs.edu.ph', '$2a$10$3s1g7j22R8WsA5fRw9aGRO6k./MLVy2fPsDmRLeKwdZhxB3DV6W3y', NULL, '', 'student', '055208025300', 10, 'FAITH', NULL, NULL, '2025-05-20 14:17:33.743', '2025-05-20 14:17:33.743', NULL),
(25, 'JHAIZEN', 'DE LIMON', 'jhaizendelimon@ncnhs.edu.ph', '$2a$10$NSFRsy1Dt1YMelqtSCg.Q.0dqvmmChcfth/nRd4fUhGEEfDCg16Ei', NULL, '', 'student', '055208025310', 10, 'FAITH', NULL, NULL, '2025-05-20 14:17:34.190', '2025-05-20 14:17:34.190', NULL),
(26, 'EDWARD', 'TENERIFE', 'edwardtenerife@ncnhs.edu.ph', '$2a$10$nfUMD4ysvC71K/mzBIkoUeXv1R1d.KEpR33S8V.0zFkCg5I77xF0i', NULL, '', 'student', '055208025400', 10, 'FAITH', NULL, NULL, '2025-05-20 14:17:34.319', '2025-05-20 14:17:34.319', NULL),
(28, 'JOHN', 'SALVADOR', 'johnsalvador@ncnhs.edu.ph', '$2a$10$A.OBHqdsfLLHTZXQQiHhoeXBgDn/MBh3D3Rt/yVcbSIo6cyDzXZ9C', NULL, '', 'student', '055208025410', 10, 'FAITH', NULL, NULL, '2025-05-20 14:17:34.733', '2025-05-20 14:17:34.733', NULL),
(31, 'ROJEAN', 'TANA', 'rojeantana@ncnhs.edu.ph', '$2a$10$Pq6IQ74JAw7YuFFMNwpkSez2nlsbjKlFHm5zz1xnuzidUPKtZ54JG', NULL, '', 'student', '055208025520', 10, 'FAITH', NULL, NULL, '2025-05-20 14:17:35.534', '2025-05-20 14:17:35.534', NULL),
(32, 'JOHN', 'CABARLE', 'johncabarle@ncnhs.edu.ph', '$2a$10$eBtxDVGzjwZMeV86nrIx6O/PW2Zqha86RL.JQQisKwQRSRb3gDIHe', NULL, '', 'student', '055208025500', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:17:35.661', '2025-05-20 14:17:35.661', NULL),
(34, 'KURT', 'CUNANAN', 'kurtcunanan@ncnhs.edu.ph', '$2a$10$6mfCgY58Eaqg.iLKF.Pc8.vl2TgwUWbJQgPg2wS7bdJpiai78XChO', NULL, '', 'student', '055208025510', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:17:36.069', '2025-05-20 14:17:36.069', NULL),
(35, 'JEROME', 'FERNAEZ', 'jeromefernaez@ncnhs.edu.ph', '$2a$10$Igz1K9W7LCFwiYGWpi7tq.8R6CA3hd194hMgdbEEH3cPN2TyFIXWi', NULL, '', 'student', '055208025600', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:17:36.193', '2025-05-20 14:17:36.193', NULL),
(37, 'KURT', 'RAMOS', 'kurtramos@ncnhs.edu.ph', '$2a$10$z7OsFpLg0W/LKrzq8CJ4EuxBgHItjB1perVVRKjpmjVLKC1mxGLgG', NULL, '', 'student', '055208025610', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:17:36.608', '2025-05-20 14:17:36.608', NULL),
(40, 'JEZREY', 'SIXTA', 'jezreysixta@ncnhs.edu.ph', '$2a$10$H9BqSoscm3XGS5Vzuyha0.P.wsBF6T4Dj98IaxbMpOUL.uEi4wDdC', NULL, '', 'student', '055208025720', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:17:37.408', '2025-05-20 14:17:37.408', NULL),
(41, 'DAVID', 'VILLAMONTE', 'davidvillamonte@ncnhs.edu.ph', '$2a$10$T5wm4Tp8yf7OjxfBaaMeQO0R17fTEzWf4UJbISQfV1s78C6FaVAKK', NULL, '', 'student', '055208025700', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:17:37.532', '2025-05-20 14:17:37.532', NULL),
(43, 'JONATHAN', 'VINOYA', 'jonathanvinoya@ncnhs.edu.ph', '$2a$10$aXIsHUeLFotmYNYiV/oYh..MnxB97pdt3EL0fSMTJPxxsD5EVcrS6', NULL, '', 'student', '055208025710', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:17:37.955', '2025-05-20 14:17:37.955', NULL),
(44, 'AMILLE', 'ATIENZA', 'amilleatienza@ncnhs.edu.ph', '$2a$10$ZweY0y928GUkZ0E7CCdJmul7OJsuiKo03ZsrfYB231NUuitfXo.9K', NULL, '', 'student', '008096675140', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:09.797', '2025-05-20 14:20:09.797', NULL),
(45, 'MIKAELA', 'BAUTISTA', 'mikaelabautista@ncnhs.edu.ph', '$2a$10$i924MHwyooJcYVk2gEpFTO//p.gsvsogTDeHWPSdC/w3D3WpkjSOG', NULL, '', 'student', '008098535090', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:09.978', '2025-05-20 14:20:09.978', NULL),
(46, 'JILIANE', 'BUENAVENTURA', 'jilianebuenaventura@ncnhs.edu.ph', '$2a$10$gVbcCw.E7DUeJXmOyafoA.yRi4SxY5uWvE1pPFfMRXVRK623HtEGq', NULL, '', 'student', '008100393030', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:10.166', '2025-05-20 14:20:10.166', NULL),
(47, 'CHARICE', 'CABARLES', 'charicecabarles@ncnhs.edu.ph', '$2a$10$A47hKpSC/zp2L/VNl3gKX.LZvTa8K7y8C7t0XQhWBg4YPeD51xQ2e', NULL, '', 'student', '008102339380', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:10.358', '2025-05-20 14:20:10.358', NULL),
(48, 'HANNAH', 'CAINDOC', 'hannahcaindoc@ncnhs.edu.ph', '$2a$10$3w0RzOjdsD4G2.OPy19MYusFv72DI0/5m5gA7Hod8dvjPcPCKP0Ja', NULL, '', 'student', '008104236990', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:10.547', '2025-05-20 14:20:10.547', NULL),
(49, 'HERLEEN', 'DELA CRUZ', 'herleendelacruz@ncnhs.edu.ph', '$2a$10$Xc3JBJJrOJCqnubI0YIYm.0G5cTzm4E39ikaC19Thf/mvevsCtV72', NULL, '', 'student', '008106069130', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:10.731', '2025-05-20 14:20:10.731', NULL),
(50, 'ANNE JEE', 'DELOS SANTOS', 'annejeedelossantos@ncnhs.edu.ph', '$2a$10$6EUtYaoqs5pvCHKlhTwjuuhTlPUARANZ9VBa9q0n4AJkSYlFiJFpq', NULL, '', 'student', '008107895840', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:10.914', '2025-05-20 14:20:10.914', NULL),
(51, 'MARANATHA', 'FERNANDEZ', 'maranathafernandez@ncnhs.edu.ph', '$2a$10$rzyEFFiES3bK1jHL7i.6tegPeZxo3Pgq.10DjA1dhLokNhdYbpBX.', NULL, '', 'student', '008109739790', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:11.095', '2025-05-20 14:20:11.095', NULL),
(52, 'DESTINEE', 'GUILAS', 'destineeguilas@ncnhs.edu.ph', '$2a$10$JyyntILfc/S/IYyy21gjKesA9ZSlBLPOY1GBtRkWvCnigcV6afeBu', NULL, '', 'student', '008111517380', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:11.273', '2025-05-20 14:20:11.273', NULL),
(53, 'SABINA', 'NAPALAN', 'sabinanapalan@ncnhs.edu.ph', '$2a$10$yhY7jtIBFbsFEVlt6/lcRu1.8n1emQ1Y8eoJzIWnhwnB32l0tGMhy', NULL, '', 'student', '008113408300', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:11.459', '2025-05-20 14:20:11.459', NULL),
(54, 'ASHLEY', 'NIDUAZA', 'ashleyniduaza@ncnhs.edu.ph', '$2a$10$n41St1DHGCbnniV3wuk3rOqSX.ReK86cq1GlUKR5HPJmMgDVXFDfa', NULL, '', 'student', '008115165410', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:11.636', '2025-05-20 14:20:11.636', NULL),
(55, 'CRYSTAL', 'QUIOCSON', 'crystalquiocson@ncnhs.edu.ph', '$2a$10$Dc6PX6wZHHxj1Z/5Tln6LeN8zQ1ZtErJqULfqFvMBTvKKz963a4sy', NULL, '', 'student', '008117064330', 10, 'FAITH', NULL, NULL, '2025-05-20 14:20:11.828', '2025-05-20 14:20:11.828', NULL),
(56, 'FATMA', 'ABDULRAZZAQ', 'fatmaabdulrazzaq@ncnhs.edu.ph', '$2a$10$sP2IQ8PaXeWnybO6K50nCelhkoi0yYYnGjoduOGfc/zh5rUk2quZW', NULL, '', 'student', '008118906280', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:20:12.011', '2025-05-20 14:20:12.011', NULL),
(57, 'JENELLA', 'DIZON', 'jenelladizon@ncnhs.edu.ph', '$2a$10$.FA6JCZH.5O3SKv30plSO.XUj7NFYImzx8U3Fs0jQLlxshyilAAuq', NULL, '', 'student', '008120718790', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:20:12.189', '2025-05-20 14:20:12.189', NULL),
(58, 'JAQUELINE', 'GARCIA', 'jaquelinegarcia@ncnhs.edu.ph', '$2a$10$Nw8HlywznsgTSzbxsET8b.D5WTsI1.ckxPdxooR1DWlQ/gBCZ1vvO', NULL, '', 'student', '008122576820', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:20:12.377', '2025-05-20 14:20:12.377', NULL),
(59, 'ASHLEY', 'MACASANG', 'ashleymacasang@ncnhs.edu.ph', '$2a$10$G/VmOjaci5ZSfqBfE9w49elhr0Bee.G3ayYtb.0CB/vslrflPucRe', NULL, '', 'student', '008124334880', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:20:12.552', '2025-05-20 14:20:12.552', NULL),
(60, 'MA', 'QUILAQUIL', 'maquilaquil@ncnhs.edu.ph', '$2a$10$gPN45u9ZD7drhxFw1cHHEucYjZACbFrvGxvFXEzMPPS9NeNSLLzhm', NULL, '', 'student', '008126085690', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:20:12.729', '2025-05-20 14:20:12.729', NULL),
(61, 'REEMA', 'TOLENTINO', 'reematolentino@ncnhs.edu.ph', '$2a$10$HrOUjDzfiS8QefJfTLhsLOM7fYnvABmDPIn94Sqdhql/pX6grlDP2', NULL, '', 'student', '008127919620', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:20:12.915', '2025-05-20 14:20:12.915', NULL),
(62, 'JAMAICA', 'VELASCO', 'jamaicavelasco@ncnhs.edu.ph', '$2a$10$Wp4rOB8RDXxcEhDlXYHTfe2kExP1zaFUk6EPvm07bbQTKyHrzSdTi', NULL, '', 'student', '008129702840', 10, 'COURAGE', NULL, NULL, '2025-05-20 14:20:13.089', '2025-05-20 14:20:13.089', NULL),
(63, 'NOAH', 'LOGRONIO', 'noahlogronio@ncnhs.edu.ph', '$2a$10$MLiDAqgU2M8N964aD7PCOuToTqA9W2dXMserj7iu/EScOEIoPl0b.', NULL, '', 'student', '909720795080', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:22:52.208', '2025-05-20 14:22:52.208', NULL),
(64, 'EARL ANDREI', 'BAUTISTA', 'earlandreibautista@ncnhs.edu.ph', '$2a$10$SK9pSM8Ir3Uz1bch6StoUeG/udQmOxoX762Pzonk7vCsoZhNhAr7y', NULL, '', 'student', '909722693470', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:52.387', '2025-05-20 14:22:52.387', NULL),
(65, 'JOHN R.', 'CUSTAN', 'johnr.custan@ncnhs.edu.ph', '$2a$10$q61rbz8xZvy2LpSxVaWAru2ePWy8Ot0BurG8zZ6ULsiaTuM5062pK', NULL, '', 'student', '909724442950', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:52.564', '2025-05-20 14:22:52.564', NULL),
(66, 'JASPER M.', 'FABELA', 'jasperm.fabela@ncnhs.edu.ph', '$2a$10$JPUF56bUhpPYlwxiOKI.ouYim6ux4MTClu4FYPyV4YGcxt.uy0AXu', NULL, '', 'student', '909726266180', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:52.747', '2025-05-20 14:22:52.747', NULL),
(67, 'MICHAEL ALEXIUS', 'GUTIERREZ', 'michaelalexiusgutierrez@ncnhs.edu.ph', '$2a$10$IlwoF8z6ZJwd5FjxKWjN1OnM/yGqnuBJsTHenHZ5/X7jceVm.1Gqi', NULL, '', 'student', '909728038460', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:52.923', '2025-05-20 14:22:52.923', NULL),
(68, 'JOHN MANUEL  H.', 'JAVIER', 'johnmanuelh.javier@ncnhs.edu.ph', '$2a$10$7mkUwIwdN0F6yeDyeF./OuQ7TGwrOkkKd4OemeX82XzFoN3Bd2DNW', NULL, '', 'student', '909729867970', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:53.104', '2025-05-20 14:22:53.104', NULL),
(69, 'CHRIS JOHN', 'PORCA', 'chrisjohnporca@ncnhs.edu.ph', '$2a$10$/ZwbDkn6eA0PVbheao0f2eUI0hNO3QUKbCn.LRK8/5QJHpf2cPY8y', NULL, '', 'student', '909731649360', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:53.289', '2025-05-20 14:22:53.289', NULL),
(70, 'PRINCE CARL A.', 'SAGA', 'princecarla.saga@ncnhs.edu.ph', '$2a$10$KAc0dX1QI2.2yYwszuBNn..ResWxGFSnZyzYjxkUBZSTnP8T.SzFm', NULL, '', 'student', '909733536500', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:53.476', '2025-05-20 14:22:53.476', NULL),
(71, 'SIANHTEL B.', 'WRIGHT', 'sianhtelb.wright@ncnhs.edu.ph', '$2a$10$JBES0dlthkEfcohtEd1A.eaLSDS6fhoQuj50.Gnl2DW8uk0AKvzJq', NULL, '', 'student', '909735376380', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:22:53.656', '2025-05-20 14:22:53.656', NULL),
(72, 'JUGATAN', 'BAUTISTA', 'jugatanbautista@ncnhs.edu.ph', '$2a$10$TXqy8KZ1E8/kh/jrDK4O9.HcLGPNsw4BoWcUCvH3ChAWQH2AreORC', NULL, '', 'student', '912164929620', 9, 'ADELFA', NULL, NULL, '2025-05-20 14:26:56.625', '2025-05-20 14:26:56.625', NULL),
(73, 'RAVER', 'BAUTISTA', 'raverbautista@ncnhs.edu.ph', '$2a$10$SshEtJK66HpVNy2kITOn5OEeIpl2S1MMpOOzdCH4rzQXhAHXcFVQ.', NULL, '', 'student', '912166823160', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:56.804', '2025-05-20 14:26:56.804', NULL),
(74, 'SHANELLE', 'BAGGAY', 'shanellebaggay@ncnhs.edu.ph', '$2a$10$cvAq0gyyVZxbm5skYfFflei7dQxH.boMeLUPygVuqo25VX0ewFTzK', NULL, '', 'student', '912168654030', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:56.989', '2025-05-20 14:26:56.989', NULL),
(75, 'ROBE', 'BAUTISTA', 'robebautista@ncnhs.edu.ph', '$2a$10$fJuuKLAeRbyVIvDLxFFjJOW0tP4viBn2MQ3ftJWZGzVoF5iroBrdW', NULL, '', 'student', '912170451560', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:57.168', '2025-05-20 14:26:57.168', NULL),
(76, 'BRAIDEN', 'ELEJORDE', 'braidenelejorde@ncnhs.edu.ph', '$2a$10$G90sB7Qc49y/0SGvnlN.C.mVpGpdthBowRTEhr70tz7gc.15efPsC', NULL, '', 'student', '912172233870', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:57.348', '2025-05-20 14:26:57.348', NULL),
(77, 'DOMERICK', 'GABRIEL', 'domerickgabriel@ncnhs.edu.ph', '$2a$10$5ZigeTbDFjvPDCHWJ8Qx6.8P3cqnNfXMlL4/8UkXRJBMHfcTfgFsi', NULL, '', 'student', '912174100660', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:57.534', '2025-05-20 14:26:57.534', NULL),
(78, 'MJ', 'LIBUARD', 'mjlibuard@ncnhs.edu.ph', '$2a$10$WzrJZW.jbcOVRGu3QdGQtOiCXfGOZa05a1OkKhYkvz3l7yYbGKk8C', NULL, '', 'student', '912175994540', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:57.725', '2025-05-20 14:26:57.725', NULL),
(79, 'JAYRALD', 'MONESIT', 'jayraldmonesit@ncnhs.edu.ph', '$2a$10$YS.e1Jv9MpWt3NyZV0vVm.ryfXw1da0iHdvWDI53W.ehuiBq8immq', NULL, '', 'student', '912177827030', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:57.903', '2025-05-20 14:26:57.903', NULL),
(80, 'JC', 'PATAYAN', 'jcpatayan@ncnhs.edu.ph', '$2a$10$JZZSC8MJbskSDxyhb9hG2e1l1hBi9INyvG///Sojavv2aA9QBP9Uu', NULL, '', 'student', '912179663440', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:58.114', '2025-05-20 14:26:58.114', NULL),
(81, 'MARK', 'SALAZAR', 'marksalazar@ncnhs.edu.ph', '$2a$10$t3Xxo4qo0qX3ywkn0fVXbOWxZPJ26wivEIaKh9Tof0gNB83qu2m.e', NULL, '', 'student', '912181733260', 9, 'LILY', NULL, NULL, '2025-05-20 14:26:58.292', '2025-05-20 14:26:58.292', NULL),
(90, 'ALIAH', 'DE GUZMAN', 'aliahdeguzman@ncnhs.edu.ph', '$2a$10$JtztijNxWdA8lmHdApJwNe1vfGe8obAMcL8LihbOHd7PPC643tB9.', NULL, '', 'student', '912576670830', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:37.787', '2025-05-20 14:27:37.787', NULL),
(91, 'CHELYNNE', 'LANDERO', 'chelynnelandero@ncnhs.edu.ph', '$2a$10$ZGZfqzt7OeYKi7OTYeA1qeJdZO6OvAk5b8xJUI48u7fyWyBhVP36C', NULL, '', 'student', '912578432400', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:37.963', '2025-05-20 14:27:37.963', NULL),
(92, 'JASMINE', 'MERRO', 'jasminemerro@ncnhs.edu.ph', '$2a$10$XdZrXi35yo4npYJUNprLleGM7kpSyugWZT.nZIusZz6wgm6mZh6Aa', NULL, '', 'student', '912580316410', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:38.149', '2025-05-20 14:27:38.149', NULL),
(93, 'ANIKA', 'PELONIO', 'anikapelonio@ncnhs.edu.ph', '$2a$10$k1r9ICjFFgH8KM8W4OS1cu0pQzd9Pm7WrnqgjPnINmtgLnY7TYJ4a', NULL, '', 'student', '912582105330', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:38.328', '2025-05-20 14:27:38.328', NULL),
(94, 'AKIA', 'SALAZAR', 'akiasalazar@ncnhs.edu.ph', '$2a$10$ma2xhI1Fh34WXXRMwvJMrORrKK9iQQOtaTbHYuY9H0e8WCIFtaTrq', NULL, '', 'student', '912583852090', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:38.502', '2025-05-20 14:27:38.502', NULL),
(95, 'MERRIEL', 'SALAZAR', 'merrielsalazar@ncnhs.edu.ph', '$2a$10$a5zVQAtn6qq/A0eIC6wYBeFdlMfW/dOV1KxbFnua6JqcqPU1Ig/ee', NULL, '', 'student', '912585609740', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:38.680', '2025-05-20 14:27:38.680', NULL),
(96, 'PRINCESS', 'STO', 'princesssto@ncnhs.edu.ph', '$2a$10$RONXcTpxxCmwaMaK30ecgu23xF0ri/EhyB7Q.2ETGIQTXMvxlhn8m', NULL, '', 'student', '912587484060', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:38.869', '2025-05-20 14:27:38.869', NULL),
(97, 'ZAIRYLL', 'PAGUIO', 'zairyllpaguio@ncnhs.edu.ph', '$2a$10$WqiouqyJgj7Ev16NzTq3x.QcGS.XwfYSNZRvna3FwedwZ0nnjOjIy', NULL, '', 'student', '912589325840', 9, 'CAMIA', NULL, NULL, '2025-05-20 14:27:39.053', '2025-05-20 14:27:39.053', NULL),
(112, 'JOHN', 'FERNANDEZ', 'johnfernandez@ncnhs.edu.ph', '$2a$10$cxM2xAiz51dPVTLQNWzgUO/UhWp78LxnJ.lcE3J1YCDLrPTi.i/PW', NULL, '', 'student', '920032127433', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:05.913', '2025-05-20 14:40:05.913', NULL),
(113, 'JOMEL', 'GLEPONIO', 'jomelgleponio@ncnhs.edu.ph', '$2a$10$xxmHGbRqDCDnENu1TvDeueodDicqGqEfIaIvYjzGxGegx9xrPd9Wm', NULL, '', 'student', '920059783530', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:06.105', '2025-05-20 14:40:06.105', NULL),
(114, 'JUSTIN', 'MENDOZA', 'justinmendoza@ncnhs.edu.ph', '$2a$10$HNG5rNypDoozDgR58g9EBe/J8Ir1ukgf6gBhvfZbjoCiQ.4E6zQie', NULL, '', 'student', '920061640550', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:06.289', '2025-05-20 14:40:06.289', NULL),
(115, 'CHRIS', 'PAAT', 'chrispaat@ncnhs.edu.ph', '$2a$10$gOSF1tFdk5s9gH0tVuX1Ku9LD6wEHCv3vvORENcE3bixL7q7DXphC', NULL, '', 'student', '920063476260', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:06.472', '2025-05-20 14:40:06.472', NULL),
(116, 'JAYBERT', 'PALAÑA', 'jaybertpalaña@ncnhs.edu.ph', '$2a$10$Tq0gtlPDyICDlKwsPMWhbuKmqhmSjmGuhWp8Q2x5UnPBnBL8sgCqK', NULL, '', 'student', '920065311950', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:06.668', '2025-05-20 14:40:06.668', NULL),
(117, 'ZEN', 'REYES', 'zenreyes@ncnhs.edu.ph', '$2a$10$ssq7Y5bSqva0O.gRUrbPCuFfKSzQNIqYf9pAoVQqj7eeQLfhhHriO', NULL, '', 'student', '920067319430', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:06.853', '2025-05-20 14:40:06.853', NULL),
(118, 'MARK', 'TAGAYONG', 'marktagayong@ncnhs.edu.ph', '$2a$10$FBlWmrJuDFPGURFNR/LEoeZZkhQouSKCoaScIfh9UQzLkA/bMak1S', NULL, '', 'student', '920069156740', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:07.039', '2025-05-20 14:40:07.039', NULL),
(119, 'LANZ', 'YAP', 'lanzyap@ncnhs.edu.ph', '$2a$10$abRWC.tnT2/vEyUtFRhlU.KjCHRfdvm1fEQ75sMRG.gYbumkg.P.O', NULL, '', 'student', '920071000860', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:40:07.273', '2025-05-20 14:40:07.273', NULL),
(147, 'AHYESSA', 'MENES', 'ahyessamenes@ncnhs.edu.ph', '$2a$10$9sCjo8.S1Z9oMnpylAFbDe3.D26pFm37OAYWsAlUjXB3/cesdF90W', NULL, '', 'student', '926741505800', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:51:14.278', '2025-05-20 14:51:14.278', NULL),
(148, 'FAITH', 'QUIAMBAO', 'faithquiambao@ncnhs.edu.ph', '$2a$10$crp4uU2yJDlA6tAHdD64kOc/MgY9uW8E04GDbyEgq506nQ1IpKDsy', NULL, '', 'student', '926743490770', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:51:14.474', '2025-05-20 14:51:14.474', NULL),
(149, 'MARIELINE', 'RAMOS', 'marielineramos@ncnhs.edu.ph', '$2a$10$RtT.9KXqkkbBKRLSr3HPmuXLFd7NWPJSR4iJBpcxO7prVlC7QHA4W', NULL, '', 'student', '926745323660', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:51:14.658', '2025-05-20 14:51:14.658', NULL),
(150, 'JANMIEN', 'SILVANO', 'janmiensilvano@ncnhs.edu.ph', '$2a$10$YwJlX6dI3ZbOWRCEBNb0Q..3Prvsb4b2VAxdV5ytJM6O0I97TCCca', NULL, '', 'student', '926747156990', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:51:14.835', '2025-05-20 14:51:14.835', NULL),
(151, 'MIRALYN', 'SOLEDAD', 'miralynsoledad@ncnhs.edu.ph', '$2a$10$ly69KHD9rf6qfhr68qWTduvW0ukPC83mm8Fn0FkIf.HkJYt1nfVPi', NULL, '', 'student', '926748991670', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:51:15.022', '2025-05-20 14:51:15.022', NULL),
(152, 'RIAMME', 'VINOYA', 'riammevinoya@ncnhs.edu.ph', '$2a$10$yebpnwD/0hN331dsrZtXKOREWeyrPmofx79ydN.bHN6rQF0CMkUO2', NULL, '', 'student', '926750830320', 9, 'BLUEBELL', NULL, NULL, '2025-05-20 14:51:15.205', '2025-05-20 14:51:15.205', NULL),
(153, 'MICAPRIL', 'ACHIVIDA', 'micaprilachivida@ncnhs.edu.ph', '$2a$10$PAb.azC/krn5LxnchjRpx.cp2bOa4aFy73QZhdi6xRK10Mw45ieuu', NULL, '', 'student', '926752660620', 9, 'LILY', NULL, NULL, '2025-05-20 14:51:15.393', '2025-05-20 14:51:15.393', NULL),
(154, 'EVE', 'ABAD', 'eveabad@ncnhs.edu.ph', '$2a$10$B2PqNf3yXPdWNbo1Ymi6FeFryw2LozFPtVDbwm./TCQ5edeVhokZi', NULL, '', 'student', '926754501700', 9, 'LILY', NULL, NULL, '2025-05-20 14:51:15.572', '2025-05-20 14:51:15.572', NULL),
(155, 'NICAEL', 'CASER', 'nicaelcaser@ncnhs.edu.ph', '$2a$10$f2jc0P7.dN7WC/j9HUZJiOLAQ5CieB5g4SIL4nIz3YH81TClP5VzG', NULL, '', 'student', '926756332110', 9, 'LILY', NULL, NULL, '2025-05-20 14:51:15.754', '2025-05-20 14:51:15.754', NULL),
(156, 'ASHELYNE', 'CENDAÑA', 'ashelynecendaña@ncnhs.edu.ph', '$2a$10$QOwn8E63yYcaj0ZlsMpKH.eYndz4wWOFf6OFHtZiKxlJU9kqbAmBy', NULL, '', 'student', '926758176390', 9, 'LILY', NULL, NULL, '2025-05-20 14:51:15.943', '2025-05-20 14:51:15.943', NULL),
(157, 'LHAYZIE', 'CONTRERAS', 'lhayziecontreras@ncnhs.edu.ph', '$2a$10$0yYELEgtT09J84VZNBz4JupIxyDVoOrO13b3ioFrkKvKgUzCDLIg.', NULL, '', 'student', '926760023780', 9, 'LILY', NULL, NULL, '2025-05-20 14:51:16.142', '2025-05-20 14:51:16.142', NULL),
(158, 'RHIANNAH JOY P', 'DELMONTE', 'rhiannahjoypdelmonte@ncnhs.edu.ph', '$2a$10$dE0inpnELzwMLBiP/6XmgePMUgyafWTiD4vzTrKOR0Jjn3FdempTm', NULL, '', 'student', '927961708550', 9, 'LILY', NULL, NULL, '2025-05-20 14:53:16.304', '2025-05-20 14:53:16.304', NULL),
(159, 'MAFAE SOPHIA I', 'LUNA', 'mafaesophiailuna@ncnhs.edu.ph', '$2a$10$FvmLYZsqLGh/gr1ny.F.0u62t.hEFlgrMGDnDN4zFTGbnWirPQea6', NULL, '', 'student', '927963638610', 9, 'LILY', NULL, NULL, '2025-05-20 14:53:16.482', '2025-05-20 14:53:16.482', NULL),
(160, 'ISABEL GIANE L', 'NIDUAZA', 'isabelgianelniduaza@ncnhs.edu.ph', '$2a$10$2fc4FbcxAazILXPCwV1pKexvKf0NeI84Ri7tXsz3au4KD5toK7nrC', NULL, '', 'student', '927965409770', 9, 'LILY', NULL, NULL, '2025-05-20 14:53:16.660', '2025-05-20 14:53:16.660', NULL),
(161, 'ANGEL ROAN S', 'PASUBILLO', 'angelroanspasubillo@ncnhs.edu.ph', '$2a$10$rtWWkFD7zuDwQMi8hc5I7OPzsmt1sIEFwcofXt8x.TOWroxMVldrC', NULL, '', 'student', '927967302300', 9, 'LILY', NULL, NULL, '2025-05-20 14:53:16.848', '2025-05-20 14:53:16.848', NULL),
(162, 'LOVE JANE', 'SAYSON', 'lovejanesayson@ncnhs.edu.ph', '$2a$10$5xmN1K2Z/pJQ8.DndkQttuiZuP7/OQycnzwMQlQHNia6ZEfSaw5ua', NULL, '', 'student', '927969139900', 9, 'LILY', NULL, NULL, '2025-05-20 14:53:17.032', '2025-05-20 14:53:17.032', NULL),
(163, 'SHELLA M', 'VINOYA', 'shellamvinoya@ncnhs.edu.ph', '$2a$10$ScXTB4Tf/NYlaPlJPHjaNuBJD.xdIm..4OD7eEQePp57dfMTg12WC', NULL, '', 'student', '927970973930', 9, 'LILY', NULL, NULL, '2025-05-20 14:53:17.215', '2025-05-20 14:53:17.215', NULL),
(164, 'BIANCA MAY', 'MARTINEZ', 'biancamaymartinez@ncnhs.edu.ph', '$2a$10$rNDDckpowFeW9GhM.MA9CujeG1N1r46czZTnIzN00FGV9yn4AwoTC', NULL, '', 'student', '927972809150', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:53:17.398', '2025-05-20 14:53:17.398', NULL),
(165, 'MERLYN M', 'MATIAS', 'merlynmmatias@ncnhs.edu.ph', '$2a$10$L2AZobie8C3gJnys04Lb3OC4LBPTfZNJgUhLaD0k7gF7IuUzkJiOu', NULL, '', 'student', '927974646720', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:53:17.587', '2025-05-20 14:53:17.587', NULL),
(166, 'JASMINE JANE A', 'MENDOZA', 'jasminejaneamendoza@ncnhs.edu.ph', '$2a$10$I2ggR/uLAusAmobNjwImteexLVZ9QkqvTu2vbc.Sv0.07KHmzt1Na', NULL, '', 'student', '927976484920', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:53:17.769', '2025-05-20 14:53:17.769', NULL),
(167, 'NOSHAIVA T', 'MOHAMAD', 'noshaivatmohamad@ncnhs.edu.ph', '$2a$10$07V1DYt/5QqhCE0MVeu5y.UYWEkHIzLmuIrqQXSgPpy2JQ2OxmqTu', NULL, '', 'student', '927978322870', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:53:17.963', '2025-05-20 14:53:17.963', NULL),
(180, 'JOVILYN', 'PAGARIGAN', 'jovilynpagarigan@ncnhs.edu.ph', '$2a$10$deS2SMcFCbe1NGmLDQQvdu076tsfrorup1BhmjsPRCQIOm/gpNqO6', NULL, '', 'student', '930881869980', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:58:08.316', '2025-05-20 14:58:08.316', NULL),
(181, 'WINNIE', 'PANGONILLO', 'winniepangonillo@ncnhs.edu.ph', '$2a$10$djuRx9LxChF/jcnaB90k5OjSKK.3nlXbGYfniTnWpORBK.4hPTbNO', NULL, '', 'student', '930883818200', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:58:08.504', '2025-05-20 14:58:08.504', NULL),
(182, 'MIKEE', 'TAGUBERI', 'mikeetaguberi@ncnhs.edu.ph', '$2a$10$i3lmqkmEzIxbQb75/bsdj.DBGCMTmBt.0NLeyTV0zHtbMah8rTBZi', NULL, '', 'student', '930885644630', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:58:08.688', '2025-05-20 14:58:08.688', NULL),
(183, 'KATHLEEN', 'TRAPSI', 'kathleentrapsi@ncnhs.edu.ph', '$2a$10$A6r.8sfdfNIXMh8Tj8EdEOmeGnrj6AFuytlPcbTxa0xOtlEN7tTMm', NULL, '', 'student', '930887488090', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:58:08.872', '2025-05-20 14:58:08.872', NULL),
(184, 'HANNAH', 'TURNO', 'hannahturno@ncnhs.edu.ph', '$2a$10$aeJLKgk9AXyT9OnxT6Fpq.iVDVEIkYV/ilBA4UJ3APwPO3rfLdvvK', NULL, '', 'student', '930889315350', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:58:09.051', '2025-05-20 14:58:09.051', NULL),
(185, 'JOBILANNE', 'VICENTE', 'jobilannevicente@ncnhs.edu.ph', '$2a$10$TTyRRVcRGwji00IOUBOls.Zz.adMR8Dtvu1wWDy05yeL.lKS39M/.', NULL, '', 'student', '930891158170', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:58:09.237', '2025-05-20 14:58:09.237', NULL),
(186, 'CHELSIE', 'VILLANUEVA', 'chelsievillanueva@ncnhs.edu.ph', '$2a$10$YBUkNx8x2Txx1CzbAsorpeDVJYmBDxTuC724lUQPcVLksR/87xqIi', NULL, '', 'student', '930892917930', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:58:09.414', '2025-05-20 14:58:09.414', NULL),
(187, 'HANNAH NICOLE ', 'MORE', 'hannahnicolemore@ncnhs.edu.ph', '$2a$10$VtTEgsNrCFeTMVcnV/2cN.wU0lxDcg5lYCwR9ONBmpqqhRnvPhmxi', NULL, '123', 'student', '12345', 9, 'KERRIA', NULL, NULL, '2025-05-20 14:59:32.928', '2025-05-20 14:59:32.928', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('1820f864-94e2-4abd-a95e-0589c21b6e01', '3dabffa3449583487f0e85cc6992cd3119d179e65b2ed278432dc9773d8f47bf', '2025-05-20 13:46:04.760', '20250504152358_dawdaw', NULL, NULL, '2025-05-20 13:46:04.732', 1),
('21f936ef-9971-4189-852a-aff420c00e83', '86a5d7f696be432e59ae3ad4f639070a5499e3314632da985a9d5342e222c7d1', '2025-05-20 13:46:04.695', '20250408172843_khjfguikfujkfgv', NULL, NULL, '2025-05-20 13:46:04.580', 1),
('4dd9b9a7-ea46-48bf-87bb-699f33d7e514', 'e389ee5bd36623d42d4c39acb3edba2c18acffb6c3eaad4ee19d3f030068e75b', '2025-05-20 13:46:12.981', '20250520134612_new', NULL, NULL, '2025-05-20 13:46:12.934', 1),
('60abe907-c41c-40fe-987e-f506cca1f91e', 'ce7bf7dfa1d4359956350a697ea54f958e7ef422b5399b303cd8c9bb8a9159ad', '2025-05-20 13:46:04.719', '20250408173756_wdadwa', NULL, NULL, '2025-05-20 13:46:04.709', 1),
('77255ddc-dbda-4575-8a2d-d2ecd68ecde3', 'c07d82cc3ff2de100da1e526efc02d47b100b54a0f87543c28fb881ebf6ce66c', '2025-05-20 13:46:04.707', '20250408173154_', NULL, NULL, '2025-05-20 13:46:04.697', 1),
('78157c4f-d48c-4009-8908-a6564a6bdecc', 'd4f10a48c55d1fe4afe32c9c875119037a57af4d14eaa6ac06b5bce7d2c6acbf', '2025-05-20 13:46:04.730', '20250417124228_', NULL, NULL, '2025-05-20 13:46:04.721', 1),
('dd620320-4bc5-4fc4-8dd1-4a33acf12b39', '6a013c65660a2f9877a68483b82afbb7017f2efefbaa644c809dc393a17baf70', '2025-05-20 13:46:04.578', '20250408171434_dfawdaw', NULL, NULL, '2025-05-20 13:46:02.907', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `componentsettings`
--
ALTER TABLE `componentsettings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ComponentSettings_role_componentPath_key` (`role`,`componentPath`);

--
-- Indexes for table `exam`
--
ALTER TABLE `exam`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Exam_testCode_key` (`testCode`),
  ADD KEY `Exam_userId_fkey` (`userId`);

--
-- Indexes for table `examaccess`
--
ALTER TABLE `examaccess`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ExamAccess_examId_grade_section_key` (`examId`,`grade`,`section`);

--
-- Indexes for table `examanswer`
--
ALTER TABLE `examanswer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ExamAnswer_examId_userId_questionId_key` (`examId`,`userId`,`questionId`),
  ADD KEY `ExamAnswer_userId_fkey` (`userId`),
  ADD KEY `ExamAnswer_questionId_fkey` (`questionId`);

--
-- Indexes for table `gradesection`
--
ALTER TABLE `gradesection`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `GradeSection_grade_section_key` (`grade`,`section`);

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Question_examId_fkey` (`examId`);

--
-- Indexes for table `questionbank`
--
ALTER TABLE `questionbank`
  ADD PRIMARY KEY (`id`),
  ADD KEY `QuestionBank_createdBy_fkey` (`createdBy`),
  ADD KEY `QuestionBank_folderId_fkey` (`folderId`);

--
-- Indexes for table `questionbankfolder`
--
ALTER TABLE `questionbankfolder`
  ADD PRIMARY KEY (`id`),
  ADD KEY `QuestionBankFolder_createdBy_fkey` (`createdBy`);

--
-- Indexes for table `score`
--
ALTER TABLE `score`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Score_userId_examId_key` (`userId`,`examId`),
  ADD KEY `Score_examId_fkey` (`examId`);

--
-- Indexes for table `sectionsubject`
--
ALTER TABLE `sectionsubject`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SectionSubject_grade_section_subjectId_key` (`grade`,`section`,`subjectId`),
  ADD KEY `SectionSubject_subjectId_fkey` (`subjectId`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Subject_code_key` (`code`);

--
-- Indexes for table `subjecttask`
--
ALTER TABLE `subjecttask`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SubjectTask_subjectId_fkey` (`subjectId`),
  ADD KEY `SubjectTask_teacherId_fkey` (`teacherId`);

--
-- Indexes for table `survey`
--
ALTER TABLE `survey`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Survey_code_key` (`code`),
  ADD KEY `Survey_userId_fkey` (`userId`);

--
-- Indexes for table `surveyanswer`
--
ALTER TABLE `surveyanswer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SurveyAnswer_responseId_fkey` (`responseId`),
  ADD KEY `SurveyAnswer_questionId_fkey` (`questionId`);

--
-- Indexes for table `surveyquestion`
--
ALTER TABLE `surveyquestion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SurveyQuestion_surveyId_fkey` (`surveyId`);

--
-- Indexes for table `surveyresponse`
--
ALTER TABLE `surveyresponse`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SurveyResponse_surveyId_fkey` (`surveyId`);

--
-- Indexes for table `taskfile`
--
ALTER TABLE `taskfile`
  ADD PRIMARY KEY (`id`),
  ADD KEY `TaskFile_taskId_fkey` (`taskId`),
  ADD KEY `TaskFile_submissionId_fkey` (`submissionId`);

--
-- Indexes for table `tasksubmission`
--
ALTER TABLE `tasksubmission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `TaskSubmission_taskId_fkey` (`taskId`),
  ADD KEY `TaskSubmission_studentId_fkey` (`studentId`);

--
-- Indexes for table `taskvisibility`
--
ALTER TABLE `taskvisibility`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TaskVisibility_taskId_studentId_key` (`taskId`,`studentId`),
  ADD KEY `TaskVisibility_studentId_fkey` (`studentId`);

--
-- Indexes for table `teachersubject`
--
ALTER TABLE `teachersubject`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TeacherSubject_teacherId_subjectId_key` (`teacherId`,`subjectId`),
  ADD KEY `TeacherSubject_subjectId_fkey` (`subjectId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_lrn_key` (`lrn`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `componentsettings`
--
ALTER TABLE `componentsettings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam`
--
ALTER TABLE `exam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examaccess`
--
ALTER TABLE `examaccess`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examanswer`
--
ALTER TABLE `examanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gradesection`
--
ALTER TABLE `gradesection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `questionbank`
--
ALTER TABLE `questionbank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `questionbankfolder`
--
ALTER TABLE `questionbankfolder`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `score`
--
ALTER TABLE `score`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sectionsubject`
--
ALTER TABLE `sectionsubject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjecttask`
--
ALTER TABLE `subjecttask`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey`
--
ALTER TABLE `survey`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `surveyanswer`
--
ALTER TABLE `surveyanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `surveyquestion`
--
ALTER TABLE `surveyquestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `surveyresponse`
--
ALTER TABLE `surveyresponse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taskfile`
--
ALTER TABLE `taskfile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasksubmission`
--
ALTER TABLE `tasksubmission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taskvisibility`
--
ALTER TABLE `taskvisibility`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachersubject`
--
ALTER TABLE `teachersubject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=188;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exam`
--
ALTER TABLE `exam`
  ADD CONSTRAINT `Exam_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `examaccess`
--
ALTER TABLE `examaccess`
  ADD CONSTRAINT `ExamAccess_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exam` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `examanswer`
--
ALTER TABLE `examanswer`
  ADD CONSTRAINT `ExamAnswer_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exam` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ExamAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ExamAnswer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `Question_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exam` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `questionbank`
--
ALTER TABLE `questionbank`
  ADD CONSTRAINT `QuestionBank_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `QuestionBank_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `questionbankfolder` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `questionbankfolder`
--
ALTER TABLE `questionbankfolder`
  ADD CONSTRAINT `QuestionBankFolder_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `score`
--
ALTER TABLE `score`
  ADD CONSTRAINT `Score_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exam` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Score_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sectionsubject`
--
ALTER TABLE `sectionsubject`
  ADD CONSTRAINT `SectionSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subjecttask`
--
ALTER TABLE `subjecttask`
  ADD CONSTRAINT `SubjectTask_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `SubjectTask_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `survey`
--
ALTER TABLE `survey`
  ADD CONSTRAINT `Survey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `surveyanswer`
--
ALTER TABLE `surveyanswer`
  ADD CONSTRAINT `SurveyAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `surveyquestion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `SurveyAnswer_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `surveyresponse` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `surveyquestion`
--
ALTER TABLE `surveyquestion`
  ADD CONSTRAINT `SurveyQuestion_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `survey` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `surveyresponse`
--
ALTER TABLE `surveyresponse`
  ADD CONSTRAINT `SurveyResponse_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `survey` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `taskfile`
--
ALTER TABLE `taskfile`
  ADD CONSTRAINT `TaskFile_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `tasksubmission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TaskFile_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `subjecttask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tasksubmission`
--
ALTER TABLE `tasksubmission`
  ADD CONSTRAINT `TaskSubmission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TaskSubmission_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `subjecttask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `taskvisibility`
--
ALTER TABLE `taskvisibility`
  ADD CONSTRAINT `TaskVisibility_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TaskVisibility_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `subjecttask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `teachersubject`
--
ALTER TABLE `teachersubject`
  ADD CONSTRAINT `TeacherSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TeacherSubject_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
