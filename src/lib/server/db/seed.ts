import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { createHash } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL || 'local.db';
const client = new Database(DATABASE_URL);
const db = drizzle(client, { schema });

function hashPassword(password: string): string {
	return createHash('sha256').update(password).digest('hex');
}

async function seed() {
	console.log('🌱 Seeding database...');

	// Clear existing data
	console.log('Clearing existing data...');
	await db.delete(schema.adminSessions);
	await db.delete(schema.adminUsers);
	await db.delete(schema.blogPostTags);
	await db.delete(schema.blogTags);
	await db.delete(schema.blogPosts);
	await db.delete(schema.experienceSkills);
	await db.delete(schema.workExperience);
	await db.delete(schema.education);
	await db.delete(schema.skills);
	await db.delete(schema.projects);
	await db.delete(schema.personalInfo);

	// Insert admin user
	console.log('Creating admin user...');
	await db.insert(schema.adminUsers).values({
		username: 'admin',
		passwordHash: hashPassword('admin123') // CHANGE THIS PASSWORD!
	});
	console.log('✅ Admin user created (username: admin, password: admin123)');
	console.log('⚠️  IMPORTANT: Change your password after first login!');

	// Insert personal info
	console.log('Inserting personal info...');
	await db.insert(schema.personalInfo).values({
		name: 'Aadarsha Upadhyaya',
		title: 'GenAI - Agentic AI Engineer | Software Engineer',
		tagline: 'Trying to make sense of things!',
		bio: 'Seeking clarity within and across the cosmos.',
		location: 'Kathmandu, Nepal',
		email: 'adarskafle002@gmail.com',
		github: 'https://github.com/adars124',
		linkedin: 'https://www.linkedin.com/in/adars124/'
	});

	// Insert work experience
	console.log('Inserting work experience...');
	const variconExp = await db
		.insert(schema.workExperience)
		.values({
			company: 'Varicon',
			position: 'Software Engineer (AI) + Agentic AI Engineer',
			type: 'Full-time',
			duration: 'Aug 2024 - Aug 2025 · 1 yr 1 mo',
			location: 'Australia · Hybrid',
			description:
				'Development of fast, scalable, and maintainable software with state-of-the-art technologies like chatbots and business intelligence tools/softwares.',
			order: 0
		})
		.returning();

	// Insert skills for Varicon
	const variconSkills = [
		'Python Django',
		'React.js',
		'Google ADK',
		'LangChain',
		'Langgraph',
		'Next.js',
		'Amazon Web Services (AWS)'
	];

	for (const skill of variconSkills) {
		await db.insert(schema.experienceSkills).values({
			experienceId: variconExp[0].id,
			skill
		});
	}

	await db.insert(schema.workExperience).values({
		company: 'Stock Sessions Ventures',
		position: 'Full Stack Developer',
		type: 'Self-employed',
		duration: 'Dec 2022 - Present · 3 yrs 1 mo',
		location: 'Kathmandu, Nepal · Remote',
		description:
			'Developing next-gen fintech tools to simplify the stock market journey for beginners. Involved in everything from crafting seamless user interfaces to building robust back-end systems, shaping interactive experiences that help new investors learn and make smarter moves.',
		order: 1
	});

	await db.insert(schema.workExperience).values({
		company: 'Techylads',
		position: 'Intern',
		type: 'Part-time',
		duration: 'Mar 2023 - Jul 2023 · 5 mos',
		location: 'Kathmandu, Nepal · Remote',
		description:
			'Developed a movie ticket booking system (web application) using MERN Stack for a US-based company with payment gateway integration, database transactions, synchronization.',
		order: 2
	});

	// Insert education
	console.log('Inserting education...');
	await db.insert(schema.education).values({
		institution: 'Tribhuvan University',
		degree: 'Bachelors of Information Management',
		field: 'Information Technology',
		duration: 'Feb 2020 - Mar 2025',
		order: 0
	});

	// Insert skills
	console.log('Inserting skills...');
	const skillsData = [
		{ category: 'AI & Machine Learning', skill: 'Large Language Models (LLM)', order: 0 },
		{ category: 'AI & Machine Learning', skill: 'Agentic AI', order: 1 },
		{ category: 'AI & Machine Learning', skill: 'LangChain', order: 2 },
		{ category: 'AI & Machine Learning', skill: 'Langgraph', order: 3 },
		{
			category: 'AI & Machine Learning',
			skill: 'Retrieval-Augmented Generation (RAG)',
			order: 4
		},
		{ category: 'AI & Machine Learning', skill: 'Google ADK', order: 5 },
		{ category: 'Frontend', skill: 'React.js', order: 0 },
		{ category: 'Frontend', skill: 'Next.js', order: 1 },
		{ category: 'Frontend', skill: 'SvelteKit', order: 2 },
		{ category: 'Frontend', skill: 'TypeScript', order: 3 },
		{ category: 'Frontend', skill: 'Tailwind CSS', order: 4 },
		{ category: 'Backend', skill: 'Python Django', order: 0 },
		{ category: 'Backend', skill: 'Node.js', order: 1 },
		{ category: 'Backend', skill: 'PostgreSQL', order: 2 },
		{ category: 'Backend', skill: 'Drizzle ORM', order: 3 },
		{ category: 'Cloud & DevOps', skill: 'Amazon Web Services (AWS)', order: 0 },
		{ category: 'Cloud & DevOps', skill: 'Docker', order: 1 },
		{ category: 'Cloud & DevOps', skill: 'Git', order: 2 }
	];

	for (const skillData of skillsData) {
		await db.insert(schema.skills).values(skillData);
	}

	// Insert blog posts
	console.log('Inserting blog posts...');
	const post1 = await db
		.insert(schema.blogPosts)
		.values({
			slug: 'getting-started-with-agentic-ai',
			title: 'Getting Started with Agentic AI',
			description:
				'An introduction to building intelligent agents that can reason, plan, and execute complex tasks autonomously.',
			content: `<h2>What is Agentic AI?</h2>
<p>Agentic AI represents a new paradigm in artificial intelligence where systems can autonomously pursue complex goals, make decisions, and take actions with minimal human intervention.</p>

<h2>Key Characteristics</h2>
<ul>
<li><strong>Autonomy</strong> - Agents can operate independently</li>
<li><strong>Reasoning</strong> - Ability to think through problems logically</li>
<li><strong>Planning</strong> - Creating multi-step strategies to achieve goals</li>
<li><strong>Tool Use</strong> - Leveraging external tools and APIs</li>
</ul>

<h2>Building Your First Agent</h2>
<p>The foundation of agentic AI lies in combining large language models with structured frameworks like LangChain and LangGraph.</p>

<pre><code>from langchain.agents import AgentExecutor
from langchain.tools import Tool

# Define your tools
tools = [
    Tool(
        name="Calculator",
        func=calculate,
        description="Useful for mathematical operations"
    )
]

# Create the agent
agent = AgentExecutor(tools=tools, llm=llm)
</code></pre>

<h2>Real-World Applications</h2>
<p>Agentic AI is transforming industries through:</p>
<ul>
<li>Customer support automation</li>
<li>Data analysis and insights</li>
<li>Content generation and curation</li>
<li>Process automation</li>
</ul>

<h2>Getting Started</h2>
<p>Start by understanding the fundamentals of LLMs, then explore frameworks like LangChain and AutoGPT to build your first agent.</p>`,
			coverImage: null,
			published: true,
			publishedAt: new Date('2024-12-01'),
			readingTime: 5
		})
		.returning();

	const post2 = await db
		.insert(schema.blogPosts)
		.values({
			slug: 'building-scalable-web-apps-with-sveltekit',
			title: 'Building Scalable Web Apps with SvelteKit',
			description:
				'Learn how to build modern, performant web applications using SvelteKit and best practices for scaling.',
			content: `<h2>Why SvelteKit?</h2>
<p>SvelteKit is a modern web framework that offers the best developer experience while delivering exceptional performance.</p>

<h2>Key Benefits</h2>
<ul>
<li><strong>Speed</strong> - Blazing fast runtime with minimal overhead</li>
<li><strong>Simplicity</strong> - Write less code with Svelte's reactive syntax</li>
<li><strong>Flexibility</strong> - SSR, SSG, or CSR - you choose</li>
<li><strong>TypeScript</strong> - First-class TypeScript support</li>
</ul>

<h2>Project Structure</h2>
<p>A well-organized SvelteKit project follows this structure:</p>

<pre><code>src/
  ├── routes/           # File-based routing
  ├── lib/
  │   ├── components/   # Reusable components
  │   ├── server/       # Server-only code
  │   └── utils/        # Shared utilities
  └── app.html          # HTML template
</code></pre>

<h2>Best Practices</h2>
<ol>
<li><strong>Use Server Load Functions</strong> - Keep sensitive data server-side</li>
<li><strong>Optimize Images</strong> - Use responsive images and lazy loading</li>
<li><strong>Implement Caching</strong> - Leverage SvelteKit's built-in caching</li>
<li><strong>Code Splitting</strong> - Let SvelteKit handle it automatically</li>
</ol>

<h2>Deployment</h2>
<p>SvelteKit adapters make deployment simple. Choose from Vercel, Netlify, or any Node.js host.</p>`,
			coverImage: null,
			published: true,
			publishedAt: new Date('2024-12-15'),
			readingTime: 7
		})
		.returning();

	// Insert blog tags
	console.log('Inserting blog tags...');
	const aiTag = await db.insert(schema.blogTags).values({ name: 'AI', slug: 'ai' }).returning();

	const agenticTag = await db
		.insert(schema.blogTags)
		.values({ name: 'Agentic AI', slug: 'agentic-ai' })
		.returning();

	const webDevTag = await db
		.insert(schema.blogTags)
		.values({ name: 'Web Development', slug: 'web-development' })
		.returning();

	const svelteTag = await db
		.insert(schema.blogTags)
		.values({ name: 'SvelteKit', slug: 'sveltekit' })
		.returning();

	const llmTag = await db.insert(schema.blogTags).values({ name: 'LLM', slug: 'llm' }).returning();

	// Associate tags with posts
	console.log('Associating tags with posts...');
	await db.insert(schema.blogPostTags).values([
		{ postId: post1[0].id, tagId: aiTag[0].id },
		{ postId: post1[0].id, tagId: agenticTag[0].id },
		{ postId: post1[0].id, tagId: llmTag[0].id },
		{ postId: post2[0].id, tagId: webDevTag[0].id },
		{ postId: post2[0].id, tagId: svelteTag[0].id }
	]);

	console.log('✅ Database seeded successfully!');
	client.close();
}

seed().catch((error) => {
	console.error('❌ Error seeding database:', error);
	process.exit(1);
});
