-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2025 at 09:11 PM
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
-- Table structure for table `exam`
--

CREATE TABLE `exam` (
  `id` int(11) NOT NULL,
  `testCode` varchar(191) NOT NULL,
  `classCode` varchar(191) NOT NULL,
  `examTitle` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isDraft` tinyint(1) NOT NULL DEFAULT 1,
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam`
--

INSERT INTO `exam` (`id`, `testCode`, `classCode`, `examTitle`, `status`, `userId`, `createdAt`, `isDraft`, `updatedAt`) VALUES
(1, 'HELLO', 'HELLO', 'HELLO', 'stopped', 3, '2025-03-11 18:08:38.630', 0, '2025-03-12 19:29:02.706'),
(3, 'PROG101', 'PROG', 'PROGRAMMING TEST', 'stopped', 3, '2025-03-02 07:17:41.502', 0, '2025-03-08 17:54:03.368'),
(4, 'PROG102', 'PROG', 'PROGRAMMING TEST VERSION 2', 'pending', 3, '2025-03-02 07:32:41.938', 0, '2025-03-02 07:32:41.938'),
(5, 'PROG103', 'PROG', 'Programming Fundamentals Assessment', 'stopped', 3, '2025-03-02 15:44:57.662', 0, '2025-03-12 20:07:43.620');

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

--
-- Dumping data for table `examaccess`
--

INSERT INTO `examaccess` (`id`, `examId`, `grade`, `section`, `isEnabled`) VALUES
(7, 1, 10, 'PRUDENCE', 1),
(8, 1, 7, 'ROSE', 1),
(9, 5, 7, 'ROSE', 1);

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

--
-- Dumping data for table `examanswer`
--

INSERT INTO `examanswer` (`id`, `examId`, `questionId`, `userAnswer`, `isCorrect`, `submittedAt`, `userId`) VALUES
(1, 1, 4, 'test2', 0, '2025-03-12 19:28:30.066', 2),
(2, 1, 5, 'false', 0, '2025-03-12 19:28:30.073', 2),
(3, 1, 6, 'DW', 0, '2025-03-12 19:28:30.082', 2);

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
(1, 7, 'ROSE', '2025-03-12 18:16:53.337', '2025-03-12 18:16:53.337'),
(2, 10, 'PRUDENCE', '2025-03-12 18:17:03.623', '2025-03-12 18:17:03.623');

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
  `correctAnswer` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `question`
--

INSERT INTO `question` (`id`, `examId`, `questionText`, `questionType`, `options`, `correctAnswer`) VALUES
(4, 1, 'test', 'multipleChoice', '[\"test\",\"test2\"]', 'test'),
(5, 1, 'test', 'true_false', '[\"true\",\"false\"]', 'true'),
(6, 1, 'test', 'enumeration', '[]', 'test'),
(17, 3, 'w', 'multipleChoice', '[\"wdwdw\",\"wdwd\",\"wwdw\",\"wdw\"]', 'wwdw'),
(18, 4, 'what is 1 + 1', 'multipleChoice', '[\"2\",\"3\",\"4\",\"5\"]', '2'),
(19, 4, 'is earth round ', 'true_false', '[\"true\",\"false\"]', 'true'),
(20, 4, 'what the fuck', 'enumeration', '[]', 'wdw'),
(21, 5, 'What does HTML stand for?', 'multipleChoice', '[\"HyperText Markup Language\",\"HighText Machine Language\",\"HyperText Multiple Language\",\"HighText Multiple Language\"]', 'HyperText Markup Language'),
(22, 5, 'Which programming language is known as the \"mother of all languages\"?', 'multipleChoice', '[\"C\",\"Assembly\",\"FORTRAN\",\"COBOL\"]', 'Assembly'),
(23, 5, 'What symbol is used for single-line comments in Python?', 'multipleChoice', '[\"//\",\"#\",\"/*\",\"--\"]', '#'),
(24, 5, 'JavaScript is a case-sensitive language', 'true_false', '[\"true\",\"false\"]', 'true'),
(25, 5, 'What is the correct file extension for Python files?', 'multipleChoice', '[\".py\",\".python\",\".pt\",\".pyt\"]', '.py'),
(26, 5, 'Which of these is not a loop structure?', 'multipleChoice', '[\"for\",\"while\",\"do-while\",\"loop-until\"]', 'loop-until'),
(27, 5, 'RAM stands for Random Access Memory', 'true_false', '[\"true\",\"false\"]', 'true'),
(28, 5, 'List four primitive data types in Java', 'enumeration', '[]', 'int,byte,short,long'),
(29, 5, 'What is the correct operator for equality comparison in JavaScript?', 'multipleChoice', '[\"=\",\"==\",\"===\",\"equals\"]', '==='),
(30, 5, 'Which symbol is used for string concatenation in PHP?', 'multipleChoice', '[\".\",\"&\",\"+\",\"|\"]', '.'),
(31, 5, 'Python is a compiled language', 'true_false', '[\"true\",\"false\"]', 'false'),
(32, 5, 'What does CSS stand for?', 'multipleChoice', '[\"Cascading Style Sheets\",\"Computer Style Sheets\",\"Creative Style Sheets\",\"Colorful Style Sheets\"]', 'Cascading Style Sheets'),
(33, 5, 'Name three popular version control systems', 'enumeration', '[]', 'Git,SVN,Mercurial'),
(34, 5, 'Which operator is used for modulus in most programming languages?', 'multipleChoice', '[\"%\",\"mod\",\"#\",\"@\"]', '%'),
(35, 5, 'Java and JavaScript are the same programming language', 'true_false', '[\"true\",\"false\"]', 'false'),
(36, 5, 'What is the correct way to declare a variable in JavaScript?', 'multipleChoice', '[\"var\",\"let\",\"const\",\"All of the above\"]', 'All of the above'),
(37, 5, 'List four common HTTP methods', 'enumeration', '[]', 'GET,POST,PUT,DELETE'),
(38, 5, 'Which symbol represents the Boolean AND operator in most languages?', 'multipleChoice', '[\"&&\",\"AND\",\"&\",\"|\"]', '&&'),
(39, 5, 'Python uses curly braces for code blocks', 'true_false', '[\"true\",\"false\"]', 'false'),
(40, 5, 'What is the default port for HTTP?', 'multipleChoice', '[\"80\",\"8080\",\"443\",\"3306\"]', '80'),
(41, 5, 'Name three popular frontend frameworks', 'enumeration', '[]', 'React,Angular,Vue'),
(42, 5, 'Which method is used to output text in Python?', 'multipleChoice', '[\"print()\",\"console.log()\",\"echo\",\"System.out.println()\"]', 'print()'),
(43, 5, 'SQL is a programming language', 'true_false', '[\"true\",\"false\"]', 'false'),
(44, 5, 'What does API stand for?', 'multipleChoice', '[\"Application Programming Interface\",\"Advanced Programming Interface\",\"Application Process Integration\",\"Advanced Process Implementation\"]', 'Application Programming Interface'),
(45, 5, 'List four common array methods in JavaScript', 'enumeration', '[]', 'push,pop,shift,unshift'),
(46, 5, 'Which symbol is used for null coalescing in PHP?', 'multipleChoice', '[\"??\",\"||\",\"&&\",\"::\"]', '??'),
(47, 5, 'C++ is an object-oriented language', 'true_false', '[\"true\",\"false\"]', 'true'),
(48, 5, 'What is the correct way to write an IF statement in Python?', 'multipleChoice', '[\"if (x == y)\",\"if x == y:\",\"if x == y then\",\"if (x == y) then\"]', 'if x == y:'),
(49, 5, 'Name three types of SQL joins', 'enumeration', '[]', 'INNER JOIN,LEFT JOIN,RIGHT JOIN'),
(50, 5, 'Which of these is not a valid variable name?', 'multipleChoice', '[\"myVar\",\"_value\",\"123var\",\"$price\"]', '123var'),
(51, 5, 'HTML is a programming language', 'true_false', '[\"true\",\"false\"]', 'false'),
(52, 5, 'What does DOM stand for?', 'multipleChoice', '[\"Document Object Model\",\"Data Object Model\",\"Document Oriented Model\",\"Digital Object Model\"]', 'Document Object Model'),
(53, 5, 'List four common status codes in HTTP', 'enumeration', '[]', '200,201,404,500'),
(54, 5, 'Which operator is used for string interpolation in JavaScript?', 'multipleChoice', '[\"${}`\",\"#{}`\",\"%{}\",\"/{}\"]', '${}`'),
(55, 5, 'PHP is a server-side language', 'true_false', '[\"true\",\"false\"]', 'true'),
(56, 5, 'What is the file extension for Java source files?', 'multipleChoice', '[\".java\",\".class\",\".jar\",\".j\"]', '.java'),
(57, 5, 'Name three popular database management systems', 'enumeration', '[]', 'MySQL,PostgreSQL,MongoDB'),
(58, 5, 'Which keyword is used to define a function in JavaScript?', 'multipleChoice', '[\"function\",\"def\",\"func\",\"void\"]', 'function'),
(59, 5, 'Ruby is a statically typed language', 'true_false', '[\"true\",\"false\"]', 'false'),
(60, 5, 'What does IDE stand for?', 'multipleChoice', '[\"Integrated Development Environment\",\"Interface Development Environment\",\"Integrated Design Environment\",\"Internal Development Engine\"]', 'Integrated Development Environment'),
(61, 5, 'List four programming paradigms', 'enumeration', '[]', 'Procedural,Object-Oriented,Functional,Declarative'),
(62, 5, 'Which symbol represents the NOT operator in most languages?', 'multipleChoice', '[\"!\",\"NOT\",\"^\",\"~\"]', '!'),
(63, 5, 'TypeScript is a superset of JavaScript', 'true_false', '[\"true\",\"false\"]', 'true'),
(64, 5, 'What is the correct way to comment multiple lines in CSS?', 'multipleChoice', '[\"/* */\",\"// //\",\"<!-- -->\",\"## ##\"]', '/* */'),
(65, 5, 'Name three popular cloud service providers', 'enumeration', '[]', 'AWS,Azure,Google Cloud'),
(66, 5, 'Which method is used to add elements to an array in JavaScript?', 'multipleChoice', '[\"push()\",\"add()\",\"append()\",\"insert()\"]', 'push()'),
(67, 5, 'Python uses semicolons at the end of statements', 'true_false', '[\"true\",\"false\"]', 'false'),
(68, 5, 'What does JSON stand for?', 'multipleChoice', '[\"JavaScript Object Notation\",\"Java Serial Object Notation\",\"JavaScript Oriented Notation\",\"Java Standard Object Notation\"]', 'JavaScript Object Notation'),
(69, 5, 'List four common design patterns', 'enumeration', '[]', 'Singleton,Factory,Observer,Strategy'),
(70, 5, 'Which operator is used for exponentiation in Python?', 'multipleChoice', '[\"**\",\"^^\",\"^^\",\"pow\"]', '**'),
(71, 5, 'CSS is used for styling web pages', 'true_false', '[\"true\",\"false\"]', 'true');

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

--
-- Dumping data for table `score`
--

INSERT INTO `score` (`id`, `userId`, `examId`, `score`, `total`, `percentage`, `submittedAt`) VALUES
(1, 2, 1, 0, 3, 0, '2025-03-12 19:28:30.092'),
(2, 2, 5, 0, 51, 0, '2025-03-12 20:07:44.699');

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
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `survey`
--

INSERT INTO `survey` (`id`, `title`, `description`, `code`, `isActive`, `createdAt`, `updatedAt`, `userId`) VALUES
(1, 'dwadwdaw', 'dwadwdadwda', 'XT0WQ2', 1, '2025-03-11 16:59:16.972', '2025-03-11 16:59:16.972', 3),
(2, 'New Cabalan National High School: Examination Portal', 'This survey aims to gather expectations and feedback before implementing the Offline Examination System for New Cabalan National High School. Your responses will help improve the system befor', 'DZA2LS', 1, '2025-03-11 17:44:59.281', '2025-03-11 17:44:59.281', 3);

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

--
-- Dumping data for table `surveyquestion`
--

INSERT INTO `surveyquestion` (`id`, `surveyId`, `questionText`, `questionType`, `options`, `required`, `order`) VALUES
(1, 1, 'dawdawdawdw', 'multiple_choice', '\"[\\\"dwad\\\",\\\"dwadawdaw23\\\"]\"', 1, 0),
(2, 1, 'dwadawdawdawd', 'checkbox', '\"[\\\"awdawdaw\\\",\\\"000000000000\\\",\\\"12312312312\\\"]\"', 1, 1),
(3, 1, 'dawdawdawdaw2131231', 'text', '\"null\"', 1, 2),
(4, 2, 'NAME:\nLASTNAME/FIRSTNAME/MIDDLENAME', 'text', '\"null\"', 1, 0),
(5, 2, 'LRN', 'text', '\"null\"', 1, 1),
(6, 2, 'GRADE & SECTION', 'text', '\"null\"', 1, 2),
(7, 2, 'ROLE', 'multiple_choice', '\"[\\\"Teacher\\\",\\\"Student\\\",\\\"Administrator\\\"]\"', 1, 3),
(8, 2, 'How comfortable are you with using digital platforms for exams?', 'multiple_choice', '\"[\\\"Not comfortable\\\",\\\"Somewhat comfortable\\\",\\\"Very comfortable\\\"]\"', 1, 4),
(9, 2, 'Have you ever used a digital examination system before? example: Quizizz, Google Forms.', 'multiple_choice', '\"[\\\" Yes\\\",\\\"No\\\"]\"', 1, 5),
(10, 2, 'What do you currently use for taking exams?', 'multiple_choice', '\"[\\\"Paper-based exams\\\",\\\"Online exams (Google Forms, LMS, etc.)\\\",\\\" Both\\\"]\"', 1, 6),
(11, 2, 'How useful do you think this system will be for exams?', 'multiple_choice', '\"[\\\"Not useful\\\",\\\"Somewhat useful\\\",\\\"Very useful\\\"]\"', 1, 7),
(12, 2, 'What features do you expect from this offline exam system? (Check all that apply)', 'checkbox', '\"[\\\"Easy exam creation for teachers\\\",\\\"Secure exam-taking process\\\",\\\"Automated grading and real-time results\\\",\\\"Performance analytics and reports\\\",\\\"Accessibility for students without internet\\\",\\\"other\\\"]\"', 1, 8),
(13, 2, 'Do you think an offline examination system is more beneficial than an online one? Why?', 'text', '\"null\"', 1, 9),
(14, 2, 'What potential challenges do you foresee in using this system? (Check all that apply)', 'checkbox', '\"[\\\"System complexity (hard to learn)\\\",\\\"Security concerns (cheating, data protection)\\\",\\\"Accessibility issues (device availability, installation problems)\\\",\\\"Lack of technical support\\\",\\\"other\\\"]\"', 1, 10),
(15, 2, 'What kind of support or training would help you feel comfortable using this system?', 'multiple_choice', '\"[\\\" Training sessions\\\",\\\"Video tutorials\\\",\\\"User manual\\\",\\\"One-on-one guidance\\\",\\\"Other\\\"]\"', 1, 11),
(16, 2, 'Would you prefer using this system for major exams (e.g., midterms, finals)?', 'multiple_choice', '\"[\\\" Yes\\\",\\\"No\\\",\\\"Maybe\\\"]\"', 1, 12),
(17, 2, 'What concerns do you have about taking exams digitally instead of on paper?', 'text', '\"null\"', 1, 13),
(18, 2, 'How important is exam security and cheating prevention in digital exams?', 'multiple_choice', '\"[\\\"Not important\\\",\\\"Somewhat important\\\",\\\"Very important\\\"]\"', 1, 14),
(19, 2, 'Do you think teachers should have the ability to review and adjust automated scores?', 'multiple_choice', '\"[\\\" Yes\\\",\\\"No\\\",\\\" Not sure\\\"]\"', 1, 15),
(20, 2, 'What additional features would you like to see in this system?', 'text', '\"null\"', 0, 16),
(21, 2, 'Any other comments or concerns?', 'text', '\"null\"', 0, 17);

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
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `department` varchar(191) DEFAULT NULL,
  `domain` varchar(191) DEFAULT NULL,
  `gradeLevel` int(11) DEFAULT NULL,
  `lrn` int(11) DEFAULT NULL,
  `section` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `role`, `createdAt`, `updatedAt`, `address`, `firstName`, `lastName`, `phone`, `department`, `domain`, `gradeLevel`, `lrn`, `section`) VALUES
