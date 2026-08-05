Please perform two tasks based on the provided inputs: (1) Update my README.md file using a new template, and (2) Extract the project's technology stack into a specific JSON format based on a hardcoded dictionary.

Task 1: Update the README.md
Please update the existing README.md file by integrating its content into the structure of the provided README Template.

You must preserve all existing project specifics, features, and management details from the current README.

You may reorganize and polish the content to fit the new structure neatly, but do not delete any essential information.

CRITICAL RULE FOR KEY FEATURES: When generating the ## Key features section, DO NOT use emojis, bold text, or categorical titles (e.g., avoid - 🔐 **Authentication**:). You must format them as plain, technical, and descriptive bullet points exactly following this structure:

Responsive car search and listing with detailed car pages and images.

Email/password and social (Google) authentication powered by better-auth.

Add, edit and manage car listings from the user dashboard.

Task 2: Extract the Technology Stack
My portfolio application uses the provided TECH_DICTIONARY to display the tech stack, so the extracted names must match the dictionary strings exactly.
Your task is to extract the technologies used in this project based STRICTLY on what is written in the updated README file.

Rules for extraction:

Scan the updated README to identify the technologies used in the project.

Cross-reference the identified technologies with the provided TECH_DICTIONARY.

Output a categorized list (frontend, backend, database, devTools) in JSON format.

ONLY include technologies that are explicitly mentioned in the README.

You MUST output the exact matching string found in the TECH_DICTIONARY. (For example, if the README says "MongoDB via Better Auth", you must output exactly "MongoDB" as it appears in the dictionary).

Do not include any technology from the dictionary if it is not present in the README.

Inputs:

1. README Template:

🚀 Project Name
Brief 1-2 sentence description of what the project does and the main problem it solves.

🔗 Live Demo & Links
🌐 Live Website: https://your-live-demo-link.com

📹 Video Demo: https://youtube.com/...

📁 Repository: https://github.com/riadswebdev/project-name

🛠️ Tech Stack & Technologies
Frontend
Framework: React.js / Next.js

Language: TypeScript

Styling: Tailwind CSS, HeroUI

State Management: Zustand / Redux

Backend
Server Environment: Node.js, Express.js

Authentication: Better Auth / JWT / Google OAuth

API: REST API

Database & Storage
Database: MongoDB, Mongoose

Caching / ORM: Prisma / Redis

Key features
First plain descriptive feature here.

Second plain descriptive feature here.

Third plain descriptive feature here.

📸 Screenshots & Preview 2. TECH_DICTIONARY:
const TECH_DICTIONARY = {
frontend: [
"Next.js 16", "Next.js", "React 19", "React.js", "React", "Vue.js", "Vue", "Angular", "Svelte",
"TypeScript", "JavaScript", "HTML5", "HTML", "CSS3", "CSS", "Tailwind CSS 4", "Tailwind CSS", "TailwindCSS", "Tailwind",
"HeroUI", "DaisyUI", "Framer Motion", "Lucide React", "React Icons", "next-themes", "Redux", "Zustand", "Bootstrap"
],
backend: [
"Better Auth", "Google OAuth", "Stripe API", "Stripe", "Node.js", "Node", "Express.js", "Express", "NestJS",
"Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "Go", "Golang", "PHP", "Laravel",
"REST API", "GraphQL", "JWT", "OAuth"
],
database: [
"MongoDB", "Mongoose", "PostgreSQL", "Postgres", "MySQL", "SQLite",
"Redis", "Prisma", "Supabase", "Firebase", "Firestore", "DynamoDB", "CockroachDB"
],
devTools: [
"ESLint", "React Compiler", "Vercel", "Docker", "Git", "GitHub", "Postman", "Render", "Webpack", "Vite", "Turbopack"
]
};

3. Current README.md Content:
   [Insert your current README.md file content here]

Expected Output:
Please provide:

The complete, updated Markdown content for the new README.md.

A clean JSON object containing the extracted technology stack according to the dictionary.
