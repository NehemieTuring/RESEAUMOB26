--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: alert_events; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: alert_rules; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: assignments; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: brands; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: budgets; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: document_alerts; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: driver_documents; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: driver_scores; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: drivers; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.drivers (user_id, assigned_vehicle_id, fleet_id, licence_number, photo_url, status, deleted, manager_id) VALUES ('17b60df1-c221-4b5e-964f-4f3fbdeefbeb', '37d7ef73-9250-4df8-8fa0-e253f7866bf5', NULL, '3635', NULL, 'ACTIVE', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.drivers (user_id, assigned_vehicle_id, fleet_id, licence_number, photo_url, status, deleted, manager_id) VALUES ('071c569f-e7c4-48b6-a58c-d5a986bf6b2e', '2d7df37f-a454-45df-aad6-8e4d5c673416', NULL, '763829', NULL, 'ACTIVE', false, 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: financial_parameters; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.financial_parameters (id, cost_per_km, depreciation_rate, insurance_expired_at, insurance_number, purchased_at, registered_at, vehicle_id) VALUES ('6078a7fb-77ae-44fc-9aa8-f5bbf7ccfdc5', NULL, NULL, NULL, NULL, NULL, NULL, '2d7df37f-a454-45df-aad6-8e4d5c673416') ON CONFLICT DO NOTHING;
INSERT INTO fleet.financial_parameters (id, cost_per_km, depreciation_rate, insurance_expired_at, insurance_number, purchased_at, registered_at, vehicle_id) VALUES ('49993bc9-7d05-4555-ba70-a2ff80649b7c', NULL, NULL, NULL, NULL, NULL, NULL, '37d7ef73-9250-4df8-8fa0-e253f7866bf5') ON CONFLICT DO NOTHING;
INSERT INTO fleet.financial_parameters (id, cost_per_km, depreciation_rate, insurance_expired_at, insurance_number, purchased_at, registered_at, vehicle_id) VALUES ('bb8356e2-1b00-4b56-b68b-88fef6254bad', NULL, NULL, NULL, NULL, NULL, NULL, '9153c415-4cad-4731-a37a-08afafdff1ec') ON CONFLICT DO NOTHING;


--
-- Data for Name: fleet_managers; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('a582a614-ff02-4187-9089-b3ec6824eae6', NULL, NULL, NULL, 'ACME Transport', '+237600000111') ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('08066d0b-c204-4f4f-9010-764fe6dd3ea0', NULL, NULL, NULL, 'C1', '+237601') ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('3c356943-ae11-4bb8-9e6a-1ecca72e2a72', NULL, NULL, NULL, 'C2', '+237602') ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('9f8cbe78-ac65-48b4-99b2-8c60b1b9a303', NULL, NULL, NULL, 'AxeCap', '673727475') ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('a0250df2-03bf-4c92-a21f-3175927ebb5b', NULL, NULL, NULL, 'AXE CAPITALE', '657473724') ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('3e454cf9-ee8d-4bab-bfb2-cc4a53b2a784', NULL, NULL, NULL, 'AXE CAPITALEL', '674757378') ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('8342c5f7-56fc-45de-8bde-229559c47a67', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleet_managers (user_id, company_address, company_city, company_logo_url, company_name, company_phone) VALUES ('a910502f-e987-4893-a58d-dbce62df07b9', NULL, NULL, '/api/v1/files/e2b90688-bef6-4b66-92b9-2b5e26936e17.jpeg', 'AXECAP', '647376345') ON CONFLICT DO NOTHING;


--
-- Data for Name: fleets; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.fleets (id, created_at, manager_id, name, organization_id, phone_number) VALUES ('107b80e9-a681-477c-803b-04e3c944a806', '2026-07-22 04:53:08.231682+01', 'a910502f-e987-4893-a58d-dbce62df07b9', 'FleeAxe', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.fleets (id, created_at, manager_id, name, organization_id, phone_number) VALUES ('107d3f9d-2fb4-4c21-956a-1e0eba9c9eef', '2026-07-22 17:04:57.107495+01', '8342c5f7-56fc-45de-8bde-229559c47a67', 'FeanKléo', NULL, NULL) ON CONFLICT DO NOTHING;


--
-- Data for Name: fuel_recharges; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: fuel_types; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: geofence_events; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: geofence_point_zone_linkages; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: geofence_points; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: geofence_zones; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: incidents; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.incidents (id, cost, created_at, deleted, deleted_at, description, driver_full_name, driver_id, incident_date_time, latitude, longitude, reported_by, severity, status, type, vehicle_id, vehicle_registration, manager_id) VALUES ('00d595bf-524d-4ab6-9d65-2f692dd46997', NULL, '2026-07-23 05:19:53.243677+01', false, NULL, 'Hdijcoipjpejfaj', 'Kansan Martial', '071c569f-e7c4-48b6-a58c-d5a986bf6b2e', '2026-07-23 05:19:53.243677+01', NULL, NULL, NULL, 'MEDIUM', 'REPORTED', 'ACCIDENT', '2d7df37f-a454-45df-aad6-8e4d5c673416', 'BC-456-55', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.incidents (id, cost, created_at, deleted, deleted_at, description, driver_full_name, driver_id, incident_date_time, latitude, longitude, reported_by, severity, status, type, vehicle_id, vehicle_registration, manager_id) VALUES ('5b40f811-0688-4443-98d5-c69c1243f2ce', NULL, '2026-07-23 05:24:47.270755+01', false, NULL, 'Je suis Kassan et j''ai un véritable problème ', 'Kansan Martial', '071c569f-e7c4-48b6-a58c-d5a986bf6b2e', '2026-07-23 05:24:47.27176+01', NULL, NULL, NULL, 'MEDIUM', 'REPORTED', 'ACCIDENT', '2d7df37f-a454-45df-aad6-8e4d5c673416', 'BC-456-55', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.incidents (id, cost, created_at, deleted, deleted_at, description, driver_full_name, driver_id, incident_date_time, latitude, longitude, reported_by, severity, status, type, vehicle_id, vehicle_registration, manager_id) VALUES ('2b3cd45d-1e5d-4906-8eab-cdfbcf7ae436', NULL, '2026-07-23 05:26:45.889183+01', false, NULL, 'Je suis Kassan et j''ai un véritable problème panne', 'Kansan Martial', '071c569f-e7c4-48b6-a58c-d5a986bf6b2e', '2026-07-23 05:26:45.89019+01', NULL, NULL, NULL, 'MEDIUM', 'REPORTED', 'BREAKDOWN', '2d7df37f-a454-45df-aad6-8e4d5c673416', 'BC-456-55', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.incidents (id, cost, created_at, deleted, deleted_at, description, driver_full_name, driver_id, incident_date_time, latitude, longitude, reported_by, severity, status, type, vehicle_id, vehicle_registration, manager_id) VALUES ('ac877c43-0b8c-4162-b33b-2b73a059e9cb', NULL, '2026-07-23 05:26:53.389695+01', false, NULL, 'Je suis Kassan et j''ai un véritable problème panne et autre', 'Kansan Martial', '071c569f-e7c4-48b6-a58c-d5a986bf6b2e', '2026-07-23 05:26:53.390748+01', NULL, NULL, NULL, 'MEDIUM', 'REPORTED', 'OTHER', '2d7df37f-a454-45df-aad6-8e4d5c673416', 'BC-456-55', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;


--
-- Data for Name: kpi_snapshots; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: maintenance_alerts; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: maintenance_parameters; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.maintenance_parameters (id, battery_health, engine_status, last_maintenance_at, maintenance_status, next_maintenance_at, vehicle_id) VALUES ('1bde0adf-a70b-47e4-b9af-d5c9c85968b7', NULL, 'OK', NULL, 'UP_TO_DATE', NULL, '2d7df37f-a454-45df-aad6-8e4d5c673416') ON CONFLICT DO NOTHING;
INSERT INTO fleet.maintenance_parameters (id, battery_health, engine_status, last_maintenance_at, maintenance_status, next_maintenance_at, vehicle_id) VALUES ('4a50e154-a468-4572-ac84-8b10ce7b5f2a', NULL, 'OK', NULL, 'UP_TO_DATE', NULL, '37d7ef73-9250-4df8-8fa0-e253f7866bf5') ON CONFLICT DO NOTHING;
INSERT INTO fleet.maintenance_parameters (id, battery_health, engine_status, last_maintenance_at, maintenance_status, next_maintenance_at, vehicle_id) VALUES ('b2e9da8a-44a0-4085-851e-f88a9eb3aec1', NULL, 'OK', NULL, 'UP_TO_DATE', NULL, '9153c415-4cad-4731-a37a-08afafdff1ec') ON CONFLICT DO NOTHING;


--
-- Data for Name: maintenance_plans; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: maintenances; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: manufacturers; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.notifications (id, created_at, is_read, message, title, type, user_id) VALUES ('f3ec1713-a89b-48ce-bb61-db4794362322', '2026-07-23 05:19:53.262185+01', false, 'Incident (ACCIDENT) sur BC-456-55', 'Nouvel incident', 'INCIDENT', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.notifications (id, created_at, is_read, message, title, type, user_id) VALUES ('583dc9dd-a075-4568-a73d-18c2e555d26e', '2026-07-23 05:24:47.278774+01', false, 'Incident (ACCIDENT) sur BC-456-55', 'Nouvel incident', 'INCIDENT', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.notifications (id, created_at, is_read, message, title, type, user_id) VALUES ('ecb7f3d7-9c63-4707-9809-36436084d12d', '2026-07-23 05:26:45.893512+01', false, 'Incident (BREAKDOWN) sur BC-456-55', 'Nouvel incident', 'INCIDENT', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.notifications (id, created_at, is_read, message, title, type, user_id) VALUES ('fff31a9c-81bd-453a-9c35-0da86861f96f', '2026-07-23 05:26:53.39397+01', false, 'Incident (OTHER) sur BC-456-55', 'Nouvel incident', 'INCIDENT', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;


--
-- Data for Name: operational_parameters; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.operational_parameters (id, bearing, current_speed, fuel_level, latitude, longitude, mileage, odometer_reading, status, "timestamp", vehicle_id) VALUES ('2e7a9a0b-d2be-4001-9e4e-2afe56a6a9eb', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-07-22 05:15:27.129896+01', '2d7df37f-a454-45df-aad6-8e4d5c673416') ON CONFLICT DO NOTHING;
INSERT INTO fleet.operational_parameters (id, bearing, current_speed, fuel_level, latitude, longitude, mileage, odometer_reading, status, "timestamp", vehicle_id) VALUES ('fa40f3d2-e0f6-46ed-aada-1aa1e9f15ef9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-07-22 05:23:09.386652+01', '37d7ef73-9250-4df8-8fa0-e253f7866bf5') ON CONFLICT DO NOTHING;
INSERT INTO fleet.operational_parameters (id, bearing, current_speed, fuel_level, latitude, longitude, mileage, odometer_reading, status, "timestamp", vehicle_id) VALUES ('259bb36e-0608-4d28-a1b0-83bd75fcfa32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-07-22 06:24:06.396227+01', '9153c415-4cad-4731-a37a-08afafdff1ec') ON CONFLICT DO NOTHING;


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('0a23448f-38e2-4134-8159-a4691d2c667d', '2026-07-22 12:01:35.243279+01', 'Organisation 0a23448f', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('b6aacb52-2720-4701-9797-8f8b0d5e2783', '2026-07-22 12:01:35.243279+01', 'Organisation b6aacb52', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('5d10c440-1de3-4f9e-924c-6a154fac865f', '2026-07-22 12:01:35.243279+01', 'Organisation 5d10c440', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('de63c74d-2306-47ba-9e6b-b9b251430c14', '2026-07-22 12:01:35.243279+01', 'Organisation de63c74d', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('7479d7cc-7132-4c75-8bef-3e1fb31de0b7', '2026-07-22 12:01:35.243279+01', 'Organisation 7479d7cc', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('d5cbbc9d-8791-4037-8414-8ec74b62292b', '2026-07-22 12:01:35.243279+01', 'Organisation d5cbbc9d', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('6a8bd006-a069-443f-816f-6dfcefa9cb20', '2026-07-22 12:01:35.243279+01', 'Organisation 6a8bd006', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('e9401480-9683-408a-b0e9-57b32f73207e', '2026-07-22 12:01:35.243279+01', 'Organisation e9401480', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.organizations (id, created_at, name, tax_id, uin) VALUES ('0f482339-3402-459d-b787-29d351414f0c', '2026-07-22 12:01:35.243279+01', 'Organisation 0f482339', NULL, NULL) ON CONFLICT DO NOTHING;


--
-- Data for Name: routes; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: schedules; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: stored_files; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('b90ca991-e7b9-4fc3-8b6f-419ebb5163bb', 'image/png', 'subscription', 'tiny.png', NULL, 'ANONYMOUS', 13, '4e312ba6-7763-4dde-9f3f-137c45ff4b32.png', '2026-07-21 15:30:25.378565+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('ae80bf37-18f2-4483-a026-67c8f4e6a2cc', 'image/png', 'PROFILE', 'cb143f35-3ac2-41bb-8dc9-6e1d971994fa', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 41356, '6b3d62cd-0aeb-472e-a4d8-5f81897fb639', '2026-07-22 11:46:33.532041+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('8514b737-e24b-412e-bbb0-c0c9d4237602', 'image/png', 'PROFILE', '4be73142-e3e0-4bb6-a086-b52bf5a4f198', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 146035, '684f32ce-28a6-4fab-84ea-6544367bfd13', '2026-07-22 14:37:48.644449+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('c8c8c299-fade-48e8-be49-59de06ae50dc', 'image/png', 'PROFILE', 'ebf84fa4-7be5-49a2-9fb5-4f363c7a18a8', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 54452, 'd931ac01-e8d4-4d4a-90ba-433d39870a79', '2026-07-22 14:45:01.122795+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('2396892c-1e79-4a95-9911-eeb44687c676', 'image/png', 'PROFILE', '20282692-87da-4f75-8287-7a9b4027ba3c', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 55352, 'a434905c-913b-4332-9702-4b8ec3401df6', '2026-07-22 14:50:52.453289+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('14875e31-7548-40f2-9c50-086af232d80e', 'image/png', 'PROFILE', 'c78eefbd-f83d-438e-9bbf-ec21e01afd7d', '8342c5f7-56fc-45de-8bde-229559c47a67', 'USER', 146035, 'de355dbf-560d-4b55-9a57-c7eaae4939d8', '2026-07-22 15:39:27.957416+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('c5d5262f-4641-4832-8cea-b0bb0bd8a33f', 'image/png', 'PROFILE', '5975c2be-7961-4972-93ac-1fc86755c307', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 63301, '89c81d6b-0189-4567-bc85-86f8161d44d3', '2026-07-22 17:30:24.209574+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('fc78c67c-594f-4127-8b35-dcae593f0865', 'image/png', 'PROFILE', '291d1f8c-11a8-48db-9105-45e1f64d0f94', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 63301, 'f8017428-6a79-415e-afe1-904a16121d8e', '2026-07-22 17:35:46.621212+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('5178fd30-a66c-40ff-b564-3a4f11ed9a39', 'image/png', 'PROFILE', '786053e0-d844-4029-b278-b4a88b85d293', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 18927, 'e03cfc1c-928b-4a87-843a-29138a85ab6f', '2026-07-22 17:39:27.537573+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('a9ecf5f8-c458-4df9-a958-82e5facd137b', 'image/png', 'PROFILE', '98dec07b-3875-41ea-af4b-91c041d8b04b', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 18927, 'd2f9eca7-a0fc-4154-8a2d-0369fa5b027c', '2026-07-22 17:39:34.957767+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('00a75d1e-dc5e-4919-97ca-d1d8bfc08d99', 'image/png', 'PROFILE', 'b9f0650d-c5dc-4414-8fe4-730f9ffdf5c3', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 18927, 'b6cef273-a32a-4b15-976a-d3dfed293bc3', '2026-07-22 17:46:20.835911+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('54c15d11-ba28-4821-bf45-8ec811090a88', 'image/png', 'PROFILE', '1f22fd6f-20e1-4034-8650-4a98d0fb3be6', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 18927, '08a7bb48-59f5-4760-9ec8-504b7f4a9b97', '2026-07-22 17:46:27.778995+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('43da25c0-7b33-467c-9fe0-0decd978d23c', 'image/png', 'PROFILE', '6a37f3d7-3911-4b83-a3d9-7ffc46c4652a', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 18927, '2f303c21-b507-46b6-81e3-8e0f9517eb04', '2026-07-22 18:07:45.873078+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('facfd2ee-62db-419e-8892-c1d037b13794', 'image/jpeg', 'PROFILE', '40f7856b-b65a-48ea-8fa7-fe1f374b05be.jpeg', 'a910502f-e987-4893-a58d-dbce62df07b9', 'USER', 91915, 'ff33f6a5-4a66-48a8-bc6d-e51af7b88195.jpeg', '2026-07-23 12:24:20.598589+01') ON CONFLICT DO NOTHING;
INSERT INTO fleet.stored_files (id, content_type, file_type, original_name, owner_id, owner_type, size_bytes, stored_path, uploaded_at) VALUES ('4522d02f-f288-4f6c-8994-3377bcfa3561', 'image/jpeg', 'LOGO', 'cda9211b-03ff-4f90-abf3-2fc62000d5f5.jpeg', 'a910502f-e987-4893-a58d-dbce62df07b9', 'COMPANY', 93355, 'e2b90688-bef6-4b66-92b9-2b5e26936e17.jpeg', '2026-07-23 12:24:34.986576+01') ON CONFLICT DO NOTHING;


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: transmission_types; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: trip_details; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: trips; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: usage_types; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.user_roles (id, role, user_id) VALUES (1, 'FLEET_SUPER_ADMIN', '8a2c76da-a83d-4a1e-809f-6ef64fd78e46') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (2, 'FLEET_MANAGER', 'a582a614-ff02-4187-9089-b3ec6824eae6') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (3, 'FLEET_MANAGER', '08066d0b-c204-4f4f-9010-764fe6dd3ea0') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (4, 'FLEET_MANAGER', '3c356943-ae11-4bb8-9e6a-1ecca72e2a72') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (5, 'FLEET_MANAGER', '9f8cbe78-ac65-48b4-99b2-8c60b1b9a303') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (6, 'FLEET_MANAGER', 'a0250df2-03bf-4c92-a21f-3175927ebb5b') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (7, 'FLEET_ADMIN', '3e454cf9-ee8d-4bab-bfb2-cc4a53b2a784') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (8, 'FLEET_MANAGER', '3e454cf9-ee8d-4bab-bfb2-cc4a53b2a784') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (9, 'FLEET_ADMIN', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (10, 'FLEET_MANAGER', 'a910502f-e987-4893-a58d-dbce62df07b9') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (17, 'FLEET_DRIVER', '17b60df1-c221-4b5e-964f-4f3fbdeefbeb') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (18, 'FLEET_MANAGER', '8342c5f7-56fc-45de-8bde-229559c47a67') ON CONFLICT DO NOTHING;
INSERT INTO fleet.user_roles (id, role, user_id) VALUES (19, 'FLEET_DRIVER', '071c569f-e7c4-48b6-a58c-d5a986bf6b2e') ON CONFLICT DO NOTHING;


--
-- Data for Name: users; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.users (id, email, first_name, is_active, kernel_id, last_login_at, last_name, organization_id, password_hash, phone, photo_url, username) VALUES ('a910502f-e987-4893-a58d-dbce62df07b9', 'nehemie4@gmail.com', 'Nehemie', true, NULL, '2026-07-23 12:54:10.07572+01', 'Turing', '6a8bd006-a069-443f-816f-6dfcefa9cb20', '$2a$10$M1eayp099S/fmrQsTEIOtOmiJLzmN7AuN.gFv9XGj5XuyBmoFu0cq', '647376345', '/api/v1/files/ff33f6a5-4a66-48a8-bc6d-e51af7b88195.jpeg', 'nehemie.turing.nehemi2') ON CONFLICT DO NOTHING;
INSERT INTO fleet.users (id, email, first_name, is_active, kernel_id, last_login_at, last_name, organization_id, password_hash, phone, photo_url, username) VALUES ('8a2c76da-a83d-4a1e-809f-6ef64fd78e46', 'joeltaba4@gmail.com', 'Joel', true, NULL, '2026-07-15 17:26:21.686745+01', 'Taba', 'e9401480-9683-408a-b0e9-57b32f73207e', '$2a$10$Ya42dIsmW9RsKxKPKHJ7E.Bcm3AiwK27bjhxok8ym3gBRbl3cMUYi', '+237600000000', NULL, 'joeltaba4') ON CONFLICT DO NOTHING;
INSERT INTO fleet.users (id, email, first_name, is_active, kernel_id, last_login_at, last_name, organization_id, password_hash, phone, photo_url, username) VALUES ('8342c5f7-56fc-45de-8bde-229559c47a67', 'turing@gmail.com', 'Turing', true, NULL, '2026-07-22 16:58:13.167745+01', 'Basket', '6a8bd006-a069-443f-816f-6dfcefa9cb20', '$2a$10$2Yu9W45BSvoWtMpjdeu/GuUY98ESDOCvtCtz2npviYzlR0aEY4O6G', '674737572', '/api/v1/files/de355dbf-560d-4b55-9a57-c7eaae4939d8', 'turing@gmail.com') ON CONFLICT DO NOTHING;
INSERT INTO fleet.users (id, email, first_name, is_active, kernel_id, last_login_at, last_name, organization_id, password_hash, phone, photo_url, username) VALUES ('17b60df1-c221-4b5e-964f-4f3fbdeefbeb', 'driver1@gmail.com', 'Franky', true, NULL, '2026-07-22 17:49:29.947023+01', 'Dialoa', '6a8bd006-a069-443f-816f-6dfcefa9cb20', '$2a$10$3oyDZq0nxHwL4jS4zuJxT.WvqJfDHjLpBI71aSO169Zo9IaMejxF2', '647372437', NULL, 'frank.dialo') ON CONFLICT DO NOTHING;
INSERT INTO fleet.users (id, email, first_name, is_active, kernel_id, last_login_at, last_name, organization_id, password_hash, phone, photo_url, username) VALUES ('071c569f-e7c4-48b6-a58c-d5a986bf6b2e', 'driver2@gmail.com', 'Kansan', true, NULL, '2026-07-23 05:14:14.870203+01', 'Martial', '6a8bd006-a069-443f-816f-6dfcefa9cb20', '$2a$10$hONsXxvKxG2Y3NagfR1PquqInzB9uclyM2jdk/i4jZSWqKh3AWxWa', '678434567', NULL, 'kansan.martial') ON CONFLICT DO NOTHING;


--
-- Data for Name: vehicle_colors; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: vehicle_documents; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: vehicle_illustration_images; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: vehicle_models; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: vehicle_sizes; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: vehicle_types; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--

INSERT INTO fleet.vehicles (id, average_fuel_consumption, brand, color, current_driver_id, deleted, deleted_at, fleet_id, fuel_type, geofence_remote_id, license_plate, manager_id, manufacturing_year, model, photo_url, registration_photo_url, serial_number_photo_url, status, tank_capacity, total_seat_number, transmission_type, vehicle_serial_number, vehicle_type_id) VALUES ('37d7ef73-9250-4df8-8fa0-e253f7866bf5', NULL, 'Frank', NULL, '17b60df1-c221-4b5e-964f-4f3fbdeefbeb', false, NULL, '107b80e9-a681-477c-803b-04e3c944a806', 'PETROL', NULL, 'NANANI', 'a910502f-e987-4893-a58d-dbce62df07b9', NULL, 'ZEBO', NULL, NULL, NULL, 'AVAILABLE', NULL, 5, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.vehicles (id, average_fuel_consumption, brand, color, current_driver_id, deleted, deleted_at, fleet_id, fuel_type, geofence_remote_id, license_plate, manager_id, manufacturing_year, model, photo_url, registration_photo_url, serial_number_photo_url, status, tank_capacity, total_seat_number, transmission_type, vehicle_serial_number, vehicle_type_id) VALUES ('9153c415-4cad-4731-a37a-08afafdff1ec', NULL, 'Dex', NULL, '17b60df1-c221-4b5e-964f-4f3fbdeefbeb', false, NULL, '107b80e9-a681-477c-803b-04e3c944a806', 'PETROL', NULL, 'RD-456-56', 'a910502f-e987-4893-a58d-dbce62df07b9', NULL, 'Frax', NULL, NULL, NULL, 'AVAILABLE', NULL, 5, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO fleet.vehicles (id, average_fuel_consumption, brand, color, current_driver_id, deleted, deleted_at, fleet_id, fuel_type, geofence_remote_id, license_plate, manager_id, manufacturing_year, model, photo_url, registration_photo_url, serial_number_photo_url, status, tank_capacity, total_seat_number, transmission_type, vehicle_serial_number, vehicle_type_id) VALUES ('2d7df37f-a454-45df-aad6-8e4d5c673416', NULL, 'Toyota', NULL, '071c569f-e7c4-48b6-a58c-d5a986bf6b2e', false, NULL, '107b80e9-a681-477c-803b-04e3c944a806', 'PETROL', NULL, 'BC-456-55', 'a910502f-e987-4893-a58d-dbce62df07b9', NULL, 'Carina', NULL, NULL, NULL, 'AVAILABLE', NULL, 5, NULL, NULL, NULL) ON CONFLICT DO NOTHING;


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Data for Name: wallets; Type: TABLE DATA; Schema: fleet; Owner: fleet_admin
--



--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: fleet; Owner: fleet_admin
--

SELECT pg_catalog.setval('fleet.user_roles_id_seq', 19, true);


--
-- PostgreSQL database dump complete
--

\unrestrict qiQTMmHZHum0n9v2rJiIVMKuX5hpeH0f8cZhelCObEkPJ1Il5O3fcmbYHEeLzq8

