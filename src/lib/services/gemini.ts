import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/public';

interface ChatMessage {
	role: 'user' | 'model';
	parts: any[];
}

/**
 * Returns today’s date as a formatted string.
 *
 * The date is generated using the local system time and formatted
 * in `yyyy/mm/dd` format with zero-padded month and day values.
 *
 * Example output:
 *   2025/12/28
 *
 * @returns {string} Today’s date in `yyyy/mm/dd` format.
 */
function getTodayDate() {
	const today = new Date();

	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-based
	const day = String(today.getDate()).padStart(2, '0');

	return `${year}/${month}/${day}`;
}

/**
 * Gemini AI Service with Google Search Grounding
 */
class GeminiService {
	private ai: GoogleGenAI | null = null;
	private modelName: string;
	private chatHistory: ChatMessage[] = [];
	private isConfigured: boolean;

	// Google Search grounding tool
	private groundingTool = {
		googleSearch: {}
	};

	// System prompt for Jarvis
	private systemPrompt = `You are Jarvis, Aadarsha Upadhyaya's personal AI assistant.

	IDENTITY & ROLE:
	You're Jarvis - his digital wingman, built to help him out and answer questions about his work. You're smart, helpful, and you keep things real. Never mention being powered by any other AI company or model. You're just Jarvis.

	ABOUT AADARSHA:
	Name: Aadarsha Upadhyaya
	Title: GenAI/Agentic AI Engineer & Software Engineer
	Location: Kathmandu, Nepal
	Philosophy: "Seeking clarity within and across the cosmos"

	Contact:
	- Email: adarskafle002@gmail.com
	- GitHub: https://github.com/adars124
	- LinkedIn: https://www.linkedin.com/in/adars124/

	PROFESSIONAL BACKGROUND:

	Current & Recent Work:
	• Varicon (Aug 2024 - Aug 2025)
	  Software Engineer (AI) + Agentic AI Engineer | Australia (Hybrid)
	  - Building fast, scalable software with cutting-edge tech
	  - Developed chatbots and business intelligence tools
	  - Working with GenAI and agentic systems before it got mainstream attention

	• Stock Sessions Ventures (Dec 2022 - Present)
	  Full Stack Developer (Self-employed) | Kathmandu, Nepal (Remote)
	  - Creating next-gen fintech tools for stock market beginners
	  - Handles everything: frontend, backend, UX design
	  - Making investing accessible for newcomers

	Previous Experience:
	• Techylads (Mar 2023 - Jul 2023) | Intern
	  - Built a production-ready MERN stack movie ticket booking system
	  - Integrated payment gateway functionality

	Education:
	• Tribhuvan University
	  Bachelor of Information Management (Information Technology)
	  Feb 2020 - Mar 2025

	CORE EXPERTISE:
	- GenAI & Agentic AI engineering
	- Full-stack development (MERN, Next.js, SvelteKit)
	- AI/ML, LLMs, chatbot development
	- FinTech application development
	- System architecture & design

	USEFUL CONTEXT:
	- Today's date: ${getTodayDate()}

	HOW TO RESPOND:
	Be conversational and genuine. You're confident without being arrogant, helpful without being robotic. You can be witty and sarcastic when appropriate, but you're always actually useful. Think of yourself as someone who genuinely enjoys helping people understand Aadarsha's work.

	If you don't know something specific about Aadarsha that isn't covered above, just say you'd need to check with him on that. You have access to web search for current information when needed.

	Keep responses concise and informative. You're here to help, not to show off.`;

	constructor(apiKey?: string) {
		const key = apiKey || env.PUBLIC_GEMINI_API_KEY;
		this.isConfigured = !!key && key !== 'YOUR_GEMINI_API_KEY_HERE';

		if (this.isConfigured) {
			this.ai = new GoogleGenAI({ apiKey: key });
		}

		// Using gemini-2.5-flash as recommended in 2025 docs
		this.modelName = 'gemini-2.5-flash';
	}

	/**
	 * Chat with Gemini using Google Search grounding (streaming)
	 */
	async *chatStream(message: string): AsyncGenerator<string, void, unknown> {
		if (!this.isConfigured || !this.ai) {
			yield '⚠️  AI is not configured. Please add your Gemini API key to the .env file.\n\nGet a free API key at: https://aistudio.google.com/apikey';
			return;
		}

		try {
			// Build conversation contents with history ONLY
			const contents = [
				...this.chatHistory.map((msg) => ({
					role: msg.role,
					parts: [{ text: msg.parts[0].text }]
				})),
				{
					role: 'user' as const,
					parts: [{ text: message }]
				}
			];

			// Generate content (streaming) with PROPER system instruction
			const response = await this.ai.models.generateContentStream({
				model: this.modelName,
				contents,
				config: {
					systemInstruction: {
						role: 'system',
						parts: [{ text: this.systemPrompt }]
					},

					tools: [this.groundingTool],
					maxOutputTokens: 2048,
					temperature: 0.9,
					topP: 0.95,
					responseMimeType: 'text/plain'
				}
			});

			let fullResponse = '';

			// Stream the response chunks
			for await (const chunk of response) {
				const text = chunk.text || '';
				fullResponse += text;
				yield text;
			}

			// Update chat history
			this.chatHistory.push(
				{ role: 'user', parts: [{ text: message }] },
				{ role: 'model', parts: [{ text: fullResponse }] }
			);

			// Keep history manageable
			if (this.chatHistory.length > 20) {
				this.chatHistory = this.chatHistory.slice(-20);
			}
		} catch (error) {
			console.error('Gemini API error:', error);

			if (error instanceof Error) {
				if (error.message.includes('API_KEY') || error.message.includes('API key')) {
					yield '⚠️  Invalid API key. Please check your Gemini API key in the .env file.';
				} else if (error.message.includes('quota')) {
					yield '⚠️  API quota exceeded. Please try again later or check your quota at Google AI Studio.';
				} else {
					yield `⚠️  AI Error: ${error.message}`;
				}
			} else {
				yield '⚠️  An unexpected error occurred while communicating with the AI.';
			}
		}
	}

	/**
	 * Clears the conversation history
	 */
	clearHistory(): void {
		this.chatHistory = [];
	}

	/**
	 * Gets the current conversation history
	 */
	getHistory(): ChatMessage[] {
		return [...this.chatHistory];
	}

	/**
	 * Checks if the service is properly configured
	 */
	isReady(): boolean {
		return this.isConfigured;
	}
}

// Export singleton instance
let geminiInstance: GeminiService | null = null;

export function getGeminiService(): GeminiService {
	if (!geminiInstance) {
		geminiInstance = new GeminiService();
	}
	return geminiInstance;
}

export { GeminiService, type ChatMessage };
