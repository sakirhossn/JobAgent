import { JobSourceAdapter, JobSearchQuery, RawSourceJob } from "./adapter.interface";
import { NormalizedJob } from "@/types";

export class MockJobSourceAdapter implements JobSourceAdapter {
  readonly id = "source-mock-feed";
  readonly name = "Mock Enterprise Feed";
  readonly adapterType = "mock";

  private sampleJobs: Record<string, any>[] = [
    {
      id: "JOB-DA-KOL-01",
      title: "Junior Data Analyst",
      company: "Kolkata Tech Solutions",
      location: "Kolkata, West Bengal",
      remoteType: "ONSITE",
      employmentType: "FULL_TIME",
      salaryMin: 32000,
      salaryMax: 38000,
      salaryCurrency: "INR",
      experienceRequired: "0-1 years (Freshers Welcome)",
      educationRequired: "Bachelor's Degree in Computer Science, Analytics, or related field",
      skills: ["SQL", "Python", "Excel", "Data Visualization", "Power BI"],
      preferredSkills: ["Git", "Pandas", "ETL"],
      originalDescription: `Company: Kolkata Tech Solutions
Position: Junior Data Analyst
Location: Salt Lake Sector V, Kolkata (On-site)
Salary: ₹32,000 - ₹38,000 per month

Role Overview:
We are seeking an enthusiastic Junior Data Analyst to join our expanding business intelligence team in Kolkata. This entry-level position is ideal for recent graduates or freshers with strong analytical curiosity and solid foundations in SQL, Excel, and Python.

Key Responsibilities:
- Extract, clean, and validate daily transactional datasets using SQL queries.
- Build and maintain interactive dashboards in Power BI and Microsoft Excel for departmental reporting.
- Assist senior business analysts in analyzing operational performance and customer churn metrics.
- Document query logic, report definitions, and data dictionary mappings.

Requirements:
- Bachelor's degree in Computer Applications, Analytics, Statistics, or Science.
- Strong practical knowledge of SQL (JOINs, aggregations, subqueries) and Microsoft Excel.
- Basic familiarity with Python for data manipulation (Pandas).
- Ability to join immediately or within 5 to 7 days.
- Excellent communication and structured problem-solving skills.`,
      responsibilities: [
        "Extract, clean, and validate daily transactional datasets using SQL",
        "Build and maintain interactive dashboards in Power BI and Excel",
        "Assist senior analysts in analyzing operational metrics",
        "Document query logic and report definitions",
      ],
      qualifications: [
        "Bachelor's degree in Computer Science, Analytics, or Science",
        "Solid hands-on foundation in SQL and Excel",
        "Basic Python familiarity",
      ],
      applicationUrl: "http://localhost:3000/api/mock-portal/apply?jobId=JOB-DA-KOL-01",
      applicationEmail: "hr@kolkatatechsolutions.com",
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "JOB-OPS-KOL-02",
      title: "Operations & Supply Chain Analyst",
      company: "Bengal Logistics Hub",
      location: "Kolkata, West Bengal",
      remoteType: "ONSITE",
      employmentType: "FULL_TIME",
      salaryMin: 30000,
      salaryMax: 35000,
      salaryCurrency: "INR",
      experienceRequired: "Fresher / 0-1 year internship",
      educationRequired: "Graduate degree in any discipline",
      skills: ["Supply Chain Operations", "Excel", "SQL", "Reporting", "Problem Solving"],
      preferredSkills: ["Warehouse Management", "Inventory Control"],
      originalDescription: `Company: Bengal Logistics Hub
Position: Operations & Supply Chain Analyst
Location: Taratala / Kolkata, West Bengal
Salary: ₹30,000 - ₹35,000 per month

About Us:
Bengal Logistics Hub manages regional warehousing and last-mile freight operations across Eastern India.

Responsibilities:
- Monitor inventory stockouts, daily dispatch logs, and warehouse turnarounds.
- Generate weekly freight variance reports using Excel and SQL database extracts.
- Identify fulfillment bottlenecks and recommend dispatch schedule adjustments.
- Coordinate directly with fleet dispatchers and hub supervisors.

Qualifications:
- Bachelor's degree (Fresher or up to 1 year experience / internship preferred).
- Advanced Microsoft Excel skills (VLOOKUP, Pivot Tables, SUMIFS).
- Working understanding of Supply Chain Operations and SQL queries.
- Must be located in or ready to work in Kolkata. Immediate joiner preferred.`,
      responsibilities: [
        "Monitor inventory stockouts, daily dispatch logs, and warehouse turnarounds",
        "Generate weekly freight variance reports using Excel and SQL",
        "Identify fulfillment bottlenecks",
      ],
      qualifications: [
        "Bachelor's degree",
        "Advanced Excel and working understanding of Supply Chain and SQL",
        "Ready to join within short notice in Kolkata",
      ],
      applicationUrl: undefined,
      applicationEmail: "careers@bengallogistics.com", // Direct Email route
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "JOB-IT-KOL-03",
      title: "IT Support & Operations Associate",
      company: "InfoTech Matrix",
      location: "Kolkata, West Bengal",
      remoteType: "ONSITE",
      employmentType: "FULL_TIME",
      salaryMin: 28000,
      salaryMax: 34000,
      salaryCurrency: "INR",
      experienceRequired: "0-1 years",
      educationRequired: "BSc / BCA / BTech or relevant diploma",
      skills: ["IT Troubleshooting", "SQL", "Hardware", "Operating Systems", "Problem Solving"],
      preferredSkills: ["Networking", "Linux"],
      originalDescription: `Company: InfoTech Matrix
Position: IT Support & Operations Associate
Location: Rajarhat, Kolkata
Salary: ₹28,000 - ₹34,000 / month

Job Description:
InfoTech Matrix is hiring an entry-level IT Support and Operations Associate for our 24/7 technical operations desk.

Responsibilities:
- Troubleshoot workstation hardware, internal network connectivity, and operating system issues.
- Log, categorize, and escalate tickets using internal ticketing portal.
- Run routine database diagnostics and SQL status queries.
- Assist in system onboarding for new hires.

Ideal Candidate:
- Fresh graduate with BSc / BCA / IT background.
- Good troubleshooting acumen and basic SQL literacy.
- Available for fast joining (within 1 week).`,
      responsibilities: [
        "Troubleshoot workstation hardware, network, and OS issues",
        "Log and escalate support tickets",
        "Run routine database status checks",
      ],
      qualifications: [
        "Fresh graduate with BSc / BCA / IT background",
        "Troubleshooting skills and basic SQL literacy",
      ],
      applicationUrl: "http://localhost:3000/api/mock-portal/apply?jobId=JOB-IT-KOL-03",
      applicationEmail: "jobs@infotechmatrix.in",
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "JOB-BA-REM-04",
      title: "Junior Business Analyst",
      company: "Nova Global Analytics",
      location: "Remote (India)",
      remoteType: "REMOTE",
      employmentType: "FULL_TIME",
      salaryMin: 35000,
      salaryMax: 42000,
      salaryCurrency: "INR",
      experienceRequired: "0-2 years (Freshers considered)",
      educationRequired: "Bachelor's degree",
      skills: ["Business Analysis", "SQL", "Excel", "Data Visualization", "Problem Solving"],
      preferredSkills: ["Power BI", "Agile", "Jira"],
      originalDescription: `Company: Nova Global Analytics
Position: Junior Business Analyst (Remote)
Location: 100% Remote, India
Salary: ₹35,000 - ₹42,000 per month

Role:
Join our distributed data analytics consulting unit. Work directly with business stakeholders to document user requirements, create data mockups, and translate business questions into SQL queries and BI visualizations.

Requirements:
- Bachelor's degree in quantitative field or business analytics.
- Proven familiarity with SQL, Excel, and dashboard prototyping.
- Self-motivated remote worker with strong written English communication.
- Available to join on short notice.`,
      responsibilities: [
        "Translate business requirements into analytical specifications",
        "Prepare SQL extracts and data summaries",
        "Collaborate with engineering and product leads remotely",
      ],
      qualifications: [
        "Bachelor's degree in analytics or related area",
        "SQL and Excel proficiency",
        "Good communication",
      ],
      applicationUrl: "http://localhost:3000/api/mock-portal/apply?jobId=JOB-BA-REM-04",
      applicationEmail: "talent@novaglobal.com",
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "JOB-CHEM-EXCL-05",
      title: "Chemical Process & Plant Engineer",
      company: "Haldia Petrochemical Works",
      location: "Haldia / Kolkata",
      remoteType: "ONSITE",
      employmentType: "FULL_TIME",
      salaryMin: 45000,
      salaryMax: 55000,
      salaryCurrency: "INR",
      experienceRequired: "Fresher to 2 years",
      educationRequired: "B.Tech in Chemical Engineering mandatory",
      skills: ["Chemical Engineering", "Process Safety", "Thermodynamics", "Distillation Columns"],
      preferredSkills: ["HAZOP", "Plant Maintenance"],
      originalDescription: `Company: Haldia Petrochemical Works
Position: Chemical Process & Plant Engineer
Location: Haldia Industrial Belt (Near Kolkata)
Salary: ₹45,000 - ₹55,000 per month

Mandatory Requirement:
Candidate MUST hold a degree in Chemical Engineering.
Responsibilities include monitoring continuous catalytic cracking units, thermal exchangers, distillation column pressure, and OSHA safety compliance in industrial chemical plants.`,
      responsibilities: [
        "Monitor catalytic cracking and distillation columns",
        "Execute plant chemical safety inspections",
      ],
      qualifications: [
        "B.Tech in Chemical Engineering mandatory",
      ],
      applicationUrl: "http://localhost:3000/api/mock-portal/apply?jobId=JOB-CHEM-EXCL-05",
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "JOB-SR-ARCH-06",
      title: "Lead Enterprise Data Architect",
      company: "Global BigData Labs",
      location: "Kolkata, West Bengal",
      remoteType: "HYBRID",
      employmentType: "FULL_TIME",
      salaryMin: 150000,
      salaryMax: 200000,
      salaryCurrency: "INR",
      experienceRequired: "10-15 years experience required",
      educationRequired: "Master's or Bachelor's in CS",
      skills: ["Data Architecture", "Hadoop", "Snowflake", "Distributed Systems", "Cloud Architecture"],
      preferredSkills: ["Kubernetes", "Kafka"],
      originalDescription: `Company: Global BigData Labs
Position: Lead Enterprise Data Architect
Location: Kolkata (Hybrid)
Salary: ₹1,50,000 - ₹2,00,000 per month

Role:
Seeking an experienced veteran architect with at least 10+ years of enterprise data warehousing and distributed systems experience to architect petabyte-scale pipelines. Freshers or junior applicants will NOT be considered.`,
      responsibilities: ["Lead petabyte scale architecture", "Mentor 20+ data engineers"],
      qualifications: ["10+ years enterprise data architecture"],
      applicationUrl: "http://localhost:3000/api/mock-portal/apply?jobId=JOB-SR-ARCH-06",
      postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "JOB-DA-KOL-DUP",
      title: "Junior Data Analyst",
      company: "Kolkata Tech Solutions",
      location: "Kolkata, West Bengal",
      remoteType: "ONSITE",
      employmentType: "FULL_TIME",
      salaryMin: 32000,
      salaryMax: 38000,
      salaryCurrency: "INR",
      experienceRequired: "0-1 years (Freshers Welcome)",
      educationRequired: "Bachelor's Degree in Computer Science, Analytics, or related field",
      skills: ["SQL", "Python", "Excel", "Data Visualization", "Power BI"],
      preferredSkills: ["Git", "Pandas", "ETL"],
      originalDescription: `Company: Kolkata Tech Solutions
Position: Junior Data Analyst
Location: Salt Lake Sector V, Kolkata (On-site)
Salary: ₹32,000 - ₹38,000 per month

Role Overview:
We are seeking an enthusiastic Junior Data Analyst to join our expanding business intelligence team in Kolkata. This entry-level position is ideal for recent graduates or freshers with strong analytical curiosity and solid foundations in SQL, Excel, and Python.

Key Responsibilities:
- Extract, clean, and validate daily transactional datasets using SQL queries.
- Build and maintain interactive dashboards in Power BI and Microsoft Excel for departmental reporting.
- Assist senior business analysts in analyzing operational performance and customer churn metrics.
- Document query logic, report definitions, and data dictionary mappings.

Requirements:
- Bachelor's degree in Computer Applications, Analytics, Statistics, or Science.
- Strong practical knowledge of SQL (JOINs, aggregations, subqueries) and Microsoft Excel.
- Basic familiarity with Python for data manipulation (Pandas).
- Ability to join immediately or within 5 to 7 days.
- Excellent communication and structured problem-solving skills.`,
      applicationUrl: "http://localhost:3000/api/mock-portal/apply?jobId=JOB-DA-KOL-01",
      postedAt: new Date().toISOString(),
    },
  ];

