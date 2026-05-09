SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE parking_records;
TRUNCATE TABLE users;
TRUNCATE TABLE parking_sites;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. PARKING SITES
-- ==========================================
INSERT INTO parking_sites (site_id, hourly_rate, is_operational, max_site_capacity, site_location) VALUES 
('SITE_001', 20.0, 1, 118, 'Downtown'),
('SITE_002', 20.0, 1, 85, 'City Center'),
('SITE_003', 15.0, 1, 169, 'North Mall'),
('SITE_004', 20.0, 1, 197, 'South Station'),
('SITE_005', 15.0, 1, 174, 'Airport Terminal 1'),
('SITE_006', 10.0, 1, 164, 'Airport Terminal 2'),
('SITE_007', 5.0, 1, 151, 'West End'),
('SITE_008', 5.0, 1, 197, 'East Market'),
('SITE_009', 5.0, 1, 76, 'Hospital'),
('SITE_010', 20.0, 1, 172, 'University'),
('SITE_011', 15.0, 1, 58, 'Stadium'),
('SITE_012', 5.0, 0, 140, 'Business Park'); -- Under maintenance

-- ==========================================
-- 2. USERS (50 REGULAR)
-- ==========================================
INSERT INTO users (id, user_type, contact_no, name, vehicle_no, vehicle_type, cnic, password, wallet_balance) VALUES 
(1, 'REGULAR', '03057448150', 'Aisha Malik', 'ABC-4959', 'Car', '35202-7662426-1', 'password123', 4592.50),
(2, 'REGULAR', '03255025081', 'Sara Iqbal', 'ABC-8277', 'Car', '35202-1119363-2', 'password123', 0.00),
(3, 'REGULAR', '03166457862', 'Omar Khan', 'ABC-3752', 'SUV', '35202-6386987-3', 'password123', 2463.18),
(4, 'REGULAR', '03141795063', 'Usman Hussain', 'ABC-8711', 'Motorcycle', '35202-5268592-4', 'password123', 2321.89),
(5, 'REGULAR', '03197324424', 'Sadia Malik', 'ABC-9727', 'Car', '35202-2415558-5', 'password123', 250.62),
(6, 'REGULAR', '03179650025', 'Sana Ali', 'ABC-8778', 'Motorcycle', '35202-8362290-6', 'password123', 671.95),
(7, 'REGULAR', '03246909196', 'Tariq Malik', 'ABC-3110', 'Car', '35202-4360203-7', 'password123', 1602.16),
(8, 'REGULAR', '03412262707', 'Sana Shah', 'ABC-6107', 'Car', '35202-7121896-8', 'password123', 3273.75),
(9, 'REGULAR', '03084854898', 'Bilal Ali', 'ABC-7739', 'Motorcycle', '35202-3933468-9', 'password123', 0.00),
(10, 'REGULAR', '03328123589', 'Bilal Hussain', 'ABC-9726', 'Car', '35202-1869664-0', 'password123', 4436.47),
(11, 'REGULAR', '03427741480', 'Kamran Javed', 'ABC-1522', 'Motorcycle', '35202-9595979-1', 'password123', 403.12),
(12, 'REGULAR', '03390262291', 'Sana Raza', 'ABC-9399', 'Car', '35202-7968900-2', 'password123', 544.79),
(13, 'REGULAR', '03029628702', 'Ali Iqbal', 'ABC-5663', 'Car', '35202-8149976-3', 'password123', 314.75),
(14, 'REGULAR', '03468868363', 'Bilal Raza', 'ABC-2732', 'SUV', '35202-6559691-4', 'password123', 785.33),
(15, 'REGULAR', '03113266494', 'Aisha Shah', 'ABC-8953', 'Motorcycle', '35202-2545407-5', 'password123', 3739.84),
(16, 'REGULAR', '03039409935', 'Nida Chaudhry', 'ABC-4811', 'Car', '35202-5944046-6', 'password123', 3839.80),
(17, 'REGULAR', '03080438636', 'Kamran Hussain', 'ABC-1278', 'SUV', '35202-7163976-7', 'password123', 1494.64),
(18, 'REGULAR', '03381067907', 'Omar Javed', 'ABC-8537', 'Motorcycle', '35202-6904433-8', 'password123', 1840.58),
(19, 'REGULAR', '03345713348', 'Ali Chaudhry', 'ABC-9803', 'Car', '35202-7351551-9', 'password123', 2116.12),
(20, 'REGULAR', '03147555969', 'Kamran Ali', 'ABC-7909', 'Motorcycle', '35202-3932111-0', 'password123', 1992.13),
(21, 'REGULAR', '03088771040', 'Nida Khan', 'ABC-7021', 'Car', '35202-5356472-1', 'password123', 0.00),
(22, 'REGULAR', '03041153321', 'Hassan Ali', 'ABC-7631', 'Car', '35202-8411424-2', 'password123', 3290.37),
(23, 'REGULAR', '03361968982', 'Sana Shah', 'ABC-2106', 'Car', '35202-4949230-3', 'password123', 3193.23),
(24, 'REGULAR', '03030249543', 'Hira Raza', 'ABC-9880', 'Car', '35202-7213928-4', 'password123', 3587.22),
(25, 'REGULAR', '03027927544', 'Nida Ali', 'ABC-3307', 'Motorcycle', '35202-2479923-5', 'password123', 1896.10),
(26, 'REGULAR', '03252166985', 'Sara Ali', 'ABC-8595', 'Car', '35202-3096286-6', 'password123', 2091.55),
(27, 'REGULAR', '03361263496', 'Ali Chaudhry', 'ABC-6035', 'SUV', '35202-6463949-7', 'password123', 3222.65),
(28, 'REGULAR', '03350202077', 'Kamran Raza', 'ABC-2647', 'Motorcycle', '35202-5110445-8', 'password123', 823.95),
(29, 'REGULAR', '03235894008', 'Bilal Chaudhry', 'ABC-9150', 'Motorcycle', '35202-1809942-9', 'password123', 4896.85),
(30, 'REGULAR', '03127272289', 'Tariq Javed', 'ABC-3101', 'Motorcycle', '35202-6179182-0', 'password123', 4204.17),
(31, 'REGULAR', '03416511100', 'Usman Raza', 'ABC-4920', 'Car', '35202-7707016-1', 'password123', 1794.66),
(32, 'REGULAR', '03170469261', 'Nida Ahmed', 'ABC-5457', 'SUV', '35202-3106739-2', 'password123', 4580.47),
(33, 'REGULAR', '03013541652', 'Sadia Raza', 'ABC-4869', 'Motorcycle', '35202-2385479-3', 'password123', 204.62),
(34, 'REGULAR', '03430936553', 'Sara Ali', 'ABC-9926', 'Motorcycle', '35202-1479264-4', 'password123', 4438.22),
(35, 'REGULAR', '03320480444', 'Aisha Malik', 'ABC-7113', 'SUV', '35202-9775852-5', 'password123', 2570.05),
(36, 'REGULAR', '03455921185', 'Kamran Javed', 'ABC-9409', 'SUV', '35202-7832222-6', 'password123', 752.40),
(37, 'REGULAR', '03278298656', 'Hassan Iqbal', 'ABC-7417', 'SUV', '35202-2786595-7', 'password123', 0.00),
(38, 'REGULAR', '03187970187', 'Ali Iqbal', 'ABC-4749', 'SUV', '35202-4111601-8', 'password123', 4439.78),
(39, 'REGULAR', '03167239568', 'Bilal Hussain', 'ABC-3089', 'Car', '35202-1971974-9', 'password123', 668.42),
(40, 'REGULAR', '03148343709', 'Hira Iqbal', 'ABC-6646', 'Motorcycle', '35202-5143787-0', 'password123', 2969.58),
(41, 'REGULAR', '03434733080', 'Sana Hussain', 'ABC-9389', 'Car', '35202-8157318-1', 'password123', 4712.55),
(42, 'REGULAR', '03434850391', 'Bilal Khan', 'ABC-5012', 'Motorcycle', '35202-3799504-2', 'password123', 2366.93),
(43, 'REGULAR', '03228091282', 'Sana Ahmed', 'ABC-1233', 'Car', '35202-5886367-3', 'password123', 4606.87),
(44, 'REGULAR', '03415562753', 'Hira Shah', 'ABC-7251', 'Motorcycle', '35202-2045710-4', 'password123', 2152.16),
(45, 'REGULAR', '03087436024', 'Fatima Hussain', 'ABC-3132', 'Car', '35202-8517610-5', 'password123', 4497.78),
(46, 'REGULAR', '03214632275', 'Nida Ali', 'ABC-4619', 'SUV', '35202-1362974-6', 'password123', 4646.44),
(47, 'REGULAR', '03281329966', 'Omar Khan', 'ABC-1374', 'Motorcycle', '35202-2684608-7', 'password123', 2934.38),
(48, 'REGULAR', '03212108897', 'Sana Iqbal', 'ABC-7076', 'Car', '35202-7550936-8', 'password123', 3310.22),
(49, 'REGULAR', '03317457468', 'Sara Javed', 'ABC-4573', 'Motorcycle', '35202-6512868-9', 'password123', 4201.95),
(50, 'REGULAR', '03363770159', 'Aisha Ahmed', 'ABC-5078', 'Motorcycle', '35202-1141761-0', 'password123', 1426.47);

