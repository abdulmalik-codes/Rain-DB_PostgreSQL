
-- CREATE TABLE IF NOT EXISTS admin(
--     id SERIAL PRIMARY KEY,
--     email character varying(100) NOT NULL UNIQUE,
--     password character varying(200) NOT NULL
-- );

-- CREATE TABLE IF NOT EXISTS hod(
--     id SERIAL PRIMARY KEY,
--     name character varying(50) NOT NULL,
--     surname character varying(50) NOT NULL,
--     cell character varying(10) NOT NULL,
--     department character varying(100) NOT NULL,
--     email character varying(100) NOT NULL UNIQUE,
--     password character varying(200) NOT NULL
-- );

-- CREATE TABLE IF NOT EXISTS employees(
--     id serial PRIMARY KEY,
--     name character varying(50) NOT NULL,
--     surname character varying(50) NOT NULL,
--     cell character varying(10) NOT NULL,
--     position character varying(100) NOT NULL,
--     department character varying(100) NOT NULL,
--     hod character varying(100) NOT NULL,
--     email character varying(100) NOT NULL UNIQUE,
--     password character varying(50) NOT NULL,
--     FOREIGN KEY(department) REFERENCES departments (name),
--     FOREIGN KEY(hod) REFERENCES hod (email)
-- );

-- CREATE TABLE IF NOT EXISTS departments(
--     id SERIAL PRIMARY KEY,
--     name character varying(50) NOT NULL,
--     hod character varying(100) NOT NULL,
--     FOREIGN KEY(hod) REFERENCES hod (email)
-- );

-- CREATE TABLE IF NOT EXISTS tasks(
--     id serial PRIMARY KEY,
--     name character varying(50) NOT NULL,
--     description character varying(5760) NOT NULL,
--     assignee character varying(100),
--     start_date character varying(50),
--     due_date character varying(50),
--     progress character varying(100),
--     team_members character varying(900),
--     project_manager character varying(100) NOT NULL,
--     FOREIGN KEY(assignee) REFERENCES employees (email),
--     FOREIGN KEY(project_manager) REFERENCES hod (email)
-- );

-- INSERT INTO tasks("name", "description", "assignee", "start_date", "due_date", "progress", "team_members", "project_manager")
-- VALUES("name", "TASK DESCRIPTION", "ME", "NOW", "TOMORROW", "IN PROGRESS", "GHIYAATH", "ADMIN")

-- INSERT INTO tasks("name", "description", "assignee", "start_date", "due_date", "progress", "team_members", "project_manager")
-- VALUES($1, $2, $3, $4, $5, $6, $7, $8),
-- ["TASK", "TASK DESCRIPTION", "ME", "NOW", "TOMORROW", "IN PROGRESS", "GHIYAATH", "ADMIN"]

-- CREATE TABLE IF NOT EXISTS devops(
--     id serial PRIMARY KEY,
--     hod character varying(100),
--     developers character varying(100),
--     FOREIGN KEY(hod) REFERENCES admin (email),
--     FOREIGN KEY(developers) REFERENCES employees (email)
-- )

-- CREATE TABLE IF NOT EXISTS development(
--     id serial PRIMARY KEY,
--     hod character varying(100),
--     testers character varying(100),
--     FOREIGN KEY(hod) REFERENCES admin (email),
--     FOREIGN KEY(testers) REFERENCES employees (email)
-- )
 

-- DROP TABLE admin;
-- DROP TABLE employees;
-- DROP TABLE tasks;
-- DROP TABLE messages;


--  INSERT INTO tasks ( 
--      name,
--      description,
--      assignee,
--      start_date,
--      due_date,
--      progress,
--      team_members,
--      project_manager
--    )
--  VALUES ( 
--      'task name',
--      'task description',
--      'jesse.terblanche@rain.co.za',
--      'today',
--      'tomorrow',
--      'in progress',
--      'members',
--      'test@test.com'
--    );