import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@jobpilot.ai" },
    update: {},
    create: {
      email: "admin@jobpilot.ai",
      name: "Sakir Hassain (Admin)",
      role: "ADMIN",
    },
  });

  // 2. Create Candidate Profile
  const candidate = await prisma.candidateProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      fullName: "Sakir Hassain",
      email: "sakir.jobpilot@gmail.com",
      phone: "+91 98765 43210",
      currentCity: "Kolkata",
      preferredLocations: JSON.stringify([
        "Kolkata",
        "Remote",
        "Bengaluru",
        "Hyderabad",
        "Pune",
      ]),
      joiningAvailabilityDays: 5,
      salaryMinExpectation: 30000,
      salaryMaxExpectation: 40000,
      salaryCurrency: "INR",
      targetJobTitles: JSON.stringify([
        "Data Analyst",
        "IT",
        "Supply Chain",
        "Operations",
        "Business Analyst",
      ]),
      excludedJobTitles: JSON.stringify([
        "Chemical Engineering",
        "Chemical Plant Engineer",
      ]),
      fresherStatus: true,
      summary:
        "High-aptitude Fresher with proven analytical abilities in SQL, Python, Excel, and Supply Chain analytics. Fast learner who can join within 5 days and deliver immediate data-driven value.",
      portfolioUrl: "https://sakir-analytics.portfolio.dev",
      githubUrl: "https://github.com/sakir-hassain",
      linkedinUrl: "https://linkedin.com/in/sakir-hassain",
    },
  });

  // 3. Education
  await prisma.candidateEducation.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.candidateEducation.createMany({
    data: [
      {
        candidateId: candidate.id,
        institution: "University of Calcutta",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Applications & Analytics",
        grade: "8.6 CGPA / First Class",
        startYear: 2021,
        endYear: 2024,
        isCurrent: false,
      },
    ],
  });

  // 4. Internships & Experience
  await prisma.candidateExperience.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.candidateExperience.createMany({
    data: [
      {
        candidateId: candidate.id,
        company: "Apex Logistics & Supply Chain Solutions",
        title: "Operations & Data Analyst Intern",
        location: "Kolkata",
        isInternship: true,
        startDate: "2024-01",
        endDate: "2024-06",
        isCurrent: false,
        description:
          "Assisted operations and analytics teams with daily order dispatch reports, warehouse transit bottlenecks, and SQL-driven inventory reporting.",
        achievements: JSON.stringify([
          "Automated daily Excel dispatch dashboards reducing reporting lag from 3 hours to 20 minutes.",
          "Wrote SQL queries joining 5+ inventory tables to highlight dead stock items, recovering ₹1.2L in buffer costs.",
          "Collaborated with fleet managers to optimize route dispatch schedules across West Bengal distribution hubs.",
        ]),
      },
    ],
  });

  // 5. Skills
  await prisma.candidateSkill.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.candidateSkill.createMany({
    data: [
      { candidateId: candidate.id, name: "SQL", category: "Technical", proficiency: "ADVANCED", verified: true },
      { candidateId: candidate.id, name: "Python", category: "Technical", proficiency: "INTERMEDIATE", verified: true },
      { candidateId: candidate.id, name: "Excel & Advanced Formulas", category: "Tools", proficiency: "ADVANCED", verified: true },
      { candidateId: candidate.id, name: "Power BI", category: "Tools", proficiency: "INTERMEDIATE", verified: true },
      { candidateId: candidate.id, name: "Data Visualization", category: "Technical", proficiency: "ADVANCED", verified: true },
      { candidateId: candidate.id, name: "Supply Chain Operations", category: "Operations", proficiency: "INTERMEDIATE", verified: true },
      { candidateId: candidate.id, name: "Business Analysis", category: "Operations", proficiency: "INTERMEDIATE", verified: true },
      { candidateId: candidate.id, name: "Git & Version Control", category: "Tools", proficiency: "INTERMEDIATE", verified: true },
      { candidateId: candidate.id, name: "Problem Solving", category: "Soft", proficiency: "ADVANCED", verified: true },
      { candidateId: candidate.id, name: "IT Troubleshooting", category: "Technical", proficiency: "INTERMEDIATE", verified: true },
    ],
  });

  // 6. Projects
  await prisma.candidateProject.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.candidateProject.createMany({
    data: [
      {
        candidateId: candidate.id,
        title: "OmniChannel Retail Sales Analytics Dashboard",
        description:
          "Built end-to-end interactive Power BI & SQL dashboard analyzing 50,000+ customer retail orders, SKU sales velocity, and regional revenue trends.",
        technologies: JSON.stringify(["SQL", "Power BI", "Python", "Pandas"]),
        url: "https://github.com/sakir-hassain/omnichannel-sales-analytics",
        impact: "Identified top 20% high-margin SKUs and seasonal drop-off periods.",
      },
      {
        candidateId: candidate.id,
        title: "Supply Chain Warehouse Inventory Optimizer",
        description:
          "Designed Python and Excel simulation tool calculating safety stock reorder levels and EOQ (Economic Order Quantity) for perishable and durable stock.",
        technologies: JSON.stringify(["Python", "Excel VBA", "Operations Research"]),
        url: "https://github.com/sakir-hassain/inventory-optimizer",
        impact: "Reduced simulated stockout frequency by 18%.",
      },
      {
        candidateId: candidate.id,
        title: "IT Support Helpdesk Ticket Resolution Tracker",
        description:
          "Created relational schema and operational tracking queries measuring mean time to resolve (MTTR) and technician ticket loads.",
        technologies: JSON.stringify(["PostgreSQL", "Excel", "Data Modeling"]),
        url: "https://github.com/sakir-hassain/it-helpdesk-tracker",
        impact: "Streamlined operational visibility for SLA compliance.",
      },
    ],
  });

  // 7. Certifications
  await prisma.candidateCertification.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.candidateCertification.createMany({
    data: [
      {
        candidateId: candidate.id,
        title: "Google Data Analytics Professional Certificate",
        issuer: "Google / Coursera",
        issueDate: "2024-05",
        credentialUrl: "https://coursera.org/verify/professional-cert/GOOGLE-DATA",
      },
      {
        candidateId: candidate.id,
        title: "Advanced SQL for Data Science & Business Intelligence",
        issuer: "Udemy",
        issueDate: "2023-11",
        credentialUrl: "https://udemy.com/certificate/UC-ADV-SQL",
      },
    ],
  });

  // 8. Languages
  await prisma.candidateLanguage.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.candidateLanguage.createMany({
    data: [
      { candidateId: candidate.id, language: "English", proficiency: "PROFESSIONAL" },
      { candidateId: candidate.id, language: "Hindi", proficiency: "FLUENT" },
      { candidateId: candidate.id, language: "Bengali", proficiency: "NATIVE" },
    ],
  });

  // 9. Master CV Version snapshot
  const masterCvSnapshot = {
    fullName: "Sakir Hassain",
    email: "sakir.jobpilot@gmail.com",
    phone: "+91 98765 43210",
    currentCity: "Kolkata",
    summary:
      "High-aptitude Fresher with proven analytical abilities in SQL, Python, Excel, and Supply Chain analytics. Fast learner who can join within 5 days and deliver immediate data-driven value.",
    education: [
      {
        institution: "University of Calcutta",
        degree: "Bachelor of Science in Computer Applications & Analytics",
        year: "2021 - 2024",
        grade: "8.6 CGPA",
      },
    ],
    experience: [
      {
        company: "Apex Logistics & Supply Chain Solutions",
        role: "Operations & Data Analyst Intern",
        duration: "Jan 2024 - Jun 2024",
        location: "Kolkata",
        achievements: [
          "Automated daily Excel dispatch dashboards reducing reporting lag from 3 hours to 20 minutes.",
          "Wrote SQL queries joining 5+ inventory tables to highlight dead stock items, recovering ₹1.2L in buffer costs.",
          "Collaborated with fleet managers to optimize route dispatch schedules across West Bengal distribution hubs.",
        ],
      },
    ],
    skills: [
      "SQL",
      "Python",
      "Excel & Advanced Formulas",
      "Power BI",
      "Supply Chain Operations",
      "Business Analysis",
      "Data Visualization",
      "IT Troubleshooting",
      "Problem Solving",
    ],
    projects: [
      {
        title: "OmniChannel Retail Sales Analytics Dashboard",
        tech: "SQL, Power BI, Python",
        highlights: "Analyzed 50k+ orders, SKU velocity, and revenue drivers.",
      },
      {
        title: "Supply Chain Warehouse Inventory Optimizer",
        tech: "Python, Excel, EOQ Models",
        highlights: "Optimized safety stock reorder thresholds reducing stockout by 18%.",
      },
    ],
    certifications: [
      "Google Data Analytics Professional Certificate",
      "Advanced SQL for Business Intelligence",
    ],
  };

  const masterCv = await prisma.cvVersion.create({
    data: {
      candidateId: candidate.id,
      versionNumber: 1,
      title: "Master CV v1 (Canonical Verified)",
      contentSnapshot: JSON.stringify(masterCvSnapshot),
      isMaster: true,
    },
  });

  await prisma.candidateProfile.update({
    where: { id: candidate.id },
    data: { activeMasterCvId: masterCv.id },
  });

  // 10. CV Template
  await prisma.cvTemplate.upsert({
    where: { id: "template-ats-clean" },
    update: {},
    create: {
      id: "template-ats-clean",
      name: "Modern ATS Clean (Standard)",
      structureSchema: JSON.stringify({
        sections: ["header", "summary", "skills", "experience", "projects", "education", "certifications"],
        fontFamily: "Inter, sans-serif",
        lineHeight: "1.4",
        margin: "0.5in",
      }),
      isDefault: true,
    },
  });

  // 11. Job Sources
  await prisma.jobSource.upsert({
    where: { id: "source-mock-feed" },
    update: {},
    create: {
      id: "source-mock-feed",
      name: "Mock Enterprise Feed (Kolkata & Remote)",
      adapterType: "mock",
      baseUrl: "https://jobs.jobpilot.internal/feed",
      isActive: true,
      rateLimitPerMin: 60,
    },
  });

  await prisma.jobSource.upsert({
    where: { id: "source-direct-portal" },
    update: {},
    create: {
      id: "source-direct-portal",
      name: "Direct Company Career Portals",
      adapterType: "direct_portal",
      baseUrl: "https://careers.direct.example.com",
      isActive: true,
      rateLimitPerMin: 30,
    },
  });

  // 12. Email Templates
  await prisma.emailTemplate.upsert({
    where: { id: "tpl-job-app" },
    update: {},
    create: {
      id: "tpl-job-app",
      name: "Standard Job Application Email",
      category: "APPLICATION",
      subjectTemplate: "Application for {{jobTitle}} - {{candidateName}} (Can join in {{joiningDays}} days)",
      bodyTemplate:
        "Dear Hiring Team at {{company}},\n\nI am writing to express my enthusiastic interest in the {{jobTitle}} opening. As a fresh graduate based in {{currentCity}} with hands-on internship experience in data analytics and operations, I have verified proficiency in {{keySkills}}.\n\nI am available to join within {{joiningDays}} days and have attached my tailored resume for your review.\n\nBest regards,\n{{candidateName}}\n{{candidatePhone}}\n{{candidateEmail}}",
    },
  });

  await prisma.emailTemplate.upsert({
    where: { id: "tpl-follow-up" },
    update: {},
    create: {
      id: "tpl-follow-up",
      name: "Application Follow-up",
      category: "FOLLOW_UP",
      subjectTemplate: "Following Up: Application for {{jobTitle}} - {{candidateName}}",
      bodyTemplate:
        "Dear Hiring Manager,\n\nI am following up on my application submitted on {{submittedDate}} for the {{jobTitle}} position at {{company}}. I remain keenly interested in contributing to your team.\n\nThank you for your time and consideration.\n\nSincerely,\n{{candidateName}}",
    },
  });

  // 13. System Settings
  const defaultSettings = [
    { key: "APP_NAME", value: "JobPilot AI", category: "GENERAL", description: "Platform Branding Title" },
    { key: "APPLICATION_POLICY", value: "APPROVAL_REQUIRED", category: "POLICY", description: "Default mode: AUTO, APPROVAL_REQUIRED, MANUAL" },
    { key: "MAX_DAILY_APPLICATIONS", value: "10", category: "LIMITS", description: "Safety throttle on daily applications" },
    { key: "AI_PROVIDER", value: "mock", category: "AI", description: "AI Engine: mock or gemini" },
    { key: "AUTO_APPLY_MIN_SCORE", value: "75", category: "MATCHING", description: "Score threshold for Auto-Apply eligibility" },
    { key: "REVIEW_REQUIRED_MIN_SCORE", value: "50", category: "MATCHING", description: "Score threshold for human review" },
    { key: "ENABLE_FOLLOW_UP_SCHEDULER", value: "true", category: "SCHEDULER", description: "Automatically flag follow-up tasks after 5 business days" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("Seeding complete! Admin, candidate profile, sources, templates, and settings are ready.");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