-- ==========================================
-- 3. USERS (45 WALK-IN)
-- ==========================================
INSERT INTO users (id, user_type, contact_no, name, vehicle_no, vehicle_type) VALUES 
(51, 'WALK_IN', '03137173020', 'Ahmed Chaudhry', 'XYZ-2193', 'SUV'),
(52, 'WALK_IN', '03421206801', 'Sadia Khan', 'XYZ-2128', 'SUV'),
(53, 'WALK_IN', '03042631852', 'Ahmed Hussain', 'XYZ-3224', 'Car'),
(54, 'WALK_IN', '03489258483', 'Bilal Chaudhry', 'XYZ-9395', 'Motorcycle'),
(55, 'WALK_IN', '03246830454', 'Aisha Khan', 'XYZ-7306', 'Motorcycle'),
(56, 'WALK_IN', '03224967845', 'Bilal Khan', 'XYZ-7028', 'SUV'),
(57, 'WALK_IN', '03012642416', 'Ahmed Ali', 'XYZ-7401', 'Motorcycle'),
(58, 'WALK_IN', '03148584077', 'Bilal Hussain', 'XYZ-8511', 'SUV'),
(59, 'WALK_IN', '03219735718', 'Sadia Raza', 'XYZ-6312', 'SUV'),
(60, 'WALK_IN', '03368320039', 'Sadia Malik', 'XYZ-3887', 'Motorcycle'),
(61, 'WALK_IN', '03338783980', 'Fatima Shah', 'XYZ-9502', 'SUV'),
(62, 'WALK_IN', '03250806601', 'Bilal Javed', 'XYZ-6423', 'SUV'),
(63, 'WALK_IN', '03020780402', 'Omar Malik', 'XYZ-9095', 'SUV'),
(64, 'WALK_IN', '03231147143', 'Nida Ahmed', 'XYZ-5210', 'Motorcycle'),
(65, 'WALK_IN', '03159469614', 'Hira Iqbal', 'XYZ-5230', 'Motorcycle'),
(66, 'WALK_IN', '03313411585', 'Zainab Hussain', 'XYZ-4604', 'Motorcycle'),
(67, 'WALK_IN', '03020138156', 'Sadia Iqbal', 'XYZ-4523', 'SUV'),
(68, 'WALK_IN', '03243147707', 'Sana Khan', 'XYZ-6508', 'Motorcycle'),
(69, 'WALK_IN', '03083807948', 'Nida Hussain', 'XYZ-5517', 'Car'),
(70, 'WALK_IN', '03415149909', 'Sana Khan', 'XYZ-5417', 'SUV'),
(71, 'WALK_IN', '03165067970', 'Bilal Shah', 'XYZ-6633', 'Car'),
(72, 'WALK_IN', '03388600461', 'Hassan Malik', 'XYZ-9585', 'SUV'),
(73, 'WALK_IN', '03284156042', 'Sana Malik', 'XYZ-1094', 'Motorcycle'),
(74, 'WALK_IN', '03011405753', 'Bilal Chaudhry', 'XYZ-3316', 'Car'),
(75, 'WALK_IN', '03241424514', 'Ahmed Javed', 'XYZ-4012', 'Motorcycle'),
(76, 'WALK_IN', '03150834065', 'Kamran Malik', 'XYZ-7146', 'Car'),
(77, 'WALK_IN', '03142500606', 'Aisha Javed', 'XYZ-2686', 'SUV'),
(78, 'WALK_IN', '03186234977', 'Omar Khan', 'XYZ-4383', 'SUV'),
(79, 'WALK_IN', '03486518348', 'Nida Chaudhry', 'XYZ-2296', 'Motorcycle'),
(80, 'WALK_IN', '03484632809', 'Tariq Chaudhry', 'XYZ-7665', 'Car'),
(81, 'WALK_IN', '03412878780', 'Tariq Raza', 'XYZ-6565', 'Car'),
(82, 'WALK_IN', '03493058211', 'Aisha Iqbal', 'XYZ-1504', 'SUV'),
(83, 'WALK_IN', '03089608452', 'Ahmed Javed', 'XYZ-4175', 'Motorcycle'),
(84, 'WALK_IN', '03377649623', 'Sadia Malik', 'XYZ-4894', 'Car'),
(85, 'WALK_IN', '03221795834', 'Ali Hussain', 'XYZ-5077', 'Car'),
(86, 'WALK_IN', '03334475475', 'Hira Iqbal', 'XYZ-4707', 'Motorcycle'),
(87, 'WALK_IN', '03222636636', 'Aisha Malik', 'XYZ-7048', 'Motorcycle'),
(88, 'WALK_IN', '03449500437', 'Zainab Malik', 'XYZ-8860', 'Car'),
(89, 'WALK_IN', '03324840408', 'Sana Shah', 'XYZ-6796', 'SUV'),
(90, 'WALK_IN', '03487291279', 'Nida Malik', 'XYZ-6727', 'Motorcycle'),
(91, 'WALK_IN', '03269132000', 'Fatima Malik', 'XYZ-1526', 'Car'),
(92, 'WALK_IN', '03190999981', 'Nida Khan', 'XYZ-8381', 'Car'),
(93, 'WALK_IN', '03132898442', 'Hira Shah', 'XYZ-6781', 'Car'),
(94, 'WALK_IN', '03366632683', 'Aisha Chaudhry', 'XYZ-2303', 'SUV'),
(95, 'WALK_IN', '03146633754', 'Kamran Malik', 'XYZ-4692', 'SUV');

