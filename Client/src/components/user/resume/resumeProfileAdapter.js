export function buildResumeFromUser(user) {
  const safe = user || {};
  const name = safe.name || `${safe.firstName || ""} ${safe.lastName || ""}`.trim() || "ConnectiFy Member";

  return {
    name,
    headline: safe.headline || safe.role || "Professional",
    email: safe.email || "",
    phone: safe.phone || "",
    location: safe.location || "",
    linkedin: safe.linkedin || "",
    website: safe.website || "",
    summary: safe.bio || "",
    skills: Array.isArray(safe.skills) ? safe.skills : [],
    experiences: Array.isArray(safe.experiences) ? safe.experiences : [],
    education: Array.isArray(safe.education) ? safe.education : [],
  };
}


