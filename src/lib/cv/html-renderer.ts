import { TailoredCvData } from "@/types";
import { CandidateFullProfile } from "../profile/integrity";

/**
 * Generates clean, ATS-compliant HTML for viewing and printing/saving as PDF.
 */
export function renderCvToHtml(cv: TailoredCvData, candidate: CandidateFullProfile): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${cv.title} - ${candidate.fullName}</title>
  <style>
    @page { margin: 0.6in; size: letter; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.45;
      font-size: 10pt;
      margin: 0;
      padding: 24px;
      background: #fff;
    }
    .header { text-align: center; border-bottom: 2px solid #2d3748; padding-bottom: 8px; margin-bottom: 12px; }
    .header h1 { font-size: 18pt; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px; color: #111827; }
    .header .contact { font-size: 9pt; color: #4b5563; }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 2px;
      margin-top: 14px;
      margin-bottom: 6px;
      color: #1e293b;
    }
    .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 10pt; margin-bottom: 2px; }
    .item-subheader { display: flex; justify-content: space-between; font-style: italic; font-size: 9pt; color: #475569; margin-bottom: 4px; }
    ul { margin: 2px 0 8px 18px; padding: 0; }
    li { margin-bottom: 3px; font-size: 9.5pt; }
    .skills-grid { font-size: 9.5pt; margin-bottom: 8px; }
    .tag { display: inline-block; background: #f1f5f9; padding: 1px 6px; border-radius: 3px; margin: 2px; font-size: 8.5pt; color: #334155; }
    .badge { font-size: 8pt; color: #059669; font-weight: 600; margin-left: 6px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${candidate.fullName}</h1>
    <div class="contact">
      ${candidate.currentCity}, India | ${candidate.phone} | ${candidate.email}
      ${candidate.linkedinUrl ? ` | ${candidate.linkedinUrl}` : ""}
      ${candidate.githubUrl ? ` | ${candidate.githubUrl}` : ""}
    </div>
  </div>

  <div class="section-title">Professional Summary</div>
  <p style="margin: 4px 0 8px 0; font-size: 9.5pt; text-align: justify;">${cv.summary}</p>

  <div class="section-title">Verified Core Competencies</div>
  <div class="skills-grid">
    <strong>Technical Skills & Tools:</strong>
    ${cv.highlightedSkills.map((s) => `<span class="tag">${s.name}</span>`).join(" ")}
  </div>

  <div class="section-title">Experience & Internships</div>
  ${cv.highlightedExperience
    .map(
      (exp) => `
    <div class="item-header">
      <span>${exp.company}</span>
      <span>${exp.location || "Kolkata, India"}</span>
    </div>
    <div class="item-subheader">
      <span>${exp.title}</span>
      <span>${exp.duration}</span>
    </div>
    <ul>
      ${exp.achievements.map((a) => `<li>${a}</li>`).join("")}
    </ul>
  `
    )
    .join("")}

  <div class="section-title">Relevant Projects</div>
  ${cv.highlightedProjects
    .map(
      (proj) => `
    <div class="item-header">
      <span>${proj.title}</span>
      <span style="font-size: 8.5pt; color: #64748b;">Tech: ${proj.technologies.join(", ")}</span>
    </div>
    <p style="margin: 2px 0 4px 0; font-size: 9.5pt;">${proj.description}</p>
    ${proj.impact ? `<p style="margin: 0 0 6px 0; font-size: 9pt; color: #047857; font-weight: 500;">Impact: ${proj.impact}</p>` : ""}
  `
    )
    .join("")}

  <div class="section-title">Education</div>
  ${cv.education
    .map(
      (edu) => `
    <div class="item-header">
      <span>${edu.institution}</span>
      <span>${edu.year}</span>
    </div>
    <div class="item-subheader">
      <span>${edu.degree} in ${edu.field}</span>
      <span>${edu.grade || ""}</span>
    </div>
  `
    )
    .join("")}

  <div class="section-title">Certifications</div>
  <ul>
    ${cv.certifications.map((c) => `<li><strong>${c.title}</strong> — ${c.issuer} (${c.issueDate})</li>`).join("")}
  </ul>

  <div class="section-title">Languages</div>
  <p style="margin: 4px 0; font-size: 9pt;">
    ${cv.languages.map((l) => `${l.language} (${l.proficiency.toLowerCase()})`).join(", ")}
  </p>
</body>
</html>`;
}