-- ==========================================
-- 4. HISTORICAL PARKING RECORDS (Paid)
-- Mix of Wallet, Cash, and Credit Card payments.
-- ==========================================
INSERT INTO parking_records (id, amount, is_paid, license_plate, park_in_time, park_out_time, payment_method, slot_number, site_id, user_id) VALUES 
(1, 60.00, 1, 'ABC-4959', '2026-01-12 10:30:00', '2026-01-12 13:30:00', 'Wallet', 12, 'SITE_001', 1),
(2, 40.00, 1, 'ABC-8277', '2026-02-17 14:00:00', '2026-02-17 16:00:00', 'Cash', 5, 'SITE_002', 2),
(3, 45.00, 1, 'ABC-3752', '2026-03-22 09:15:00', '2026-03-22 12:15:00', 'Credit Card', 24, 'SITE_003', 3),
(4, 100.00, 1, 'ABC-8711', '2026-04-07 08:00:00', '2026-04-07 13:00:00', 'Wallet', 99, 'SITE_004', 4),
(5, 30.00, 1, 'ABC-9727', '2026-01-05 18:30:00', '2026-01-05 20:30:00', 'Wallet', 31, 'SITE_005', 5),
(6, 40.00, 1, 'ABC-8778', '2026-02-11 07:00:00', '2026-02-11 11:00:00', 'Cash', 40, 'SITE_006', 6),
(7, 15.00, 1, 'ABC-3110', '2026-03-31 22:00:00', '2026-04-01 01:00:00', 'Credit Card', 1, 'SITE_007', 7),
(8, 20.00, 1, 'ABC-6107', '2026-04-27 14:00:00', '2026-04-27 18:00:00', 'Wallet', 45, 'SITE_008', 8),
(9, 10.00, 1, 'ABC-7739', '2026-01-17 06:00:00', '2026-01-17 08:00:00', 'Cash', 30, 'SITE_009', 9),
(10, 80.00, 1, 'ABC-9726', '2026-02-28 12:00:00', '2026-02-28 16:00:00', 'Wallet', 17, 'SITE_010', 10),
(11, 45.00, 1, 'ABC-1522', '2026-03-15 09:00:00', '2026-03-15 12:00:00', 'Cash', 20, 'SITE_011', 11),
(12, 10.00, 1, 'ABC-9399', '2026-04-10 13:00:00', '2026-04-10 15:00:00', 'Wallet', 48, 'SITE_012', 12),
(13, 60.00, 1, 'ABC-5663', '2026-01-20 10:00:00', '2026-01-20 13:00:00', 'Credit Card', 27, 'SITE_001', 13),
(14, 80.00, 1, 'ABC-2732', '2026-02-05 14:00:00', '2026-02-05 18:00:00', 'Wallet', 17, 'SITE_002', 14),
(15, 60.00, 1, 'ABC-8953', '2026-03-10 08:00:00', '2026-03-10 12:00:00', 'Wallet', 31, 'SITE_003', 15),
(16, 40.00, 1, 'ABC-4811', '2026-04-20 11:00:00', '2026-04-20 13:00:00', 'Cash', 27, 'SITE_004', 16),
(17, 75.00, 1, 'ABC-1278', '2026-01-18 09:00:00', '2026-01-18 14:00:00', 'Credit Card', 4, 'SITE_005', 17),
(18, 20.00, 1, 'ABC-8537', '2026-02-25 16:00:00', '2026-02-25 18:00:00', 'Wallet', 19, 'SITE_006', 18),
(19, 15.00, 1, 'ABC-9803', '2026-03-05 10:00:00', '2026-03-05 13:00:00', 'Cash', 18, 'SITE_007', 19),
(20, 25.00, 1, 'ABC-7909', '2026-04-12 14:00:00', '2026-04-12 19:00:00', 'Wallet', 47, 'SITE_008', 20),
(21, 15.00, 1, 'ABC-7021', '2026-01-22 08:00:00', '2026-01-22 11:00:00', 'Cash', 19, 'SITE_009', 21),
(22, 100.00, 1, 'ABC-7631', '2026-02-14 09:00:00', '2026-02-14 14:00:00', 'Credit Card', 29, 'SITE_010', 22),
(23, 60.00, 1, 'ABC-2106', '2026-03-18 11:00:00', '2026-03-18 15:00:00', 'Wallet', 46, 'SITE_011', 23),
(24, 15.00, 1, 'ABC-9880', '2026-04-25 10:00:00', '2026-04-25 13:00:00', 'Wallet', 26, 'SITE_012', 24),
(25, 40.00, 1, 'XYZ-2193', '2026-01-10 12:00:00', '2026-01-10 14:00:00', 'Cash', 31, 'SITE_001', 51),
(26, 60.00, 1, 'XYZ-2128', '2026-02-02 09:00:00', '2026-02-02 12:00:00', 'Cash', 10, 'SITE_002', 52),
(27, 30.00, 1, 'XYZ-3224', '2026-03-14 15:00:00', '2026-03-14 17:00:00', 'Credit Card', 49, 'SITE_003', 53),
(28, 80.00, 1, 'XYZ-9395', '2026-04-05 08:00:00', '2026-04-05 12:00:00', 'Cash', 15, 'SITE_004', 54),
(29, 45.00, 1, 'XYZ-7306', '2026-01-28 10:00:00', '2026-01-28 13:00:00', 'Credit Card', 9, 'SITE_005', 55),
(30, 20.00, 1, 'XYZ-7028', '2026-02-18 14:00:00', '2026-02-18 16:00:00', 'Cash', 30, 'SITE_006', 56),
(31, 25.00, 1, 'XYZ-7401', '2026-03-01 09:00:00', '2026-03-01 14:00:00', 'Cash', 43, 'SITE_007', 57),
(32, 10.00, 1, 'XYZ-8511', '2026-04-18 16:00:00', '2026-04-18 18:00:00', 'Cash', 16, 'SITE_008', 58),
(33, 15.00, 1, 'XYZ-6312', '2026-01-11 08:00:00', '2026-01-11 11:00:00', 'Credit Card', 48, 'SITE_009', 59),
(34, 40.00, 1, 'XYZ-3887', '2026-02-22 10:00:00', '2026-02-22 12:00:00', 'Cash', 2, 'SITE_010', 60),
(35, 60.00, 1, 'XYZ-9502', '2026-03-08 11:00:00', '2026-03-08 15:00:00', 'Cash', 42, 'SITE_011', 61),
(36, 20.00, 1, 'XYZ-6423', '2026-04-29 13:00:00', '2026-04-29 17:00:00', 'Credit Card', 37, 'SITE_012', 62),
(37, 80.00, 1, 'ABC-4959', '2026-05-01 09:00:00', '2026-05-01 13:00:00', 'Wallet', 15, 'SITE_001', 1),
(38, 40.00, 1, 'ABC-8277', '2026-05-02 14:00:00', '2026-05-02 16:00:00', 'Cash', 8, 'SITE_002', 2),
(39, 30.00, 1, 'ABC-3752', '2026-05-03 10:00:00', '2026-05-03 12:00:00', 'Credit Card', 45, 'SITE_003', 3),
(40, 20.00, 1, 'XYZ-9095', '2026-05-04 08:00:00', '2026-05-04 09:00:00', 'Cash', 50, 'SITE_004', 63),
(41, 45.00, 1, 'XYZ-5210', '2026-05-05 11:00:00', '2026-05-05 14:00:00', 'Cash', 33, 'SITE_005', 64);

