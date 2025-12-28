import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

export async function getPersonalInfo() {
	const result = await db.select().from(schema.personalInfo).limit(1);
	return result[0] || null;
}

export async function getWorkExperience() {
	const experiences = await db
		.select()
		.from(schema.workExperience)
		.orderBy(schema.workExperience.order);

	// Fetch skills for each experience
	const experiencesWithSkills = await Promise.all(
		experiences.map(async (exp) => {
			const skills = await db
				.select()
				.from(schema.experienceSkills)
				.where(eq(schema.experienceSkills.experienceId, exp.id));

			return {
				...exp,
				skills: skills.map((s) => s.skill)
			};
		})
	);

	return experiencesWithSkills;
}

export async function getEducation() {
	return await db.select().from(schema.education).orderBy(schema.education.order);
}

export async function getSkills() {
	const allSkills = await db.select().from(schema.skills).orderBy(schema.skills.order);

	// Group skills by category
	const grouped: Record<string, string[]> = {};

	for (const skill of allSkills) {
		if (!grouped[skill.category]) {
			grouped[skill.category] = [];
		}
		grouped[skill.category].push(skill.skill);
	}

	return grouped;
}

export async function getProjects() {
	return await db.select().from(schema.projects).orderBy(schema.projects.order);
}