(1, 'admin@example.com', '$2y$10$PHFs9yhjDtNBWleGFXZWheRWeN/tZMsZXiTUQN.Q9p/8q4WeD5a9q', 'admin', '2025-03-12 23:37:59.000', '2025-03-12 23:37:59.000', NULL, 'Admin', 'User', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'haniba@ncnhs.edu.ph', '$2y$10$uc3mC8zObA0L7G2Ftw7i3eU7SkQb50rtHk.frPppCPOcijDEHsQ7K', 'student', '2025-03-12 15:57:46.371', '2025-03-12 17:33:49.785', '104 tagumpay street', 'JOHN MEL', 'HANIBA', NULL, '', '', 7, 123, 'ROSE'),
(3, 'loresto@ncnhs.edu.ph', '$2a$10$1gsDx0Lgp.D6QRqHqpnj9.Z167Wkp6vJG2b85npuBAdwZ4vFoSWJq', 'teacher', '2025-03-12 16:19:33.847', '2025-03-12 16:19:33.847', '123', 'PHOEBE ', 'LORESTO', NULL, 'MATH', 'MATH', NULL, NULL, NULL);

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
('0476710a-7067-4c3a-99e0-f18551d99bce', 'e12db1931080a3ebbecef5d932fff7c0c5f028f509912dbde8a238b0ab4a7b27', '2025-03-12 17:40:03.007', '20250211080714_update_user_table', NULL, NULL, '2025-03-12 17:40:02.978', 1),
('1d585fe5-2132-4ef8-9f34-c28a911cdc05', '31edbe29776f33c0173b84408e6daf22483a37d5677780f283b813b98d771b0f', '2025-03-12 17:40:03.496', '20250211131036_add_user_id_to_exam_answer', NULL, NULL, '2025-03-12 17:40:03.434', 1),
('335f095c-67d3-4315-b3cb-7f95097dc66b', '33927c52dc006c94f124c559f1dcce0f2350673ded9487072f25eae29eeb0fff', '2025-03-12 17:40:02.976', '20250211074743_init', NULL, NULL, '2025-03-12 17:40:02.956', 1),
('3628be0d-2228-4bb9-9b3f-f0e7ff3f7af1', '1a8892dfbaa1a634bebdc81a5736ae7ac508ffa4e89a10d5cf427dc80bf426b7', '2025-03-12 17:40:04.124', '20250312142259_section', NULL, NULL, '2025-03-12 17:40:04.031', 1),
('4bdcfc7f-1813-4d69-ab06-02ecf7995af8', '94fd6c7b3b65838d40994a735eed42b1b877da8170d8be76bd51789f6996c8ab', '2025-03-12 17:40:03.515', '20250211133133_add_composite_unique_key', NULL, NULL, '2025-03-12 17:40:03.497', 1),
('5dafdbfc-1a1e-4b10-914a-86f68fa2ca68', '5a995f6a0470035460526118b6d50d76147712847b0c75bb3409025e8281b3f2', '2025-03-12 17:40:02.943', '20250211071900_init', NULL, NULL, '2025-03-12 17:40:02.743', 1),
('6eccd47a-e0c3-48f8-b8a4-554778e97ca1', '3021faf8637df928fae1524c717d116bdf3a16fdb667890fe87a044bd3dfa04a', '2025-03-12 17:40:03.206', '20250211104306_kanye', NULL, NULL, '2025-03-12 17:40:03.142', 1),
('8c9eb6bc-60ef-43a1-ab00-bf10f6a0da39', 'be9110134677c23f19eb149bea10c0edbefd2474a1c99bd20a14b6e9dc06a07f', '2025-03-12 17:40:04.029', '20250311145027_add_survey_user_relation', NULL, NULL, '2025-03-12 17:40:03.969', 1),
('a43a9e39-a763-4ca5-a254-6886784ea676', '03d3da8ef1714cbdb183e536b7292812f52c5b95f8a96c1232b48cd497dc2fb7', '2025-03-12 17:40:03.525', '20250212074013_exam_pending_start_completed', NULL, NULL, '2025-03-12 17:40:03.517', 1),
('b8a33767-02b5-464c-88a9-a469c806d71f', '4f3845d138afff0fb8b1c0093a9e5d10f031c5772a39c5f1396abd96f435742a', '2025-03-12 17:40:02.955', '20250211072627_add_grade_level', NULL, NULL, '2025-03-12 17:40:02.944', 1),
('ba31f0c1-8985-4586-929d-a4f455f71b27', '3fdf462847a78bc1115811db8b10962786478fe4fce6f6bd32ab2a22fe7e7d79', '2025-03-12 17:40:03.967', '20250311144309_survey', NULL, NULL, '2025-03-12 17:40:03.726', 1),
('bb0e9837-70eb-4275-812d-868bf5aecd76', 'a861f0212a7f4ca1f104151bf27f84dbe73621e84a60a92000bc2223ba4c1155', '2025-03-12 17:40:03.019', '20250211092909_remove_subject_field', NULL, NULL, '2025-03-12 17:40:03.008', 1),
('bd17181e-4068-4913-965b-fe9f2ca215b3', '4d79c7c64dc6bb97d9bb888d8c7b35a83438e4e308b88ccc64fd7e29fd05354a', '2025-03-12 17:40:03.433', '20250211125515_', NULL, NULL, '2025-03-12 17:40:03.417', 1),
('c7d3a83b-00a5-440d-8241-e9b4b4a672b9', '0ffdba5de3d54e31777adca5186c18068ee9ef081d9e4277625ba1dc2c21bc46', '2025-03-12 17:40:03.724', '20250228150240_add_exam_draft_status', NULL, NULL, '2025-03-12 17:40:03.715', 1),
('cfe3b271-bb56-449d-908d-fdea4e3eb2ab', 'ad500d5c899bdfc93c2e5b06bcc6bf8c9e3917e84f0d146846df78fd696a84b3', '2025-03-12 17:40:03.415', '20250211115025_answer', NULL, NULL, '2025-03-12 17:40:03.298', 1),
('dbfb0e4f-29d5-4b96-964a-14fc22733f99', 'eb0dfc1cb7115765d1c4bfb394f8afa3cf737fdccf8b8fa762e79ba6b7eb0c22', '2025-03-12 17:40:03.098', '20250211103847_', NULL, NULL, '2025-03-12 17:40:03.082', 1),
('e5268772-b261-43ef-99f6-b7327d5bcb45', '72e5c1622a22a3b32e35181c6a3379c7d4d5564402c70fac714dbf8b2adbba6d', '2025-03-12 17:40:12.546', '20250312174012_exam_access', NULL, NULL, '2025-03-12 17:40:12.459', 1),
('e9f24c20-06b4-4738-8717-6cac27124509', '166a9944613e442be2d55a1ae44a002f8b5436e56e2f1886c689c852f71d6856', '2025-03-12 17:40:04.259', '20250312152623_section_and_grade', NULL, NULL, '2025-03-12 17:40:04.125', 1),
('ead47b8c-6764-4584-bb95-60e384338338', 'd1dcb8f696f0d3e31a437274635e527473a607d6d29b4605298820a8589ff9f6', '2025-03-12 17:40:03.297', '20250211113226_exam_creation', NULL, NULL, '2025-03-12 17:40:03.209', 1),
('ef26d6c6-abf0-4f60-b41f-e2be78a2cb70', '7297e675c021a2f755d5471eafc9cacc32106fda846f42fa0dc166b2445a979d', '2025-03-12 17:40:03.713', '20250225181707_scores', NULL, NULL, '2025-03-12 17:40:03.586', 1),
('f954ac65-826d-43ea-9cf4-7b6d5e18c747', '7f814499aff05d4187a8dd21ed1280790cb9f3f72378e3d18babee2540276cb0', '2025-03-12 17:40:03.079', '20250211103532_string_to_int', NULL, NULL, '2025-03-12 17:40:03.021', 1),
('fd0c2c58-d269-4e13-bbc5-da3c9dac0e11', 'baf83c7fde53aced53896b05b86c5949b07cbf0f9d82a5568994108879c19608', '2025-03-12 17:40:03.584', '20250219175051_add_user_relation_to_exam', NULL, NULL, '2025-03-12 17:40:03.526', 1);

--
-- Indexes for dumped tables
--

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
  ADD KEY `ExamAnswer_questionId_fkey` (`questionId`),
  ADD KEY `ExamAnswer_userId_fkey` (`userId`);

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
-- Indexes for table `score`
--
ALTER TABLE `score`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Score_userId_examId_key` (`userId`,`examId`),
  ADD KEY `Score_examId_fkey` (`examId`);

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
-- AUTO_INCREMENT for table `exam`
--
ALTER TABLE `exam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `examaccess`
--
ALTER TABLE `examaccess`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `examanswer`
--
ALTER TABLE `examanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gradesection`
--
ALTER TABLE `gradesection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `score`
--
ALTER TABLE `score`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `survey`
--
ALTER TABLE `survey`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `surveyanswer`
--
ALTER TABLE `surveyanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `surveyquestion`
--
ALTER TABLE `surveyquestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `surveyresponse`
--
ALTER TABLE `surveyresponse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
-- Constraints for table `score`
--
ALTER TABLE `score`
  ADD CONSTRAINT `Score_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exam` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Score_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