-- ==========================================
-- 5. PENDING BILLS 
-- (Checked out recently, but is_paid = 0 and payment_method = 'Unpaid')
-- ==========================================
INSERT INTO parking_records (id, amount, is_paid, license_plate, park_in_time, park_out_time, payment_method, slot_number, site_id, user_id) VALUES 
(42, 60.00, 0, 'ABC-4959', '2026-05-07 09:00:00', '2026-05-07 12:00:00', 'Unpaid', 10, 'SITE_001', 1),
(43, 40.00, 0, 'ABC-8711', '2026-05-08 14:00:00', '2026-05-08 16:00:00', 'Unpaid', 22, 'SITE_002', 4),
(44, 45.00, 0, 'ABC-3110', '2026-05-07 10:00:00', '2026-05-07 13:00:00', 'Unpaid', 15, 'SITE_003', 7),
(45, 100.00, 0, 'ABC-9726', '2026-05-08 08:00:00', '2026-05-08 13:00:00', 'Unpaid', 99, 'SITE_004', 10),
(46, 30.00, 0, 'XYZ-5230', '2026-05-08 09:00:00', '2026-05-08 11:00:00', 'Unpaid', 5, 'SITE_005', 65),
(47, 40.00, 0, 'XYZ-4604', '2026-05-07 13:00:00', '2026-05-07 17:00:00', 'Unpaid', 11, 'SITE_006', 66);

