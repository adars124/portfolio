import {
	getPersonalInfo,
	getWorkExperience,
	getEducation,
	getSkills,
	getProjects
} from '$lib/server/services/portfolio';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [personalInfo, workExperience, education, skills, projects] = await Promise.all([
		getPersonalInfo(),
		getWorkExperience(),
		getEducation(),
		getSkills(),
		getProjects()
	]);

	return {
		personalInfo,
		workExperience,
		education,
		skills,
		projects
	};
};
