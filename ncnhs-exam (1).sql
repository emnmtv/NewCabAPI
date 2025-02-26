-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 26, 2025 at 07:08 PM
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
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam`
--

INSERT INTO `exam` (`id`, `testCode`, `classCode`, `examTitle`, `status`, `userId`) VALUES
(2, 'MATH101', '10A-MATH', '123MATH', 'pending', 4),
(3, 'PROG101', 'CS101', 'Programming Basics Exam', 'started', 4);

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
(65, 2, '1 + 1', 'multiple_choice', '[\"2\",\"3\",\"4\"]', '2'),
(66, 2, 'IS EARCH ROUND ', 'true_false', '[\"\",\"\",\"\"]', 'True'),
(67, 2, 'BIGGEST PLANET IN SOLAR SYSTEM', 'short_answer', '[]', 'JUPITER'),
(68, 3, 'What is the output of 2 + 2?', 'multiple_choice', '[\"3\", \"4\", \"5\", \"6\"]', '4'),
(69, 3, 'Which of the following is a programming language?', 'multiple_choice', '[\"HTML\", \"CSS\", \"JavaScript\", \"SQL\"]', 'JavaScript'),
(70, 3, 'What does HTML stand for?', 'short_answer', '[]', 'HyperText Markup Language'),
(71, 3, 'Which symbol is used for comments in Python?', 'multiple_choice', '[\"#\", \"//\", \"/*\", \"<!--\"]', '#'),
(72, 3, 'What is the correct syntax to output \"Hello World\" in Java?', 'multiple_choice', '[\"System.out.println(\\\"Hello World\\\");\", \"echo \\\"Hello World\\\";\", \"print(\\\"Hello World\\\");\", \"Console.WriteLine(\\\"Hello World\\\");\"]', 'System.out.println(\"Hello World\");'),
(73, 3, 'What is the purpose of a loop in programming?', 'short_answer', '[]', 'To repeat a block of code multiple times'),
(74, 3, 'Which of the following is not a programming paradigm?', 'multiple_choice', '[\"Object-Oriented\", \"Functional\", \"Procedural\", \"Markup\"]', 'Markup'),
(75, 3, 'What is the main function in C?', 'short_answer', '[]', 'int main()'),
(76, 3, 'Which of the following is a valid variable name in JavaScript?', 'multiple_choice', '[\"1stVariable\", \"firstVariable\", \"first-variable\", \"first variable\"]', 'firstVariable'),
(77, 3, 'What does CSS stand for?', 'short_answer', '[]', 'Cascading Style Sheets'),
(78, 3, 'What is the time complexity of binary search?', 'short_answer', '[]', 'O(log n)'),
(79, 3, 'Which of the following is a correct way to declare a variable in Java?', 'multiple_choice', '[\"int x;\", \"x int;\", \"var x;\", \"declare x;\"]', 'int x;'),
(80, 3, 'What is the output of console.log(typeof null)?', 'multiple_choice', '[\"object\", \"null\", \"undefined\", \"number\"]', 'object'),
(81, 3, 'Which of the following is a Python data structure?', 'multiple_choice', '[\"Array\", \"List\", \"Vector\", \"Set\"]', 'List'),
(82, 3, 'What is the purpose of the \"return\" statement in a function?', 'short_answer', '[]', 'To exit the function and return a value'),
(83, 3, 'Which of the following is a valid way to create an array in JavaScript?', 'multiple_choice', '[\"var arr = [];\", \"var arr = new Array();\", \"var arr = Array();\", \"All of the above\"]', 'All of the above'),
(84, 3, 'What does SQL stand for?', 'short_answer', '[]', 'Structured Query Language'),
(85, 3, 'Which of the following is a loop structure in Java?', 'multiple_choice', '[\"for\", \"while\", \"do-while\", \"All of the above\"]', 'All of the above'),
(86, 3, 'What is the output of 5 == \"5\"?', 'multiple_choice', '[\"true\", \"false\", \"undefined\", \"NaN\"]', 'true'),
(87, 3, 'What is the purpose of the \"break\" statement?', 'short_answer', '[]', 'To exit a loop or switch statement'),
(88, 3, 'Which of the following is a valid JSON format?', 'multiple_choice', '[\"{\\\"name\\\": \\\"John\\\"}\", \"{name: \\\"John\\\"}\", \"[\\\"name\\\": \\\"John\\\"]\", \"(\\\"name\\\": \\\"John\\\")\"]', '{\"name\": \"John\"}'),
(89, 3, 'What is the output of 10 % 3?', 'multiple_choice', '[\"1\", \"2\", \"3\", \"0\"]', '1'),
(90, 3, 'Which of the following is a front-end framework?', 'multiple_choice', '[\"Django\", \"Flask\", \"React\", \"Spring\"]', 'React'),
(91, 3, 'What is the purpose of the \"if\" statement?', 'short_answer', '[]', 'To execute a block of code conditionally'),
(92, 3, 'Which of the following is a back-end programming language?', 'multiple_choice', '[\"HTML\", \"CSS\", \"JavaScript\", \"Python\"]', 'Python'),
(93, 3, 'What is the output of \"Hello World\" + \"!\"?', 'multiple_choice', '[\"Hello World!\", \"HelloWorld!\", \"Hello World\", \"Hello World! \"]', 'Hello World!'),
(94, 3, 'What is the correct way to comment in Java?', 'multiple_choice', '[\"// comment\", \"/* comment */\", \"// comment /* comment */\", \"Both 1 and 2\"]', 'Both 1 and 2'),
(95, 3, 'What is the purpose of a constructor in a class?', 'short_answer', '[]', 'To initialize an object of the class'),
(96, 3, 'Which of the following is a valid way to define a function in JavaScript?', 'multiple_choice', '[\"function myFunction() {}\", \"var myFunction = function() {}\", \"const myFunction = () => {}\", \"All of the above\"]', 'All of the above'),
(97, 3, 'What is the output of 3 + 4 + \"5\"?', 'multiple_choice', '[\"75\", \"34\", \"12\", \"35\"]', '75'),
(98, 3, 'Which of the following is a NoSQL database?', 'multiple_choice', '[\"MySQL\", \"PostgreSQL\", \"MongoDB\", \"SQLite\"]', 'MongoDB'),
(99, 3, 'What is the purpose of the \"this\" keyword in JavaScript?', 'short_answer', '[]', 'To refer to the current object'),
(100, 3, 'Which of the following is a valid way to create a function in Python?', 'multiple_choice', '[\"def myFunction():\", \"function myFunction() {}\", \"myFunction() = function() {}\", \"create myFunction() {}\"]', 'def myFunction():'),
(101, 3, 'What is the output of \"5\" + 5?', 'multiple_choice', '[\"55\", \"10\", \"5\", \"undefined\"]', '55'),
(102, 3, 'Which of the following is a CSS property?', 'multiple_choice', '[\"color\", \"font-size\", \"margin\", \"All of the above\"]', 'All of the above'),
(103, 3, 'What is the purpose of the \"else\" statement?', 'short_answer', '[]', 'To execute a block of code if the condition is false'),
(104, 3, 'Which of the following is a valid way to declare a constant in JavaScript?', 'multiple_choice', '[\"const x = 10;\", \"let x = 10;\", \"var x = 10;\", \"All of the above\"]', 'const x = 10;'),
(105, 3, 'What is the output of 1 + \"1\"?', 'multiple_choice', '[\"11\", \"2\", \"1\", \"undefined\"]', '11'),
(106, 3, 'Which of the following is a valid way to create an object in JavaScript?', 'multiple_choice', '[\"var obj = {};\", \"var obj = new Object();\", \"var obj = Object.create();\", \"All of the above\"]', 'All of the above'),
(107, 3, 'What is the purpose of the \"continue\" statement?', 'short_answer', '[]', 'To skip the current iteration of a loop'),
(108, 3, 'Which of the following is a valid way to import a module in Python?', 'multiple_choice', '[\"import module\", \"from module import *\", \"import module as alias\", \"All of the above\"]', 'All of the above'),
(109, 3, 'What is the output of 10 / 2?', 'multiple_choice', '[\"5\", \"2\", \"10\", \"20\"]', '5'),
(110, 3, 'Which of the following is a valid way to define a class in Python?', 'multiple_choice', '[\"class MyClass:\", \"def MyClass:\", \"MyClass() = class:\", \"class MyClass():\"]', 'class MyClass:'),
(111, 3, 'What is the purpose of the \"switch\" statement?', 'short_answer', '[]', 'To execute different parts of code based on different conditions'),
(112, 3, 'Which of the following is a valid way to declare a variable in C++?', 'multiple_choice', '[\"int x;\", \"x int;\", \"var x;\", \"declare x;\"]', 'int x;'),
(113, 3, 'What is the output of \"Hello\".length?', 'multiple_choice', '[\"5\", \"6\", \"Hello\", \"undefined\"]', '5'),
(114, 3, 'Which of the following is a valid way to create a promise in JavaScript?', 'multiple_choice', '[\"new Promise()\", \"Promise.resolve()\", \"Promise.all()\", \"All of the above\"]', 'All of the above'),
(115, 3, 'What is the purpose of the \"finally\" block in a try-catch statement?', 'short_answer', '[]', 'To execute code after try and catch, regardless of the outcome'),
(116, 3, 'Which of the following is a valid way to handle exceptions in Python?', 'multiple_choice', '[\"try-catch\", \"try-except\", \"try-finally\", \"catch-try\"]', 'try-except'),
(117, 3, 'What is the output of 0 == false?', 'multiple_choice', '[\"true\", \"false\", \"undefined\", \"NaN\"]', 'true'),
(118, 3, 'Which of the following is a valid way to create a function in C?', 'multiple_choice', '[\"void myFunction() {}\", \"function myFunction() {}\", \"myFunction() = function() {}\", \"create myFunction() {}\"]', 'void myFunction() {}'),
(119, 3, 'What is the purpose of the \"async\" keyword in JavaScript?', 'short_answer', '[]', 'To define an asynchronous function'),
(120, 3, 'Which of the following is a valid way to declare a variable in Ruby?', 'multiple_choice', '[\"my_var = 10\", \"var my_var = 10\", \"let my_var = 10\", \"const my_var = 10\"]', 'my_var = 10'),
(121, 3, 'What is the output of \"5\" - 2?', 'multiple_choice', '[\"3\", \"5\", \"undefined\", \"NaN\"]', '3'),
(122, 3, 'Which of the following is a valid way to create a set in Python?', 'multiple_choice', '[\"set()\", \"[]\", \"{}\", \"All of the above\"]', 'set()'),
(123, 3, 'What is the purpose of the \"map\" function in JavaScript?', 'short_answer', '[]', 'To create a new array with the results of calling a function on every element in the array'),
(124, 3, 'Which of the following is a valid way to define a variable in Kotlin?', 'multiple_choice', '[\"var myVar = 10\", \"val myVar = 10\", \"All of the above\", \"None of the above\"]', 'All of the above'),
(125, 3, 'What is the output of \"Hello\".toUpperCase()', 'multiple_choice', '[\"HELLO\", \"hello\", \"Hello\", \"undefined\"]', 'HELLO'),
(126, 3, 'Which of the following is a valid way to create a tuple in Python?', 'multiple_choice', '[\"()\", \"[]\", \"{}\", \"All of the above\"]', '()'),
(127, 3, 'What is the purpose of the \"filter\" function in JavaScript?', 'short_answer', '[]', 'To create a new array with all elements that pass the test implemented by the provided function'),
(128, 3, 'Which of the following is a valid way to define a variable in Swift?', 'multiple_choice', '[\"var myVar = 10\", \"let myVar = 10\", \"All of the above\", \"None of the above\"]', 'All of the above'),
(129, 3, 'What is the output of \"5\" + 5?', 'multiple_choice', '[\"55\", \"10\", \"5\", \"undefined\"]', '55'),
(130, 3, 'Which of the following is a valid way to create a dictionary in Python?', 'multiple_choice', '[\"dict()\", \"{}\", \"[]\", \"All of the above\"]', '{}'),
(131, 3, 'What is the purpose of the \"reduce\" function in JavaScript?', 'short_answer', '[]', 'To execute a reducer function on each element of the array, resulting in a single output value');

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
(1, 'admin@example.com', '$2y$10$qaP0aEQg..1QtQ3D6rpmrOYK58a6hjkBPKcgJhDbeVlUPQCj91HR2', 'admin', '2025-02-27 01:14:21.000', '2025-02-27 01:14:21.000', NULL, 'Admin', 'User', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'student1@example.com', '$2y$10$z6l3mfsO97LB.qdec94E/updYAwJmAbbnt/jkR54iBfQZVOnzJH7C', 'student', '2025-02-27 01:14:21.000', '2025-02-27 01:14:21.000', NULL, 'Student', 'One', NULL, NULL, NULL, 10, 1234, 'A'),
(3, 'student2@example.com', '$2y$10$AEa9z/S7PFqQ5CTcOxEu8OcrSUPU.4onlyFKsNz6zE.MGPvsprrjW', 'student', '2025-02-27 01:14:21.000', '2025-02-27 01:14:21.000', NULL, 'Student', 'Two', NULL, NULL, NULL, 10, 123, 'B'),
(4, 'teacher@example.com', '$2y$10$53W/QvaaSWKAeQqFXVFB7OGAcpEq7FQwgpbwA/JBQmJK36lvwlfAS', 'teacher', '2025-02-27 01:14:21.000', '2025-02-27 01:14:21.000', NULL, 'Teacher', 'Smith', NULL, 'Math Department', 'Mathematics', NULL, NULL, NULL);

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
('039d16d6-dcb7-4fea-8bcc-0c8577aad875', 'eb0dfc1cb7115765d1c4bfb394f8afa3cf737fdccf8b8fa762e79ba6b7eb0c22', '2025-02-26 03:07:51.070', '20250211103847_', NULL, NULL, '2025-02-26 03:07:51.055', 1),
('0b47280d-2d86-4b9a-8278-62839e4cdcc1', 'd1dcb8f696f0d3e31a437274635e527473a607d6d29b4605298820a8589ff9f6', '2025-02-26 03:07:51.203', '20250211113226_exam_creation', NULL, NULL, '2025-02-26 03:07:51.128', 1),
('11abda15-77dd-47a8-843e-6c4af4b7d9e3', '31edbe29776f33c0173b84408e6daf22483a37d5677780f283b813b98d771b0f', '2025-02-26 03:07:51.413', '20250211131036_add_user_id_to_exam_answer', NULL, NULL, '2025-02-26 03:07:51.358', 1),
('3ee82737-2ee2-4a66-8320-e214b4d3c3bd', 'a861f0212a7f4ca1f104151bf27f84dbe73621e84a60a92000bc2223ba4c1155', '2025-02-26 03:07:51.004', '20250211092909_remove_subject_field', NULL, NULL, '2025-02-26 03:07:50.994', 1),
('64b6b16c-85b9-46dc-98a2-b139638c451e', '3021faf8637df928fae1524c717d116bdf3a16fdb667890fe87a044bd3dfa04a', '2025-02-26 03:07:51.126', '20250211104306_kanye', NULL, NULL, '2025-02-26 03:07:51.071', 1),
('6e573f7b-c9a2-497b-a253-b6c4570d6572', '94fd6c7b3b65838d40994a735eed42b1b877da8170d8be76bd51789f6996c8ab', '2025-02-26 03:07:51.434', '20250211133133_add_composite_unique_key', NULL, NULL, '2025-02-26 03:07:51.416', 1),
('72c6aac8-0183-453f-a8ab-d229c844b3c2', '7297e675c021a2f755d5471eafc9cacc32106fda846f42fa0dc166b2445a979d', '2025-02-26 03:07:51.714', '20250225181707_scores', NULL, NULL, '2025-02-26 03:07:51.499', 1),
('75f3523d-c72b-443d-b021-5704356803ad', '4f3845d138afff0fb8b1c0093a9e5d10f031c5772a39c5f1396abd96f435742a', '2025-02-26 03:07:50.943', '20250211072627_add_grade_level', NULL, NULL, '2025-02-26 03:07:50.933', 1),
('92e2eb6d-9f8a-4cd2-9ed9-55104b567efa', '5a995f6a0470035460526118b6d50d76147712847b0c75bb3409025e8281b3f2', '2025-02-26 03:07:50.931', '20250211071900_init', NULL, NULL, '2025-02-26 03:07:50.764', 1),
('9a62047a-6bea-4925-a37b-87027a3db9ab', '03d3da8ef1714cbdb183e536b7292812f52c5b95f8a96c1232b48cd497dc2fb7', '2025-02-26 03:07:51.442', '20250212074013_exam_pending_start_completed', NULL, NULL, '2025-02-26 03:07:51.435', 1),
('a582e04e-cb3e-442e-82ad-fd1ac03dc8d4', 'ad500d5c899bdfc93c2e5b06bcc6bf8c9e3917e84f0d146846df78fd696a84b3', '2025-02-26 03:07:51.334', '20250211115025_answer', NULL, NULL, '2025-02-26 03:07:51.204', 1),
('b1da3ecf-f740-4403-bc5b-7db92b9eb5b1', '7f814499aff05d4187a8dd21ed1280790cb9f3f72378e3d18babee2540276cb0', '2025-02-26 03:07:51.054', '20250211103532_string_to_int', NULL, NULL, '2025-02-26 03:07:51.005', 1),
('bcd3187a-39fd-415c-9191-b1987c97bfc1', 'e12db1931080a3ebbecef5d932fff7c0c5f028f509912dbde8a238b0ab4a7b27', '2025-02-26 03:07:50.992', '20250211080714_update_user_table', NULL, NULL, '2025-02-26 03:07:50.966', 1),
('d1d1f9d5-3896-4512-9d7e-64ba782b928e', '4d79c7c64dc6bb97d9bb888d8c7b35a83438e4e308b88ccc64fd7e29fd05354a', '2025-02-26 03:07:51.357', '20250211125515_', NULL, NULL, '2025-02-26 03:07:51.335', 1),
('f974b36f-1846-40f9-a023-d1912bcf41ab', 'baf83c7fde53aced53896b05b86c5949b07cbf0f9d82a5568994108879c19608', '2025-02-26 03:07:51.497', '20250219175051_add_user_relation_to_exam', NULL, NULL, '2025-02-26 03:07:51.444', 1),
('fd85ef02-9017-465c-a8dc-c7ea98caa205', '33927c52dc006c94f124c559f1dcce0f2350673ded9487072f25eae29eeb0fff', '2025-02-26 03:07:50.964', '20250211074743_init', NULL, NULL, '2025-02-26 03:07:50.945', 1);

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
-- Indexes for table `examanswer`
--
ALTER TABLE `examanswer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ExamAnswer_examId_userId_questionId_key` (`examId`,`userId`,`questionId`),
  ADD KEY `ExamAnswer_questionId_fkey` (`questionId`),
  ADD KEY `ExamAnswer_userId_fkey` (`userId`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `examanswer`
--
ALTER TABLE `examanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT for table `score`
--
ALTER TABLE `score`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exam`
--
ALTER TABLE `exam`
  ADD CONSTRAINT `Exam_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
