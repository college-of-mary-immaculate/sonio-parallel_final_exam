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
