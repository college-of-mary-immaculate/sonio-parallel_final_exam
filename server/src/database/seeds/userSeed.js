// database/seeds/userSeed.js
const bcrypt = require("bcrypt");

module.exports = async (db) => {
    console.log("Seeding users...");

    const users = [
        {
            full_name: "System Administrator",
            email: "admin@gmail.com",
            password: "admin123",
            role: "admin"
        },
        {
            full_name: "Juan Dela Cruz",
            email: "voter1@gmail.com",
            password: "voter1"
        },
        {
            full_name: "Maria Santos",
            email: "voter2@gmail.com",
            password: "voter2"
        },
        {
            full_name: "Pedro Reyes",
            email: "voter3@gmail.com",
            password: "voter3"
        },
        {
            full_name: "Ana Lopez",
            email: "voter4@gmail.com",
            password: "voter4"
        },
        {
            full_name: "Mark Bautista",
            email: "voter5@gmail.com",
            password: "voter5"
        },
        {
            full_name: "Liza Ramos",
            email: "voter6@gmail.com",
            password: "voter6"
        },
        {
            full_name: "Carlo Mendoza",
            email: "voter7@gmail.com",
            password: "voter7"
        },
        {
            full_name: "Angela Torres",
            email: "voter8@gmail.com",
            password: "voter8"
        },
        {
            full_name: "Ramon Villanueva",
            email: "voter9@gmail.com",
            password: "voter9"
        },
        {
            full_name: "Sofia Garcia",
            email: "voter10@gmail.com",
            password: "voter10"
        }
    ];

    for (const user of users) {
        const hashed = await bcrypt.hash(user.password, 10);

        await db.query(
            `
            INSERT INTO users (email, full_name, password_hash, role, status)
            VALUES (?, ?, ?, ?, 'active')
            ON DUPLICATE KEY UPDATE email=email
            `,
            [
                user.email,
                user.full_name,
                hashed,
                user.role || "voter"
            ]
        );
    }

    console.log("Users seeded.");
};
