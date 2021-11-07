INSERT INTO department (name)
VALUES ("Management"),
("Development"),
("Marketing"),
("Education"),
("Floor Staff");

INSERT INTO role (title, salary, dep_id)
VALUES ("CEO", 200000, 1),
("Floor Manager", 80000, 1),
("Head Developement", 100000, 2),
("Sr. Marketing", 100000, 3),
("Jr. Marketing", 60000, 3),
("Science", 60000, 4),
("Engineering", 60000, 4),
("Early Education", 50000, 4),
("Visitor Experience Guide", 30000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Chase", "Rivera", 5, null),
("Putter", "Berg", 1, 1),
("Miranda", "Sans", 1, 1),
("Chris", "Cunning", 4, null),
("The", "Friz", 4, null)
