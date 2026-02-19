// database/seeds/positionSeed.js
module.exports = async (db) => {
    console.log("Seeding positions...");

    const positions = [
        { name: "Governor", description: "Chief executive of the province." },
        { name: "Vice Governor", description: "Deputy executive assisting the governor." },
        { name: "Provincial Board", description: "Legislative body of the province." }
    ];

    for (const pos of positions) {
        await db.query(
            `
            INSERT INTO positions (name, description)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                description = VALUES(description)
            `,
            [pos.name, pos.description]
        );
    }

    console.log("Positions seeded.");
};
