/**
 * Seeds realistic development data. Replaces all content tables (users are kept).
 *
 *   npm run db:seed
 *
 * Creates/updates a Super Admin from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 * Refuses to run when NODE_ENV=production unless --allow-production is passed.
 * All people below are fictional sample data — replace them through the admin dashboard.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";
import { DEFAULT_SETTINGS } from "../lib/settings";

const U = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

function isoDate(offsetDays: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

type Pos = (typeof schema.teamPosition.enumValues)[number];

async function main() {
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--allow-production")) {
    console.error("Refusing to seed in production. Pass --allow-production if you really mean it.");
    process.exit(1);
  }
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        truncate table project_members, project_technologies, project_images, project_submissions,
          projects, event_images, events, team_members, team_terms, join_applications, site_settings,
          rate_limit_hits restart identity cascade`);

      /* -------------------------------------------------------- admin user */
      const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@arict.lk").toLowerCase();
      const password = process.env.SEED_ADMIN_PASSWORD;
      if (password) {
        const passwordHash = await bcrypt.hash(password, 12);
        const updated = await tx
          .update(schema.users)
          .set({ passwordHash, role: "super_admin", active: true })
          .where(sql`lower(${schema.users.email}) = ${email}`)
          .returning({ id: schema.users.id });
        if (updated.length === 0) {
          await tx.insert(schema.users).values({ name: "ARICT Admin", email, role: "super_admin", passwordHash });
        }
        console.log(`✓ Super Admin: ${email}`);
      } else {
        console.warn("! SEED_ADMIN_PASSWORD not set — skipping admin user.");
      }

      /* ---------------------------------------------------------- settings */
      await tx.insert(schema.siteSettings).values(
        Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value })),
      );

      /* ------------------------------------------------------------ events */
      const eventRows: (typeof schema.events.$inferInsert)[] = [
        {
          title: "Full-Stack Web Development Bootcamp",
          slug: "full-stack-web-development-bootcamp",
          excerpt: "A two-day hands-on bootcamp covering modern frontend, APIs and deployment with Next.js and PostgreSQL.",
          content:
            "Spend two days building and shipping a complete web application with mentors from industry.\n\n## What you'll learn\n- Building interfaces with React and Next.js\n- Designing REST APIs and working with PostgreSQL\n- Authentication basics\n- Deploying to the cloud\n\n## Who should attend\nStudents from any year with basic programming knowledge. Bring a laptop with Node.js installed.",
          coverImage: U("1517694712202-14dd9538aa97"),
          startDate: isoDate(12),
          endDate: isoDate(13),
          startTime: "09:00:00",
          endTime: "16:00:00",
          location: "Computer Laboratory 01, Faculty of Applied Sciences",
          organizer: "ARICT",
          registrationUrl: "https://forms.gle/example-bootcamp",
          category: "Bootcamp",
          status: "scheduled",
          featured: true,
          published: true,
        },
        {
          title: "AI for Everyone: Intro to Machine Learning",
          slug: "ai-for-everyone-intro-to-machine-learning",
          excerpt: "An approachable seminar on machine learning fundamentals, real-world use cases and how to start learning.",
          content:
            "Machine learning is everywhere, from recommendations to medical imaging. This seminar explains the core ideas without heavy maths and shows how students can start building ML projects.\n\n## Agenda\n- What machine learning is (and isn't)\n- Supervised vs unsupervised learning\n- A live demo with Python and scikit-learn\n- Q&A and learning resources",
          coverImage: U("1555066931-4365d14bab8c"),
          startDate: isoDate(26),
          startTime: "14:00:00",
          endTime: "16:30:00",
          location: "Main Auditorium, Rajarata University",
          organizer: "ARICT",
          category: "Seminar",
          status: "scheduled",
          published: true,
        },
        {
          title: "RajaHack 2026",
          slug: "rajahack-2026",
          excerpt: "ARICT's annual 24-hour hackathon. Form a team, pick a challenge and build something that matters.",
          content:
            "RajaHack brings together student teams to build working prototypes in 24 hours.\n\n## Format\n- Teams of 3–5 students\n- Challenges announced at the opening ceremony\n- Mentors available throughout the night\n- Final pitches to a panel of judges\n\n## Prizes\nCash prizes and internship interview opportunities for the top three teams.",
          coverImage: U("1504384308090-c894fdcc538d"),
          startDate: isoDate(45),
          endDate: isoDate(46),
          startTime: "08:30:00",
          endTime: "10:00:00",
          location: "Faculty of Applied Sciences Premises",
          organizer: "ARICT",
          registrationUrl: "https://forms.gle/example-rajahack",
          category: "Hackathon",
          status: "scheduled",
          featured: true,
          published: true,
        },
        {
          title: "Git & GitHub Workshop",
          slug: "git-and-github-workshop",
          excerpt: "Learn version control the practical way: branching, pull requests and collaborating on real repositories.",
          content: "A practical, beginner-friendly workshop on Git and GitHub. By the end you'll have opened your first pull request.",
          coverImage: U("1461749280684-dccba630e2f6"),
          startDate: isoDate(60),
          startTime: "13:30:00",
          endTime: "16:00:00",
          location: "Online (Zoom)",
          organizer: "ARICT",
          category: "Workshop",
          status: "scheduled",
          published: true,
        },
        {
          title: "Cybersecurity Awareness Session",
          slug: "cybersecurity-awareness-session",
          excerpt: "Practical tips to protect your accounts and devices, plus an introduction to careers in security.",
          content: "An interactive session on passwords, phishing, safe browsing and an introduction to ethical hacking as a career path.",
          coverImage: U("1550751827-4bd374c3f58b"),
          startDate: isoDate(-35),
          startTime: "10:00:00",
          endTime: "12:00:00",
          location: "Lecture Hall 03",
          organizer: "ARICT",
          category: "Talk",
          status: "completed",
          published: true,
        },
        {
          title: "UI/UX Design Sprint",
          slug: "ui-ux-design-sprint",
          excerpt: "A one-day design sprint where teams researched, sketched and prototyped a campus app in Figma.",
          content: "Teams worked through the full design sprint process — understand, sketch, decide, prototype and test — to design a campus services app.",
          coverImage: U("1531482615713-2afd69097998"),
          startDate: isoDate(-90),
          startTime: "09:00:00",
          endTime: "17:00:00",
          location: "Innovation Hub",
          organizer: "ARICT",
          category: "Workshop",
          status: "completed",
          published: true,
        },
        {
          title: "Industry Day: Careers in Tech",
          slug: "industry-day-careers-in-tech",
          excerpt: "Professionals from Sri Lankan tech companies shared career advice, CV tips and what they look for in graduates.",
          content: "Speakers from software, data and networking companies discussed career paths, interview preparation and building a portfolio while at university.",
          coverImage: U("1540575467063-178a50c2df87"),
          startDate: isoDate(-150),
          startTime: "09:30:00",
          endTime: "15:00:00",
          location: "Main Auditorium, Rajarata University",
          organizer: "ARICT in collaboration with the Career Guidance Unit",
          category: "Seminar",
          status: "completed",
          featured: false,
          published: true,
        },
        {
          title: "RajaHack 2025",
          slug: "rajahack-2025",
          excerpt: "Last year's hackathon: 18 teams, 24 hours and a winning project that tracked bus arrivals in real time.",
          content: "RajaHack 2025 brought together 18 student teams. The winning team built a real-time bus arrival tracker for the Anuradhapura area.",
          coverImage: U("1519389950473-47ba0277781c"),
          startDate: isoDate(-320),
          endDate: isoDate(-319),
          startTime: "08:30:00",
          location: "Faculty of Applied Sciences Premises",
          organizer: "ARICT",
          category: "Hackathon",
          status: "completed",
          published: true,
        },
        {
          title: "Cloud Computing Study Circle",
          slug: "cloud-computing-study-circle",
          excerpt: "A draft event still being planned — not visible on the public site.",
          content: "",
          startDate: isoDate(80),
          category: "Workshop",
          status: "scheduled",
          published: false,
        },
      ];
      const insertedEvents = await tx.insert(schema.events).values(eventRows).returning();
      const hack25 = insertedEvents.find((e) => e.slug === "rajahack-2025")!;
      await tx.insert(schema.eventImages).values([
        { eventId: hack25.id, imageUrl: U("1522071820081-009f0129c71c", 1200), altText: "Students collaborating at laptops during RajaHack 2025", displayOrder: 0 },
        { eventId: hack25.id, imageUrl: U("1556761175-b413da4baf72", 1200), altText: "A team presenting their hackathon project", displayOrder: 1 },
        { eventId: hack25.id, imageUrl: U("1531297484001-80022131f5a1", 1200), altText: "Laptops and notes on a hackathon table", displayOrder: 2 },
      ]);

      /* ---------------------------------------------------------- projects */
      const projectRows: (typeof schema.projects.$inferInsert & { tech: string[]; members: [string, string][]; shots?: string[] })[] = [
        {
          title: "CampusConnect",
          slug: "campusconnect",
          excerpt: "A mobile app that brings timetables, notices and society events for Rajarata students into one place.",
          content:
            "CampusConnect started as a hackathon idea: students were missing announcements spread across many groups.\n\n## Features\n- Personal lecture timetable\n- Faculty and society notices\n- Event reminders\n- Offline support\n\n## Outcome\nPiloted with 300 students during the 2025 academic year.",
          coverImage: U("1551288049-bebda4e38f71"),
          githubUrl: "https://github.com/example/campusconnect",
          liveUrl: "https://campusconnect.example.com",
          year: 2025,
          category: "Mobile Application",
          status: "completed",
          featured: true,
          published: true,
          tech: ["Flutter", "Firebase", "Node.js"],
          members: [["Nimesha Perera", "Mobile Developer"], ["Kavindu Jayasinghe", "Backend Developer"], ["Tharushi Fernando", "UI Designer"]],
          shots: [U("1573164713988-8665fc963095", 1200)],
        },
        {
          title: "AgriSense",
          slug: "agrisense",
          excerpt: "Low-cost IoT soil sensors that help paddy farmers in the North Central Province decide when to irrigate.",
          content: "AgriSense uses ESP32 boards with soil moisture and temperature sensors, sending readings over LoRa to a dashboard farmers can check on their phones.",
          coverImage: U("1605379399642-870262d3d051"),
          githubUrl: "https://github.com/example/agrisense",
          year: 2025,
          category: "IoT / Embedded",
          status: "in_progress",
          featured: true,
          published: true,
          tech: ["ESP32", "LoRa", "Python", "Grafana"],
          members: [["Dilshan Rathnayake", "Hardware Lead"], ["Sachini Wickramasinghe", "Data Engineer"]],
        },
        {
          title: "Sinhala Sentiment Analyzer",
          slug: "sinhala-sentiment-analyzer",
          excerpt: "A machine learning model and web demo that classifies sentiment in Sinhala social media posts.",
          content: "The team built a labelled dataset of Sinhala comments and fine-tuned a transformer model, reaching 84% accuracy on the held-out test set.",
          coverImage: U("1488590528505-98d2b5aba04b"),
          githubUrl: "https://github.com/example/sinhala-sentiment",
          liveUrl: "https://sentiment.example.com",
          year: 2026,
          category: "AI / Machine Learning",
          status: "completed",
          featured: true,
          published: true,
          tech: ["Python", "PyTorch", "Hugging Face", "FastAPI"],
          members: [["Ishara Senanayake", "ML Engineer"], ["Pasindu Gunawardena", "Full-stack Developer"]],
        },
        {
          title: "LabBook",
          slug: "labbook",
          excerpt: "A booking system for computer labs that shows availability in real time and prevents double bookings.",
          content: "LabBook replaced a paper sign-up sheet. Lecturers and students can see free slots and book a lab in seconds.",
          coverImage: U("1498050108023-c5249f4df085"),
          githubUrl: "https://github.com/example/labbook",
          year: 2024,
          category: "Web Application",
          status: "completed",
          published: true,
          tech: ["Next.js", "PostgreSQL", "Tailwind CSS"],
          members: [["Hasini Abeysekara", "Developer"], ["Ravindu Silva", "Developer"]],
        },
        {
          title: "SafeNet Phishing Trainer",
          slug: "safenet-phishing-trainer",
          excerpt: "A browser game that teaches students to spot phishing emails through short, realistic scenarios.",
          content: "SafeNet presents a series of emails and asks players to decide which are safe, explaining the warning signs after each choice.",
          coverImage: U("1563986768609-322da13575f3"),
          year: 2024,
          category: "Cybersecurity",
          status: "completed",
          published: true,
          tech: ["TypeScript", "React", "Vite"],
          members: [["Chamodi Herath", "Developer"]],
        },
        {
          title: "Library Seat Finder (Draft)",
          slug: "library-seat-finder",
          excerpt: "Unpublished draft project used to test the publishing workflow.",
          content: "",
          year: 2026,
          category: "Web Application",
          status: "in_progress",
          published: false,
          tech: ["Vue"],
          members: [],
        },
      ];
      for (const { tech, members, shots, ...p } of projectRows) {
        const [row] = await tx.insert(schema.projects).values(p).returning({ id: schema.projects.id });
        if (tech.length) await tx.insert(schema.projectTechnologies).values(tech.map((name) => ({ projectId: row.id, name })));
        if (members.length)
          await tx.insert(schema.projectMembers).values(members.map(([memberName, role]) => ({ projectId: row.id, memberName, role })));
        if (shots?.length)
          await tx.insert(schema.projectImages).values(
            shots.map((imageUrl, i) => ({ projectId: row.id, imageUrl, altText: `${p.title} screenshot ${i + 1}`, displayOrder: i })),
          );
      }

      /* ------------------------------------------------------- submissions */
      await tx.insert(schema.projectSubmissions).values([
        {
          title: "Rajarata Bus Tracker",
          slugCandidate: "rajarata-bus-tracker",
          shortDescription: "Real-time arrival estimates for buses between Mihintale and Anuradhapura using crowd-sourced GPS.",
          fullDescription:
            "Students often wait a long time for buses. The app lets passengers share their location while on a bus, and estimates arrival times for everyone waiting at stops along the route.",
          category: "Mobile Application",
          technologies: ["React Native", "Supabase", "Mapbox"],
          projectYear: 2026,
          githubUrl: "https://github.com/example/bus-tracker",
          teamMembers: ["Yasiru Madushanka", "Oshadi Ranasinghe"],
          submitterName: "Yasiru Madushanka",
          submitterEmail: "yasiru.sample@example.com",
          status: "pending",
        },
        {
          title: "Exam Timetable Generator",
          slugCandidate: "exam-timetable-generator",
          shortDescription: "A constraint solver that produces clash-free exam timetables for faculties in minutes.",
          fullDescription:
            "Uses Google OR-Tools to schedule exams across halls and days while respecting student clashes, invigilator availability and hall capacity.",
          category: "Web Application",
          technologies: ["Python", "OR-Tools", "Django"],
          projectYear: 2025,
          liveUrl: "https://timetable.example.com",
          teamMembers: ["Malith Dissanayake"],
          submitterName: "Malith Dissanayake",
          submitterEmail: "malith.sample@example.com",
          status: "under_review",
        },
        {
          title: "Plant Disease Detector",
          slugCandidate: "plant-disease-detector",
          shortDescription: "Detects common paddy leaf diseases from phone photos.",
          fullDescription: "A CNN trained on a public paddy disease dataset, wrapped in a simple Android app. Needs a clearer write-up of the dataset and evaluation.",
          category: "AI / Machine Learning",
          technologies: ["TensorFlow Lite", "Kotlin"],
          projectYear: 2025,
          teamMembers: [],
          submitterName: "Sanduni Karunaratne",
          submitterEmail: "sanduni.sample@example.com",
          status: "needs_changes",
          adminNotes: "Please add evaluation results and a screenshot of the app.",
        },
      ]);

      /* -------------------------------------------------------------- team */
      const exec: Pos[] = ["president", "vice_president", "secretary", "vice_secretary", "senior_treasurer", "junior_treasurer", "editor", "junior_editor"];
      const execYear: Record<string, number> = {
        president: 4, vice_president: 4, secretary: 3, vice_secretary: 2,
        senior_treasurer: 3, junior_treasurer: 2, editor: 3, junior_editor: 2,
      };
      const terms = [
        {
          title: "2026/27 Committee", year: 2026, startDate: "2026-07-01", endDate: "2027-06-30", isCurrent: true,
          description: "The current ARICT committee, elected at the 2026 Annual General Meeting.",
          names: [
            "Sahan Wijeratne", "Nethmi Jayawardena", "Ravindu Bandara", "Dulani Samarasinghe", "Kasun Rajapaksha", "Hiruni Gamage", "Thisara Weerasinghe", "Amaya Liyanage",
            "Senuri Dias", "Lahiru Kumara", "Piumi Ekanayake", "Janith Mendis",
            "Ovini Hettiarachchi", "Chathura Pathirana", "Imesha Rodrigo", "Ashen Wijesinghe",
            "Kaveesha Munasinghe", "Dineth Abeywickrama", "Rashmi Kulathunga", "Tharindu Peiris",
          ],
        },
        {
          title: "2025/26 Committee", year: 2025, startDate: "2025-07-01", endDate: "2026-06-30", isCurrent: false,
          description: "The committee that launched the project showcase and RajaHack 2025.",
          names: [
            "Nuwan Senarath", "Sachini Wickramasinghe", "Dilshan Rathnayake", "Hasini Abeysekara", "Pasindu Gunawardena", "Ishara Senanayake", "Kavindu Jayasinghe", "Tharushi Fernando",
            "Shehan Karunathilaka", "Madhavi Perera", "Avishka Ranaweera", "Gayani Silva",
            "Sahan Wijeratne", "Nethmi Jayawardena", "Kasun Rajapaksha", "Hiruni Gamage",
            "Ravindu Bandara", "Dulani Samarasinghe", "Thisara Weerasinghe", "Amaya Liyanage",
          ],
        },
        {
          title: "2024/25 Committee", year: 2024, startDate: "2024-07-01", endDate: "2025-06-30", isCurrent: false,
          description: "Introduced the Industry Day and the first workshop series.",
          names: [
            "Chamara Jayalath", "Nimesha Perera", "Ruwan Wickramaratne", "Chamodi Herath", "Ravindu Silva", "Anjali Kodikara", "Supun Gunasekara", "Kalpani Ratnayake",
            "Dinuka Alwis", "Sewwandi Fonseka", "Isuru Wanniarachchi", "Nadeesha Kumari",
            "Nuwan Senarath", "Sachini Wickramasinghe", "Dilshan Rathnayake", "Hasini Abeysekara",
            "Pasindu Gunawardena", "Ishara Senanayake", "Kavindu Jayasinghe", "Tharushi Fernando",
          ],
        },
      ];
      const slugName = (n: string) => n.toLowerCase().replace(/[^a-z]+/g, "");
      for (const { names, ...term } of terms) {
        const [t] = await tx.insert(schema.teamTerms).values(term).returning({ id: schema.teamTerms.id });
        const members: (typeof schema.teamMembers.$inferInsert)[] = names.map((fullName, i) => {
          const isExec = i < 8;
          const position: Pos = isExec ? exec[i]! : "committee_member";
          const academicYear = isExec ? execYear[position]! : Math.floor((i - 8) / 4) + 1;
          const handle = slugName(fullName);
          return {
            teamTermId: t.id,
            fullName,
            position,
            academicYear,
            linkedinUrl: `https://www.linkedin.com/in/${handle}-sample`,
            githubUrl: i % 3 === 0 ? `https://github.com/${handle}-sample` : null,
            portfolioUrl: i % 4 === 0 ? `https://${handle}.example.com` : null,
            email: position === "president" || position === "secretary" ? `${handle}.sample@example.com` : null,
            bio: isExec ? "Sample profile — replace with the member's own short bio from the admin dashboard." : null,
            displayOrder: i,
            featuredOnHome: term.isCurrent && ["president", "vice_president", "secretary", "senior_treasurer"].includes(position),
          };
        });
        await tx.insert(schema.teamMembers).values(members);
      }

      /* -------------------------------------------------- join applications */
      await tx.insert(schema.joinApplications).values([
        {
          fullName: "Kaveen Liyanapathirana",
          email: "kaveen.sample@example.com",
          phone: "+94 71 000 0001",
          registrationNumber: "ICT/2025/101",
          academicYear: 1,
          degree: "BSc in Information and Communication Technology",
          interests: ["Web Development", "UI / UX Design"],
          skills: "HTML, CSS, a little JavaScript",
          reason: "I want to learn by building real projects with seniors and help organise events.",
          status: "pending",
        },
        {
          fullName: "Minoli Atapattu",
          email: "minoli.sample@example.com",
          phone: "+94 77 000 0002",
          registrationNumber: "CS/2024/045",
          academicYear: 2,
          degree: "BSc in Computer Science",
          interests: ["AI / Machine Learning", "Data Science"],
          skills: "Python, pandas, basic machine learning",
          reason: "I'd like to join the AI study group and contribute to ARICT's machine learning workshops.",
          githubUrl: "https://github.com/minoli-sample",
          status: "reviewing",
        },
      ]);
    });
    console.log("✓ Seed data inserted");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