-- ==========================================
-- 6. ACTIVE SESSIONS (Parked RIGHT NOW)
-- Assuming Current Context is May 9, 2026, ~14:47:00
-- park_out_time = NULL, is_paid = 0, payment_method = 'Unpaid', amount = 0.0
-- ==========================================
INSERT INTO parking_records (id, amount, is_paid, license_plate, park_in_time, park_out_time, payment_method, slot_number, site_id, user_id) VALUES 
-- Regular Users Currently Parked
(48, 0.00, 0, 'ABC-4959', '2026-05-09 10:15:00', NULL, 'Unpaid', 1, 'SITE_001', 1),
(49, 0.00, 0, 'ABC-8277', '2026-05-09 11:30:00', NULL, 'Unpaid', 2, 'SITE_001', 2),
(50, 0.00, 0, 'ABC-3752', '2026-05-09 12:45:00', NULL, 'Unpaid', 3, 'SITE_001', 3),
(51, 0.00, 0, 'ABC-8711', '2026-05-09 09:00:00', NULL, 'Unpaid', 1, 'SITE_002', 4),
(52, 0.00, 0, 'ABC-9727', '2026-05-09 13:10:00', NULL, 'Unpaid', 1, 'SITE_003', 5),
(53, 0.00, 0, 'ABC-8778', '2026-05-09 14:00:00', NULL, 'Unpaid', 2, 'SITE_003', 6),
(54, 0.00, 0, 'ABC-3110', '2026-05-09 08:30:00', NULL, 'Unpaid', 1, 'SITE_004', 7),
(55, 0.00, 0, 'ABC-6107', '2026-05-09 12:20:00', NULL, 'Unpaid', 1, 'SITE_005', 8),

