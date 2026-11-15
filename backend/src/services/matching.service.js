import { query, prisma } from '../config/database.js';

export async function getMatchingFreelancers(projectId) {
  // 1. Get project details including required skills
  const projectSql = `
    SELECT 
      p.id,
      p.title,
      p.experience_level,
      p.min_budget,
      p.max_budget,
      p.project_type,
      COALESCE(ARRAY_AGG(ps.skill_id) FILTER (WHERE ps.skill_id IS NOT NULL), '{}') AS required_skill_ids,
      COUNT(ps.skill_id) AS required_skills_count
    FROM projects p
    LEFT JOIN project_skills ps ON p.id = ps.project_id
    WHERE p.id = $1
    GROUP BY p.id;
  `;

  const projectRes = await query(projectSql, [projectId]);
  if (!projectRes.rows[0]) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const project = projectRes.rows[0];
  const requiredSkillIds = project.required_skill_ids || [];
  const totalSkillsCount = Math.max(1, parseInt(project.required_skills_count || '1', 10));

  // 2. Query all active freelancers with their skills, profile, and rating
  const freelancersSql = `
    SELECT
      u.id AS user_id,
      u.name,
      u.email,
      u.avatar_url,
      fp.id AS profile_id,
      fp.title,
      fp.bio,
      fp.hourly_rate,
      fp.experience_level,
      fp.availability,
      fp.average_rating,
      fp.total_earnings,
      fp.completed_projects_count,
      COALESCE(
        ARRAY_AGG(fs.skill_id) FILTER (WHERE fs.skill_id IS NOT NULL), 
        '{}'
      ) AS possessed_skill_ids,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'level', fs.proficiency_level)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS skills
    FROM users u
    JOIN freelancer_profiles fp ON u.id = fp.user_id
    LEFT JOIN freelancer_skills fs ON fp.id = fs.freelancer_id
    LEFT JOIN skills s ON fs.skill_id = s.id
    WHERE u.role = 'FREELANCER' AND u.status = 'ACTIVE'
    GROUP BY u.id, u.name, u.email, u.avatar_url, fp.id, fp.title, fp.bio,
             fp.hourly_rate, fp.experience_level, fp.availability,
             fp.average_rating, fp.total_earnings, fp.completed_projects_count;
  `;

  const freelancersRes = await query(freelancersSql);
  const freelancers = freelancersRes.rows;

  // 3. Compute matching scores
  const scoredFreelancers = freelancers.map((f) => {
    // --- Factor 1: Skill Compatibility (50%) ---
    const possessedSkills = new Set(f.possessed_skill_ids || []);
    let matchingSkillsCount = 0;
    requiredSkillIds.forEach((reqId) => {
      if (possessedSkills.has(reqId)) {
        matchingSkillsCount++;
      }
    });

    const skillRatio = requiredSkillIds.length > 0 ? matchingSkillsCount / totalSkillsCount : 0.5;
    const skillScore = Math.min(50.0, Math.round(skillRatio * 50.0 * 10) / 10);

    // --- Factor 2: Rating (20%) ---
    const avgRating = parseFloat(f.average_rating || 0);
    const ratingScore = Math.min(20.0, Math.round((avgRating / 5.0) * 20.0 * 10) / 10);

    // --- Factor 3: Experience (15%) ---
    const pExp = project.experience_level;
    const fExp = f.experience_level;
    let expScore = 7.5; // default fallback

    if (pExp === fExp) {
      expScore = 15.0;
    } else if (pExp === 'ENTRY') {
      expScore = 15.0; // Intermediate or Expert easily qualifies for Entry
    } else if (pExp === 'INTERMEDIATE') {
      expScore = fExp === 'EXPERT' ? 15.0 : 8.0;
    } else if (pExp === 'EXPERT') {
      expScore = fExp === 'INTERMEDIATE' ? 10.0 : 4.0;
    }

    // --- Factor 4: Budget Compatibility (15%) ---
    const hourlyRate = parseFloat(f.hourly_rate || 0);
    const maxBudget = parseFloat(project.max_budget || 0);
    const minBudget = parseFloat(project.min_budget || 0);
    let budgetScore = 12.0;

    if (hourlyRate > 0) {
      // Estimated 40-hour project cost
      const estimatedCost = hourlyRate * 40;
      if (estimatedCost <= maxBudget && estimatedCost >= minBudget) {
        budgetScore = 15.0;
      } else if (estimatedCost < minBudget) {
        budgetScore = 13.5; // economical
      } else if (estimatedCost <= maxBudget * 1.25) {
        budgetScore = 9.0;
      } else {
        budgetScore = 4.0;
      }
    }

    // Total weighted score (out of 100)
    const totalScore = Math.round((skillScore + ratingScore + expScore + budgetScore) * 10) / 10;

    return {
      freelancerId: f.user_id,
      name: f.name,
      email: f.email,
      avatarUrl: f.avatar_url,
      title: f.title,
      bio: f.bio,
      experienceLevel: f.experience_level,
      hourlyRate: f.hourly_rate,
      availability: f.availability,
      averageRating: f.average_rating,
      totalEarnings: f.total_earnings,
      completedProjectsCount: f.completed_projects_count,
      skills: f.skills,
      matchingSkillsCount,
      totalRequiredSkills: totalSkillsCount,
      matchBreakdown: {
        skillScore,
        ratingScore,
        experienceScore: expScore,
        budgetScore,
      },
      matchScore: totalScore,
    };
  });

  // Sort descending by matchScore
  scoredFreelancers.sort((a, b) => b.matchScore - a.matchScore);

  return scoredFreelancers;
}
