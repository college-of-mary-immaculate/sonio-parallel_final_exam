
// ===== File: candidateModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS candidates (
            candidate_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(150) NOT NULL,
            description TEXT,
            background TEXT,
            education TEXT,
            years_experience INT,
            primary_advocacy TEXT,
            secondary_advocacy TEXT
        )
    `);
};


// ===== File: ..\electionCandidateModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS election_candidates (
            election_candidate_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            candidate_id BIGINT NOT NULL,
            position_id BIGINT NOT NULL,
            UNIQUE(election_id, candidate_id, position_id),
            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
            FOREIGN KEY (position_id) REFERENCES positions(position_id)
        )
    `);
};


// ===== File: ..\electionModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS elections (
            election_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            status ENUM('draft','active','ended') DEFAULT 'draft',
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            created_by BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by)
                REFERENCES users(user_id)
        )
    `);
};


// ===== File: ..\electionPositionModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS election_positions (
            election_position_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            position_id BIGINT NOT NULL,
            candidate_count INT NOT NULL,
            winners_count INT NOT NULL,
            votes_per_voter INT NOT NULL,
            UNIQUE(election_id, position_id),
            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (position_id) REFERENCES positions(position_id)
        )
    `);
};


// ===== File: ..\electionResultModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS election_results (
            result_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            position_id BIGINT NOT NULL,
            candidate_id BIGINT NOT NULL,
            total_votes INT NOT NULL,
            \`rank\` INT NOT NULL,
            is_winner BOOLEAN DEFAULT FALSE,

            UNIQUE(election_id, position_id, candidate_id),

            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (position_id) REFERENCES positions(position_id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
        )
    `);
};


// ===== File: ..\modelIndex.js =====
const userModel = require("./userModel");
const otpModel = require("./otpModel");
const electionModel = require("./electionModel");
const positionModel = require("./positionModel");
const candidateModel = require("./candidateModel");
const electionPositionModel = require("./electionPositionModel");
const electionCandidateModel = require("./electionCandidateModel");
const voteModel = require("./voteModel");
const voterSubmissionModel = require("./voterSubmissionModel");
const electionResultModel = require("./electionResultModel");

module.exports = async (db) => {
    await userModel(db);
    await otpModel(db);
    await electionModel(db);
    await positionModel(db);
    await candidateModel(db);
    await electionPositionModel(db);
    await electionCandidateModel(db);
    await voteModel(db);
    await voterSubmissionModel(db);
    await electionResultModel(db);
};


// ===== File: ..\otpModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS otp_verifications (
            otp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) NOT NULL,
            otp_code VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            is_used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};


// ===== File: ..\positionModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS positions (
            position_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT
        )
    `);
};


// ===== File: ..\userModel.js =====
// database/models/userModel.js
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) UNIQUE NOT NULL,
            full_name VARCHAR(150) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('voter','admin') DEFAULT 'voter',
            status ENUM('active','blocked') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};


// ===== File: ..\voteModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS votes (
            vote_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            position_id BIGINT NOT NULL,
            candidate_id BIGINT NOT NULL,
            voter_id BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_vote_lookup (election_id, position_id),
            INDEX idx_voter_lookup (voter_id),

            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (position_id) REFERENCES positions(position_id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
            FOREIGN KEY (voter_id) REFERENCES users(user_id)
        )
    `);
};


