import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const personalInfo = sqliteTable('personal_info', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	title: text('title').notNull(),
	tagline: text('tagline').notNull(),
	bio: text('bio').notNull(),
	location: text('location').notNull(),
	email: text('email').notNull(),
	github: text('github').notNull(),
	linkedin: text('linkedin').notNull()
});

export const workExperience = sqliteTable('work_experience', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	company: text('company').notNull(),
	position: text('position').notNull(),
	type: text('type').notNull(),
	duration: text('duration').notNull(),
	location: text('location').notNull(),
	description: text('description').notNull(),
	order: integer('order').notNull().default(0)
});

export const experienceSkills = sqliteTable('experience_skills', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	experienceId: integer('experience_id')
		.notNull()
		.references(() => workExperience.id, { onDelete: 'cascade' }),
	skill: text('skill').notNull()
});

export const education = sqliteTable('education', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	institution: text('institution').notNull(),
	degree: text('degree').notNull(),
	field: text('field').notNull(),
	duration: text('duration').notNull(),
	order: integer('order').notNull().default(0)
});

export const skills = sqliteTable('skills', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	category: text('category').notNull(),
	skill: text('skill').notNull(),
	order: integer('order').notNull().default(0)
});

export const projects = sqliteTable('projects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	description: text('description').notNull(),
	techStack: text('tech_stack').notNull(),
	url: text('url'),
	order: integer('order').notNull().default(0)
});

export const blogPosts = sqliteTable('blog_posts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	content: text('content').notNull(),
	coverImage: text('cover_image'),
	published: integer('published', { mode: 'boolean' }).notNull().default(false),
	publishedAt: integer('published_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
	readingTime: integer('reading_time').notNull().default(0),
	views: integer('views').notNull().default(0)
});

export const blogTags = sqliteTable('blog_tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique()
});

export const blogPostTags = sqliteTable('blog_post_tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	postId: integer('post_id')
		.notNull()
		.references(() => blogPosts.id, { onDelete: 'cascade' }),
	tagId: integer('tag_id')
		.notNull()
		.references(() => blogTags.id, { onDelete: 'cascade' })
});

export const adminUsers = sqliteTable('admin_users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const adminSessions = sqliteTable('admin_sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => adminUsers.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});
