import { db } from '../db';
import * as schema from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

interface CreateBlogPostInput {
	slug: string;
	title: string;
	description: string;
	content: string;
	coverImage?: string;
	published?: boolean;
	publishedAt?: Date;
	tags?: string[];
}

interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
	id: number;
}

/**
 * Calculate estimated reading time based on content
 * Average reading speed: 200 words per minute
 */
function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const wordCount = content.trim().split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get all published blog posts
 */
export async function getPublishedPosts() {
	const posts = await db
		.select()
		.from(schema.blogPosts)
		.where(eq(schema.blogPosts.published, true))
		.orderBy(desc(schema.blogPosts.publishedAt));

	return await Promise.all(posts.map((post) => enrichPostWithTags(post)));
}

/**
 * Get all blog posts (including unpublished)
 */
export async function getAllPosts() {
	const posts = await db
		.select()
		.from(schema.blogPosts)
		.orderBy(desc(schema.blogPosts.createdAt));

	return await Promise.all(posts.map((post) => enrichPostWithTags(post)));
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string) {
	const posts = await db
		.select()
		.from(schema.blogPosts)
		.where(eq(schema.blogPosts.slug, slug))
		.limit(1);

	if (posts.length === 0) return null;

	return await enrichPostWithTags(posts[0]);
}

/**
 * Get a single blog post by ID
 */
export async function getPostById(id: number) {
	const posts = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id)).limit(1);

	if (posts.length === 0) return null;

	return await enrichPostWithTags(posts[0]);
}

/**
 * Get blog posts by tag
 */
export async function getPostsByTag(tagSlug: string) {
	const tag = await db
		.select()
		.from(schema.blogTags)
		.where(eq(schema.blogTags.slug, tagSlug))
		.limit(1);

	if (tag.length === 0) return [];

	const postTags = await db
		.select({ postId: schema.blogPostTags.postId })
		.from(schema.blogPostTags)
		.where(eq(schema.blogPostTags.tagId, tag[0].id));

	const postIds = postTags.map((pt) => pt.postId);

	if (postIds.length === 0) return [];

	const posts = await db
		.select()
		.from(schema.blogPosts)
		.where(
			and(
				eq(schema.blogPosts.published, true),
				sql`${schema.blogPosts.id} IN ${postIds}`
			)
		)
		.orderBy(desc(schema.blogPosts.publishedAt));

	return await Promise.all(posts.map((post) => enrichPostWithTags(post)));
}

/**
 * Create a new blog post
 */
export async function createPost(input: CreateBlogPostInput) {
	const readingTime = calculateReadingTime(input.content);

	const [post] = await db
		.insert(schema.blogPosts)
		.values({
			slug: input.slug,
			title: input.title,
			description: input.description,
			content: input.content,
			coverImage: input.coverImage,
			published: input.published ?? false,
			publishedAt: input.publishedAt ?? (input.published ? new Date() : null),
			readingTime
		})
		.returning();

	// Add tags if provided
	if (input.tags && input.tags.length > 0) {
		await addTagsToPost(post.id, input.tags);
	}

	return await getPostById(post.id);
}

/**
 * Update an existing blog post
 */
export async function updatePost(input: UpdateBlogPostInput) {
	const updates: any = {
		...input,
		updatedAt: new Date()
	};

	// Recalculate reading time if content changed
	if (input.content) {
		updates.readingTime = calculateReadingTime(input.content);
	}

	// Set published date if publishing for the first time
	if (input.published && !updates.publishedAt) {
		updates.publishedAt = new Date();
	}

	delete updates.id;
	delete updates.tags;

	await db.update(schema.blogPosts).set(updates).where(eq(schema.blogPosts.id, input.id));

	// Update tags if provided
	if (input.tags) {
		// Remove existing tags
		await db.delete(schema.blogPostTags).where(eq(schema.blogPostTags.postId, input.id));
		// Add new tags
		await addTagsToPost(input.id, input.tags);
	}

	return await getPostById(input.id);
}

/**
 * Delete a blog post
 */
export async function deletePost(id: number) {
	await db.delete(schema.blogPosts).where(eq(schema.blogPosts.id, id));
}

/**
 * Increment view count for a blog post
 */
export async function incrementViews(id: number) {
	await db
		.update(schema.blogPosts)
		.set({ views: sql`${schema.blogPosts.views} + 1` })
		.where(eq(schema.blogPosts.id, id));
}

/**
 * Get all tags
 */
export async function getAllTags() {
	return await db.select().from(schema.blogTags);
}

/**
 * Get or create a tag
 */
async function getOrCreateTag(name: string) {
	const slug = name.toLowerCase().replace(/\s+/g, '-');

	const existing = await db.select().from(schema.blogTags).where(eq(schema.blogTags.slug, slug));

	if (existing.length > 0) return existing[0];

	const [tag] = await db.insert(schema.blogTags).values({ name, slug }).returning();

	return tag;
}

/**
 * Add tags to a blog post
 */
async function addTagsToPost(postId: number, tagNames: string[]) {
	for (const tagName of tagNames) {
		const tag = await getOrCreateTag(tagName);
		await db.insert(schema.blogPostTags).values({ postId, tagId: tag.id });
	}
}

/**
 * Enrich a blog post with its tags
 */
async function enrichPostWithTags(post: any) {
	const postTags = await db
		.select({
			id: schema.blogTags.id,
			name: schema.blogTags.name,
			slug: schema.blogTags.slug
		})
		.from(schema.blogPostTags)
		.innerJoin(schema.blogTags, eq(schema.blogPostTags.tagId, schema.blogTags.id))
		.where(eq(schema.blogPostTags.postId, post.id));

	return {
		...post,
		tags: postTags
	};
}
