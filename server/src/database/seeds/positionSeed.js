// database/seeds/positionSeed.js
module.exports = async (db) => {
    console.log("Seeding positions...");

    const positions = [
        "Governor",
        "Vice Governor",
        "Provincial Board"
    ];

    for (const name of positions) {
        await db.query(
            `
            INSERT INTO positions (name)
            VALUES (?)
            ON DUPLICATE KEY UPDATE name=name
            `,
            [name]
        );
    }

    console.log("Positions seeded.");
};
