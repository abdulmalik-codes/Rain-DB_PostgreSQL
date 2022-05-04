
CREATE TABLE IF NOT EXISTS admin(
    id serial,
    email character varying(50),
    password character varying(50)
);

CREATE TABLE IF NOT EXISTS employees(
    id serial,
    fullname character varying(100),
    email character varying(100),
    password character varying(50)
);

-- DROP TABLE admin;
-- DROP TABLE employees;
