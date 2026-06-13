const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "krishna",
    database: "freelancehub",
    waitForConnections: true,
    connectionLimit: 10
});

async function getCityId(cityName) {
    const cleanCity = (cityName || "Bengaluru").trim();

    const [existing] = await db.execute(
        "SELECT city_id FROM cities WHERE city_name = ?",
        [cleanCity]
    );

    if (existing.length) {
        return existing[0].city_id;
    }

    const [created] = await db.execute(
        "INSERT INTO cities(city_name) VALUES(?)",
        [cleanCity]
    );

    return created.insertId;
}

function publicUser(user) {
    return {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
    };
}

// ================= REGISTER =================

app.post("/register", async (req, res) => {
    const {
        full_name,
        email,
        password,
        role,
        title,
        city,
        bio,
        hourly_rate,
        experience_years,
        category,
        skills,
        location,
        company_name,
        industry
    } = req.body;

    if (!full_name || !email || !password || !role) {
        return res.json({
            success: false,
            message: "Name, email, password and role are required"
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length) {
            await connection.rollback();
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        const [userResult] = await connection.execute(
            "INSERT INTO users(full_name,email,password,role) VALUES(?,?,?,?)",
            [full_name, email, password, role]
        );

        const userId = userResult.insertId;
        const cityId = await getCityId(city || location);

        if (role === "Freelancer") {
            await connection.execute(
                `INSERT INTO freelancers
                (user_id, city_id, title, bio, hourly_rate, experience_years, rating,
                 linkedin_url, category, location, skills, availability, description)
                 VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    userId,
                    cityId,
                    title || "Freelancer",
                    bio || "",
                    hourly_rate || 0,
                    experience_years || 0,
                    0,
                    "",
                    category || "",
                    location || city || "",
                    skills || "",
                    "yes",
                    bio || ""
                ]
            );
        }

        if (role === "Recruiter") {
            await connection.execute(
                `INSERT INTO recruiters
                (user_id, company_name, industry, city_id)
                VALUES(?,?,?,?)`,
                [
                    userId,
                    company_name || full_name,
                    industry || "",
                    cityId
                ]
            );
        }

        await connection.commit();

        return res.json({
            success: true,
            user: {
                user_id: userId,
                full_name,
                email,
                role
            }
        });
    }
    catch (err) {
        await connection.rollback();
        console.log(err);

        return res.json({
            success: false,
            message: err.message || "Registration failed"
        });
    }
    finally {
        connection.release();
    }
});

// ================= LOGIN =================

app.post("/login", async (req, res) => {

    const { email, password, role } = req.body;

    try {

        const [result] = await db.execute(
            `SELECT user_id, full_name, email, role
             FROM users
             WHERE email = ?
             AND password = ?
             AND role = ?`,
            [email, password, role]
        );

        if (!result.length) {
            return res.json({
                success: false,
                message: "Invalid Email, Password or Role"
            });
        }

        return res.json({
            success: true,
            user: result[0]
        });

    }
    catch (err) {

        console.log(err);

        return res.json({
            success: false,
            message: "Database error"
        });

    }

});

// ================= PROFILE =================

app.get("/profile/:userId", async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT user_id, full_name, email, role, created_at
             FROM users
             WHERE user_id = ?`,
            [req.params.userId]
        );

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];
        let profile = null;

        if (user.role === "Freelancer") {
            const [freelancers] = await db.execute(
                `SELECT f.freelancer_id, f.title, f.bio, f.hourly_rate,
                        f.experience_years, f.rating, f.linkedin_url, f.category,
                        f.location, f.skills, f.availability, f.description,
                        c.city_name
                 FROM freelancers f
                 LEFT JOIN cities c ON f.city_id = c.city_id
                 WHERE f.user_id = ?`,
                [user.user_id]
            );

            profile = freelancers[0] || null;
        }

        if (user.role === "Recruiter") {
            const [recruiters] = await db.execute(
                `SELECT r.recruiter_id, r.company_name, r.industry, c.city_name
                 FROM recruiters r
                 LEFT JOIN cities c ON r.city_id = c.city_id
                 WHERE r.user_id = ?`,
                [user.user_id]
            );

            profile = recruiters[0] || null;
        }

        return res.json({
            success: true,
            user: publicUser(user),
            profile
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Profile load failed"
        });
    }
});

app.put("/profile/:userId", async (req, res) => {
    const {
        full_name,
        email,
        password,
        city,
        title,
        bio,
        hourly_rate,
        experience_years,
        category,
        skills,
        location,
        availability,
        linkedin_url,
        company_name,
        industry
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [users] = await connection.execute(
            "SELECT user_id, role FROM users WHERE user_id = ?",
            [req.params.userId]
        );

        if (!users.length) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];
        const cityId = await getCityId(city || location);

        if (password) {
            await connection.execute(
                "UPDATE users SET full_name = ?, email = ?, password = ? WHERE user_id = ?",
                [full_name, email, password, user.user_id]
            );
        }
        else {
            await connection.execute(
                "UPDATE users SET full_name = ?, email = ? WHERE user_id = ?",
                [full_name, email, user.user_id]
            );
        }

        if (user.role === "Freelancer") {
            await connection.execute(
                `UPDATE freelancers
                 SET city_id = ?, title = ?, bio = ?, hourly_rate = ?,
                     experience_years = ?, category = ?, location = ?, skills = ?,
                     availability = ?, description = ?, linkedin_url = ?
                 WHERE user_id = ?`,
                [
                    cityId,
                    title || "",
                    bio || "",
                    hourly_rate || 0,
                    experience_years || 0,
                    category || "",
                    location || city || "",
                    skills || "",
                    availability || "yes",
                    bio || "",
                    linkedin_url || "",
                    user.user_id
                ]
            );
        }

        if (user.role === "Recruiter") {
            await connection.execute(
                `UPDATE recruiters
                 SET company_name = ?, industry = ?, city_id = ?
                 WHERE user_id = ?`,
                [
                    company_name || full_name,
                    industry || "",
                    cityId,
                    user.user_id
                ]
            );
        }

        await connection.commit();

        const [updated] = await db.execute(
            "SELECT user_id, full_name, email, role FROM users WHERE user_id = ?",
            [user.user_id]
        );

        return res.json({
            success: true,
            user: updated[0]
        });
    }
    catch (err) {
        await connection.rollback();
        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message || "Profile update failed"
        });
    }
    finally {
        connection.release();
    }
});