-- Walk-In Users Currently Parked
(56, 0.00, 0, 'XYZ-4523', '2026-05-09 11:00:00', NULL, 'Unpaid', 4, 'SITE_001', 67),
(57, 0.00, 0, 'XYZ-6508', '2026-05-09 11:15:00', NULL, 'Unpaid', 5, 'SITE_001', 68),
(58, 0.00, 0, 'XYZ-5517', '2026-05-09 12:00:00', NULL, 'Unpaid', 6, 'SITE_001', 69),
(59, 0.00, 0, 'XYZ-5417', '2026-05-09 10:30:00', NULL, 'Unpaid', 2, 'SITE_002', 70),
(60, 0.00, 0, 'XYZ-6633', '2026-05-09 13:45:00', NULL, 'Unpaid', 3, 'SITE_003', 71),
(61, 0.00, 0, 'XYZ-9585', '2026-05-09 14:00:00', NULL, 'Unpaid', 4, 'SITE_003', 72),
(62, 0.00, 0, 'XYZ-1094', '2026-05-09 08:30:00', NULL, 'Unpaid', 2, 'SITE_004', 73);

-- ==========================================
-- 7. BULK DIVERSE PARKING HISTORY (250 MORE ROWS)
-- Covers different months, sites, user types, payment modes, and statuses.
-- ==========================================
DELIMITER $$

