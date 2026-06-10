USE freelancehub;

-- Safe migration for the current FreelanceHub database.
-- This keeps existing data and only adds missing columns/objects.
-- Works on MySQL versions that do not support ADD COLUMN IF NOT EXISTS.

SET @db_name = DATABASE();

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE projects ADD COLUMN category VARCHAR(100)',
        'SELECT "projects.category already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'category'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE freelancers ADD COLUMN category VARCHAR(100)',
        'SELECT "freelancers.category already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'freelancers'
    AND COLUMN_NAME = 'category'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE freelancers ADD COLUMN location VARCHAR(100)',
        'SELECT "freelancers.location already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'freelancers'
    AND COLUMN_NAME = 'location'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE freelancers ADD COLUMN skills TEXT',
        'SELECT "freelancers.skills already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'freelancers'
    AND COLUMN_NAME = 'skills'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE freelancers ADD COLUMN availability VARCHAR(20) DEFAULT "yes"',
        'SELECT "freelancers.availability already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'freelancers'
    AND COLUMN_NAME = 'availability'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE freelancers ADD COLUMN description TEXT',
        'SELECT "freelancers.description already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'freelancers'
    AND COLUMN_NAME = 'description'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE freelancers ADD COLUMN profile_picture VARCHAR(255)',
        'SELECT "freelancers.profile_picture already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'freelancers'
    AND COLUMN_NAME = 'profile_picture'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE recruiters ADD COLUMN company_logo VARCHAR(255)',
        'SELECT "recruiters.company_logo already exists"'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'recruiters'
    AND COLUMN_NAME = 'company_logo'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE projects
SET category = 'Development'
WHERE category IS NULL
AND (
    title LIKE '%Web%'
    OR title LIKE '%App%'
    OR title LIKE '%AI%'
    OR title LIKE '%Bot%'
);

UPDATE projects
SET category = 'Design'
WHERE category IS NULL
AND (
    title LIKE '%UI%'
    OR title LIKE '%Design%'
);

UPDATE projects
SET category = 'Marketing'
WHERE category IS NULL
AND title LIKE '%Marketing%';

UPDATE projects
SET category = 'Data'
WHERE category IS NULL
AND (
    title LIKE '%Dashboard%'
    OR title LIKE '%Data%'
    OR title LIKE '%Research%'
);

UPDATE freelancers f
LEFT JOIN cities c ON f.city_id = c.city_id
SET
    f.location = COALESCE(f.location, c.city_name),
    f.description = COALESCE(f.description, f.bio),
    f.availability = COALESCE(f.availability, 'yes')
WHERE f.freelancer_id IS NOT NULL;

UPDATE freelancers
SET category = 'Development'
WHERE category IS NULL
AND (
    title LIKE '%Developer%'
    OR title LIKE '%Stack%'
    OR title LIKE '%Web%'
);

UPDATE freelancers
SET category = 'Data'
WHERE category IS NULL
AND (
    title LIKE '%Data%'
    OR title LIKE '%Machine Learning%'
    OR title LIKE '%ML%'
);

UPDATE freelancers
SET skills = 'React,Node.js,JavaScript'
WHERE skills IS NULL
AND title LIKE '%Stack%';

UPDATE freelancers
SET skills = 'Python,SQL,Machine Learning'
WHERE skills IS NULL
AND (
    title LIKE '%Data%'
    OR title LIKE '%Machine Learning%'
    OR title LIKE '%ML%'
);

CREATE TABLE IF NOT EXISTS project_logs(
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    project_title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS project_insert_trigger;

DELIMITER $$
CREATE TRIGGER project_insert_trigger
AFTER INSERT ON projects
FOR EACH ROW
BEGIN
    INSERT INTO project_logs(project_title)
    VALUES(NEW.title);
END$$
DELIMITER ;

CREATE OR REPLACE VIEW freelancer_overview AS
SELECT
    u.full_name,
    f.title,
    f.rating,
    c.city_name,
    f.category,
    f.skills
FROM freelancers f
JOIN users u ON f.user_id = u.user_id
LEFT JOIN cities c ON f.city_id = c.city_id;
