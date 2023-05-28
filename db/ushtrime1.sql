-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 25, 2023 at 05:23 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ushtrime1`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `ID` int(11) NOT NULL,
  `Username` varchar(70) NOT NULL,
  `Password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`ID`, `Username`, `Password`) VALUES
(1, 'Ermira', '1234'),
(2, 'Erlisa', '1111');

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE `chat` (
  `ID` int(11) NOT NULL,
  `Sender` varchar(255) NOT NULL,
  `Receiver` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `ID` int(11) NOT NULL,
  `Subject_id` int(11) NOT NULL,
  `Student_id` int(11) NOT NULL,
  `Grade` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`ID`, `Subject_id`, `Student_id`, `Grade`) VALUES
(1, 2, 1, '80');

-- --------------------------------------------------------

--
-- Table structure for table `professor`
--

CREATE TABLE `professor` (
  `ID` int(10) NOT NULL,
  `Username` varchar(70) NOT NULL,
  `Password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `professor`
--

INSERT INTO `professor` (`ID`, `Username`, `Password`) VALUES
(1, 'Rrmoku', '123'),
(2, 'Korab', 'profi'),
(3, 'Rogova', '111'),
(4, 'Berisha', '1122'),
(5, 'Salihu', 'abc');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `ID` int(11) NOT NULL,
  `Name` varchar(10) NOT NULL,
  `Lastname` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`ID`, `Name`, `Lastname`, `Email`) VALUES
(1, 'Erlisa', 'Lokaj', 'erlisalokaj@gmail.com'),
(2, 'Ermira', 'Haziri', 'ermirahaziri@gmail.com'),
(3, 'John', 'Micheal', 'michealjohn@gmail.com'),
(4, 'Albina', 'Ukshini', 'albina.ukshini@gmail.com'),
(5, 'Donesa', 'Omuri', 'donesa.omuri@gmail.com'),
(7, 'Erza', 'Mustafa', 'erza.mustafa@gmail.com'),
(8, 'Bleona', 'Mustafa', 'bleona.mustafa@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `ID` int(11) NOT NULL,
  `Name` varchar(80) NOT NULL,
  `Professor_id` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`ID`, `Name`, `Professor_id`) VALUES
(1, 'Mathematics', 1),
(2, 'English', 2),
(3, 'Image Processing', 3);

-- --------------------------------------------------------

--
-- Table structure for table `subject_students`
--

CREATE TABLE `subject_students` (
  `Subject_id` int(11) NOT NULL,
  `Student_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_students`
--

INSERT INTO `subject_students` (`Subject_id`, `Student_id`) VALUES
(2, 1),
(1, 1),
(2, 2),
(2, 3),
(2, 3),
(1, 3),
(3, 7);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `Student_id` (`Student_id`),
  ADD KEY `Subject_id` (`Subject_id`);

--
-- Indexes for table `professor`
--
ALTER TABLE `professor`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `Professor_id` (`Professor_id`);

--
-- Indexes for table `subject_students`
--
ALTER TABLE `subject_students`
  ADD KEY `Student_id` (`Student_id`),
  ADD KEY `Subject_id` (`Subject_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`Student_id`) REFERENCES `students` (`ID`),
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`Subject_id`) REFERENCES `subjects` (`ID`);

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`Professor_id`) REFERENCES `professor` (`ID`);

--
-- Constraints for table `subject_students`
--
ALTER TABLE `subject_students`
  ADD CONSTRAINT `subject_students_ibfk_1` FOREIGN KEY (`Student_id`) REFERENCES `students` (`ID`),
  ADD CONSTRAINT `subject_students_ibfk_2` FOREIGN KEY (`Subject_id`) REFERENCES `subjects` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