  async searchJobs(query: JobSearchQuery): Promise<RawSourceJob[]> {
    const limit = query.limit || 10;
    return this.sampleJobs.slice(0, limit).map((job) => ({
      sourceJobId: job.id,
      sourceId: this.id,
      url: job.applicationUrl,
      payload: job,
    }));
  }

  async fetchJobDetails(rawJob: RawSourceJob): Promise<RawSourceJob> {
    return rawJob;
  }

  normalizeJob(rawJob: RawSourceJob): NormalizedJob {
    const p = rawJob.payload;
    return {
      sourceJobId: rawJob.sourceJobId,
      sourceId: this.id,
      sourceUrl: rawJob.url,
      title: p.title,
      company: p.company,
      location: p.location,
      remoteType: p.remoteType || "ONSITE",
      employmentType: p.employmentType || "FULL_TIME",
      salaryMin: p.salaryMin,
      salaryMax: p.salaryMax,
      salaryCurrency: p.salaryCurrency || "INR",
      experienceRequired: p.experienceRequired,
      educationRequired: p.educationRequired,
      skills: p.skills || [],
      preferredSkills: p.preferredSkills || [],
      originalDescription: p.originalDescription, // UNALTERED ORIGINAL TEXT
      responsibilities: p.responsibilities,
      qualifications: p.qualifications,
      applicationUrl: p.applicationUrl,
      applicationEmail: p.applicationEmail,
      postedAt: p.postedAt ? new Date(p.postedAt) : undefined,
      rawSourceData: p,
    };
  }
}