CREATE PROCEDURE seed_bulk_parking_records()
BEGIN
	DECLARE rid INT DEFAULT 63;
	DECLARE site_idx INT;
	DECLARE user_idx INT;
	DECLARE site_id_val VARCHAR(20);
	DECLARE vehicle_no_val VARCHAR(20);
	DECLARE park_in_val DATETIME;
	DECLARE park_out_val DATETIME;
	DECLARE payment_method_val VARCHAR(20);
	DECLARE amount_val DECIMAL(10,2);
	DECLARE slot_val INT;
	DECLARE site_rate DECIMAL(10,2);
	DECLARE duration_hours INT;

	WHILE rid <= 312 DO
		SET site_idx = MOD(rid, 12);
		SET user_idx = MOD(rid - 1, 95) + 1;
		SET duration_hours = 1 + MOD(rid, 5);

		SET site_id_val = CASE site_idx
			WHEN 0 THEN 'SITE_001'
			WHEN 1 THEN 'SITE_002'
			WHEN 2 THEN 'SITE_003'
			WHEN 3 THEN 'SITE_004'
			WHEN 4 THEN 'SITE_005'
			WHEN 5 THEN 'SITE_006'
			WHEN 6 THEN 'SITE_007'
			WHEN 7 THEN 'SITE_008'
			WHEN 8 THEN 'SITE_009'
			WHEN 9 THEN 'SITE_010'
			WHEN 10 THEN 'SITE_011'
			ELSE 'SITE_012'
		END;

		SET site_rate = CASE site_idx
			WHEN 0 THEN 20
			WHEN 1 THEN 20
			WHEN 2 THEN 15
			WHEN 3 THEN 20
			WHEN 4 THEN 15
			WHEN 5 THEN 10
			WHEN 6 THEN 5
			WHEN 7 THEN 5
			WHEN 8 THEN 5
			WHEN 9 THEN 20
			WHEN 10 THEN 15
			ELSE 5
		END;

		SELECT u.vehicle_no INTO vehicle_no_val
		FROM users u
		WHERE u.id = user_idx
		LIMIT 1;

		SET park_in_val = TIMESTAMP(
			DATE_ADD('2026-01-01', INTERVAL MOD(rid - 63, 150) DAY),
			MAKETIME(7 + MOD(rid, 10), MOD(rid * 7, 60), 0)
		);

		SET slot_val = 1 + MOD(rid * 7, 50);

		IF MOD(rid, 17) = 0 THEN
			SET park_out_val = NULL;
			SET payment_method_val = 'Unpaid';
			SET amount_val = 0.00;
		ELSE
			SET park_out_val = DATE_ADD(park_in_val, INTERVAL duration_hours HOUR);
			IF MOD(rid, 9) = 0 THEN
				SET payment_method_val = 'Unpaid';
			ELSEIF MOD(rid, 4) = 0 THEN
				SET payment_method_val = 'Wallet';
			ELSEIF MOD(rid, 4) = 1 THEN
				SET payment_method_val = 'Cash';
			ELSEIF MOD(rid, 4) = 2 THEN
				SET payment_method_val = 'Credit Card';
			ELSE
				SET payment_method_val = 'Debit Card';
			END IF;
			SET amount_val = ROUND(site_rate * duration_hours, 2);
		END IF;

		INSERT INTO parking_records (
			id,
			amount,
			is_paid,
			license_plate,
			park_in_time,
			park_out_time,
			payment_method,
			slot_number,
			site_id,
			user_id
		) VALUES (
			rid,
			amount_val,
			IF(park_out_val IS NULL, 0, IF(payment_method_val = 'Unpaid', 0, 1)),
			vehicle_no_val,
			park_in_val,
			park_out_val,
			payment_method_val,
			slot_val,
			site_id_val,
			user_idx
		);

		SET rid = rid + 1;
	END WHILE;
END$$

DELIMITER ;

CALL seed_bulk_parking_records();
DROP PROCEDURE seed_bulk_parking_records;