import type { CommandMap } from '$lib/types/terminal';

interface PersonalInfo {
	name: string;
	title: string;
	tagline: string;
	bio: string;
	location: string;
	email: string;
	github: string;
	linkedin: string;
}

interface WorkExperience {
	company: string;
	position: string;
	type: string;
	duration: string;
	location: string;
	description: string;
	skills: string[];
}

interface Education {
	institution: string;
	degree: string;
	field: string;
	duration: string;
}

interface PortfolioData {
	personalInfo: PersonalInfo | null;
	workExperience: WorkExperience[];
	education: Education[];
	skills: Record<string, string[]>;
	projects: any[];
}

export const createCommands = (
	data: PortfolioData,
	clearHistory: () => void
): CommandMap => {
	const { personalInfo, workExperience, education, skills, projects } = data;

	if (!personalInfo) {
		throw new Error('Personal info not found in database');
	}

	return {
		help: {
			description: 'Show available commands',
			execute: () => [
				'Available commands:',
				'',
				'  whoami      - Learn about Aadarsha',
				'  experience  - View work experience',
				'  skills      - View technical skills',
				'  education   - View educational background',
				'  contact     - Get in touch',
				'  projects    - View projects',
				'  blog        - Visit the blog',
				'  clear       - Clear the terminal',
				'  help        - Show this help message',
				''
			]
		},

		whoami: {
			description: 'Learn about Aadarsha',
			execute: () => [
				'╔════════════════════════════════════════════════════════╗',
				'║                  AADARSHA UPADHYAYA                    ║',
				'╚════════════════════════════════════════════════════════╝',
				'',
				`  ${personalInfo.title}`,
				'',
				`  ${personalInfo.tagline}`,
				'',
				`  ${personalInfo.bio}`,
				'',
				`  📍 ${personalInfo.location}`,
				''
			]
		},

		experience: {
			description: 'View work experience',
			execute: () => {
				const output = [
					'╔════════════════════════════════════════════════════════╗',
					'║                   WORK EXPERIENCE                      ║',
					'╚════════════════════════════════════════════════════════╝',
					''
				];

				workExperience.forEach((job, index) => {
					// Job title and company
					output.push(`  ${job.position}`);
					output.push(`  @ ${job.company} · ${job.type}`);
					output.push('');

					// Duration and location
					output.push(`  📅 ${job.duration}`);
					output.push(`  📍 ${job.location}`);
					output.push('');

					// Description with word wrapping
					const words = job.description.split(' ');
					let line = '  ';
					words.forEach((word) => {
						if ((line + word).length > 58) {
							output.push(line);
							line = '  ' + word + ' ';
						} else {
							line += word + ' ';
						}
					});
					if (line.trim().length > 0) {
						output.push(line.trim());
					}

					// Skills section
					if (job.skills.length > 0) {
						output.push('');
						output.push('  Tech Stack:');

						// Group skills into rows of 2 for better readability
						for (let i = 0; i < job.skills.length; i += 2) {
							const skill1 = job.skills[i];
							const skill2 = job.skills[i + 1];
							if (skill2) {
								output.push(`    • ${skill1.padEnd(30)} • ${skill2}`);
							} else {
								output.push(`    • ${skill1}`);
							}
						}
					}

					// Separator between jobs
					if (index < workExperience.length - 1) {
						output.push('');
						output.push('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
						output.push('');
					}
				});

				output.push('');
				return output;
			}
		},

		skills: {
			description: 'View technical skills',
			execute: () => {
				const output = [
					'╔════════════════════════════════════════════════════════╗',
					'║                   TECHNICAL SKILLS                     ║',
					'╚════════════════════════════════════════════════════════╝',
					''
				];

				Object.entries(skills).forEach(([category, skillList]) => {
					output.push(`  ${category}:`);
					skillList.forEach((skill) => {
						output.push(`    → ${skill}`);
					});
					output.push('');
				});

				return output;
			}
		},

		education: {
			description: 'View educational background',
			execute: () => {
				const output = [
					'╔════════════════════════════════════════════════════════╗',
					'║                      EDUCATION                         ║',
					'╚════════════════════════════════════════════════════════╝',
					''
				];

				education.forEach((edu) => {
					output.push(`  ${edu.institution}`);
					output.push(`  ${edu.degree}, ${edu.field}`);
					output.push(`  ${edu.duration}`);
					output.push('');
				});

				return output;
			}
		},

		contact: {
			description: 'Get contact information',
			execute: () => [
				'╔════════════════════════════════════════════════════════╗',
				'║                   CONTACT INFO                         ║',
				'╚════════════════════════════════════════════════════════╝',
				'',
				`  Email:    ${personalInfo.email}`,
				`  GitHub:   ${personalInfo.github}`,
				`  LinkedIn: ${personalInfo.linkedin}`,
				''
			]
		},

		projects: {
			description: 'View projects',
			execute: () => {
				if (projects.length === 0) {
					return [
						'╔════════════════════════════════════════════════════════╗',
						'║                      PROJECTS                          ║',
						'╚════════════════════════════════════════════════════════╝',
						'',
						'  Coming soon...',
						'',
						'  Stay tuned for exciting projects!',
						''
					];
				}

				const output = [
					'╔════════════════════════════════════════════════════════╗',
					'║                      PROJECTS                          ║',
					'╚════════════════════════════════════════════════════════╝',
					''
				];

				projects.forEach((project, index) => {
					output.push(`  [${index + 1}] ${project.title}`);
					output.push(`      ${project.description}`);
					output.push(`      Tech: ${project.techStack}`);
					if (project.url) {
						output.push(`      URL: ${project.url}`);
					}
					output.push('');
				});

				return output;
			}
		},

		blog: {
			description: 'Visit the blog',
			execute: () => {
				// Redirect to blog page
				if (typeof window !== 'undefined') {
					window.location.href = '/blog';
				}
				return [
					'',
					'  Redirecting to blog...',
					'',
					'  Or visit: /blog',
					''
				];
			}
		},

		clear: {
			description: 'Clear terminal',
			execute: () => {
				clearHistory();
				return [];
			}
		}
	};
};