// ================= ADD PROJECT =================

app.post("/add-project", async (req, res) => {
    const {
        recruiter_id,
        title,
        description,
        budget,
        status,
        category
    } = req.body;

    try {
        await db.execute(
            `INSERT INTO projects
            (recruiter_id,title,description,budget,status,category)
            VALUES(?,?,?,?,?,?)`,
            [
                recruiter_id,
                title,
                description,
                budget,
                status || "Open",
                category || ""
            ]
        );

        return res.json({ success: true });
    }
    catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: err.message
        });
    }
});

// ================= GET PROJECTS =================

app.get("/projects", async (req, res) => {
    try {
        const [projects] = await db.execute(
            `SELECT project_id, title, description, budget, status, category
             FROM projects
             ORDER BY project_id DESC`
        );

        return res.json(projects);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});

// ================= GET FREELANCERS =================

app.get("/freelancers", async (req, res) => {
    try {
        const [freelancers] = await db.execute(
            `SELECT
                f.freelancer_id,
                u.full_name,
                f.title,
                f.category,
                COALESCE(f.location, c.city_name) AS location,
                f.skills,
                f.hourly_rate,
                f.rating,
                f.availability,
                f.description
             FROM freelancers f
             JOIN users u ON f.user_id = u.user_id
             LEFT JOIN cities c ON f.city_id = c.city_id
             ORDER BY f.rating DESC`
        );

        return res.json(freelancers);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false
        });
    }
});

async function startServer() {
    try {
        const connection = await db.getConnection();
        await connection.ping();
        connection.release();

        console.log("MySQL Connected");

        app.listen(PORT, () => {
            console.log(`Server Running on Port ${PORT}`);
        });
    }
    catch (err) {
        console.error("MySQL connection failed");
        console.error(err.message);
        process.exit(1);
    }
}

startServer();
