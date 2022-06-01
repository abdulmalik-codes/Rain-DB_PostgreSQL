-- DROP TABLE tasks;
-- DROP TABLE hod;
-- DROP TABLE employees;
-- DROP TABLE admin;
-- DROP TABLE departments;
-- DROP TABLE messages; 

-- CREATE TABLE IF NOT EXISTS admin(
--     id SERIAL PRIMARY KEY,
--     email character varying(100) NOT NULL UNIQUE,
--     password character varying(200) NOT NULL
-- );

-- CREATE TABLE IF NOT EXISTS departments(
--     id SERIAL PRIMARY KEY,
--     department character varying(50) NOT NULL UNIQUE
-- );

-- CREATE TABLE IF NOT EXISTS employees(
--     id serial PRIMARY KEY,
--     name character varying(100) NOT NULL,
--     surname character varying(100) NOT NULL,
--     cell character varying(10) NOT NULL,
--     position character varying(100) NOT NULL,
--     department character varying(100) NOT NULL,
--     joined character varying(100) NOT NULL,
--     email character varying(100) NOT NULL UNIQUE,
--     password character varying(100) NOT NULL,
--     FOREIGN KEY(department) REFERENCES departments (department)
-- );

-- CREATE TABLE IF NOT EXISTS hod(
--     id SERIAL PRIMARY KEY,
--     email character varying(100) NOT NULL UNIQUE,
--     department character varying(100) NOT NULL,
--     admin character varying(100) NOT NULL,
--     promoted character varying(100) NOT NULL,
--     FOREIGN KEY(department) REFERENCES departments (department),
--     FOREIGN KEY(admin) REFERENCES admin (email),
--     FOREIGN KEY(email) REFERENCES employees (email)
-- );

-- CREATE TABLE IF NOT EXISTS tasks(
--     id serial PRIMARY KEY,
--     name character varying(50) NOT NULL UNIQUE,
--     description character varying(5760) NOT NULL,
--     assignee character varying(100) NOT NULL,
--     start_date character varying(50),
--     due_date character varying(50) NOT NULL,
--     progress character varying(100),
--     team_members character varying(900),
--     project_manager character varying(100) NOT NULL,
--     FOREIGN KEY(assignee) REFERENCES employees (email),
--     FOREIGN KEY(project_manager) REFERENCES hod (email)
-- );

-- CREATE TABLE IF NOT EXISTS messages(
--     id SERIAL PRIMARY KEY,
-- );