// ===== File: ..\voterSubmissionModel.js =====
module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS voter_submissions (
            submission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            voter_id BIGINT NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(election_id, voter_id),
            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (voter_id) REFERENCES users(user_id)
        )
    `);
};


// ===== File: ..\..\seeds\candidateSeed.js =====
// database/seeds/candidateSeed.js
module.exports = async (db) => {
    console.log("Seeding candidates...");

    const candidates = [
        {
            full_name: "Michael Fernandez",
            background: "Former Mayor",
            education: "MBA – Public Administration",
            years_experience: 12,
            primary_advocacy: "Infrastructure Development",
            secondary_advocacy: "Transparency"
        },
        {
            full_name: "Roberto Lim",
            background: "Business Entrepreneur",
            education: "BS Business Management",
            years_experience: 15,
            primary_advocacy: "Economic Growth",
            secondary_advocacy: "Job Creation"
        },
        {
            full_name: "Antonio Cruz",
            background: "Community Organizer",
            education: "BA Political Science",
            years_experience: 10,
            primary_advocacy: "Healthcare Reform",
            secondary_advocacy: "Education Access"
        },
        {
            full_name: "Daniel Navarro",
            background: "NGO Director",
            education: "MA Social Work",
            years_experience: 8,
            primary_advocacy: "Youth Empowerment",
            secondary_advocacy: "Anti-Drug Campaign"
        },
        {
            full_name: "Carlos Mendoza",
            background: "Provincial Board Member",
            education: "LLB Law",
            years_experience: 14,
            primary_advocacy: "Law & Order",
            secondary_advocacy: "Public Safety"
        },
        {
            full_name: "Victor Ramos",
            background: "CPA Consultant",
            education: "BS Accountancy",
            years_experience: 11,
            primary_advocacy: "Budget Transparency",
            secondary_advocacy: "Tax Reform"
        },
        {
            full_name: "Francisco Torres",
            background: "Educator",
            education: "MA Education",
            years_experience: 9,
            primary_advocacy: "Education Modernization",
            secondary_advocacy: "Scholarship Programs"
        },
        {
            full_name: "Adrian Velasco",
            background: "Former Councilor",
            education: "BA Public Administration",
            years_experience: 7,
            primary_advocacy: "Digital Governance",
            secondary_advocacy: "Youth Representation"
        },
        {
            full_name: "Leo Bautista",
            background: "Agricultural Leader",
            education: "BS Agriculture",
            years_experience: 6,
            primary_advocacy: "Farming Support",
            secondary_advocacy: "Rural Development"
        },
        {
            full_name: "Martin Reyes",
            background: "Environmental Advocate",
            education: "BS Environmental Science",
            years_experience: 5,
            primary_advocacy: "Environmental Protection",
            secondary_advocacy: "Clean Energy"
        },
        {
            full_name: "Jerome Castillo",
            background: "Transport Consultant",
            education: "BS Civil Engineering",
            years_experience: 8,
            primary_advocacy: "Public Transport Reform",
            secondary_advocacy: "Road Safety"
        },
        {
            full_name: "Paolo Santos",
            background: "Small Business Owner",
            education: "BS Entrepreneurship",
            years_experience: 4,
            primary_advocacy: "SME Development",
            secondary_advocacy: "Local Investment"
        },
        {
            full_name: "Kenneth Garcia",
            background: "Public Health Officer",
            education: "Doctor of Medicine",
            years_experience: 7,
            primary_advocacy: "Healthcare Access",
            secondary_advocacy: "Disease Prevention"
        },
        {
            full_name: "Ryan Dizon",
            background: "Infrastructure Engineer",
            education: "BS Civil Engineering",
            years_experience: 9,
            primary_advocacy: "Road & Bridge Projects",
            secondary_advocacy: "Urban Planning"
        },
        {
            full_name: "Alvin Flores",
            background: "Anti-Corruption Advocate",
            education: "BA Criminology",
            years_experience: 10,
            primary_advocacy: "Government Transparency",
            secondary_advocacy: "Public Accountability"
        },
        {
            full_name: "Noel Martinez",
            background: "Disaster Risk Officer",
            education: "BS Disaster Management",
            years_experience: 6,
            primary_advocacy: "Disaster Preparedness",
            secondary_advocacy: "Emergency Response"
        },
        {
            full_name: "Patrick Villanueva",
            background: "Tourism Consultant",
            education: "BS Tourism Management",
            years_experience: 5,
            primary_advocacy: "Tourism Development",
            secondary_advocacy: "Cultural Preservation"
        },
        {
            full_name: "Henry Ramos",
            background: "Water Systems Engineer",
            education: "BS Environmental Engineering",
            years_experience: 8,
            primary_advocacy: "Water Infrastructure",
            secondary_advocacy: "Sanitation Programs"
        },
        {
            full_name: "Christian Navarro",
            background: "Workforce Development Officer",
            education: "BS Human Resource Management",
            years_experience: 6,
            primary_advocacy: "Job Creation",
            secondary_advocacy: "Skills Training"
        },
        {
            full_name: "Dominic Cruz",
            background: "Community Development Officer",
            education: "BA Sociology",
            years_experience: 7,
            primary_advocacy: "Community Programs",
            secondary_advocacy: "Social Welfare"
        }
    ];

    for (const c of candidates) {
        await db.query(
            `
            INSERT INTO candidates 
            (full_name, background, education, years_experience, primary_advocacy, secondary_advocacy)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE full_name=full_name
            `,
            [
                c.full_name,
                c.background,
                c.education,
                c.years_experience,
                c.primary_advocacy,
                c.secondary_advocacy
            ]
        );
    }

    console.log("Candidates seeded.");
};


// ===== File: ..\..\seeds\positionSeed.js =====
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


// ===== File: ..\..\seeds\seedIndex.js =====
// database/seeds/seedIndex.js

const userSeed = require("./userSeed");
const positionSeed = require("./positionSeed");
const candidateSeed = require("./candidateSeed");

module.exports = async (db) => {
    await userSeed(db);
    await positionSeed(db);
    await candidateSeed(db);
};


// ===== File: ..\..\seeds\userSeed.js =====
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
            password: "VoteJuan01"
        },
        {
            full_name: "Maria Santos",
            email: "voter2@gmail.com",
            password: "Maria2024!"
        },
        {
            full_name: "Pedro Reyes",
            email: "voter3@gmail.com",
            password: "Pedro#789"
        },
        {
            full_name: "Ana Lopez",
            email: "voter4@gmail.com",
            password: "AnaSecure88"
        },
        {
            full_name: "Mark Bautista",
            email: "voter5@gmail.com",
            password: "MarkVote55"
        },
        {
            full_name: "Liza Ramos",
            email: "voter6@gmail.com",
            password: "Liza@1234"
        },
        {
            full_name: "Carlo Mendoza",
            email: "voter7@gmail.com",
            password: "CarloSafe77"
        },
        {
            full_name: "Angela Torres",
            email: "voter8@gmail.com",
            password: "AngieVote22"
        },
        {
            full_name: "Ramon Villanueva",
            email: "voter9@gmail.com",
            password: "RamonPass99"
        },
        {
            full_name: "Sofia Garcia",
            email: "voter10@gmail.com",
            password: "Sofia!Vote"
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

