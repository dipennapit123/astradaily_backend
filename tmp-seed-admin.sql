INSERT INTO "Admin" ("name", "email", "passwordHash", "role")
VALUES ('Super Admin', 'admin@example.com', '$2a$10$cXbVN3PlYKAT9J4r./WhAORpHtCQ5uEQG0ZgxUjQCHI15BkONfToW', 'SUPER_ADMIN')
ON CONFLICT ("email") DO NOTHING;
