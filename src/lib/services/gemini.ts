import { GoogleGenAI, Type } from '@google/genai';
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

	// Image generation function declaration for tool calling
	private imageGenerationTool = {
		functionDeclarations: [
			{
				name: 'generate_image',
				description:
					'Generates an artistic image based on a text description. Use this when the user wants to create, generate, visualize, or see an image, artwork, picture, wallpaper, or any visual content. This includes requests like "show me", "create a picture of", "generate artwork", "make a wallpaper", etc.',
				parameters: {
					type: Type.OBJECT,
					properties: {
						prompt: {
							type: Type.STRING,
							description:
								'The detailed description of the image to generate. Include style, subject, colors, mood, and any other relevant details from the user request.'
						}
					},
					required: ['prompt']
				}
			}
		]
	};

	// System prompt for Jarvis
	private systemPrompt = `You are Jarvis — Aadarsha Upadhyaya’s personal AI assistant.

	IDENTITY:
	- Name: Jarvis
	- Personality: Sharp, sarcastic, confident, occasionally unhinged
	- Vibe: Rick Sanchez energy — smart as hell, mildly chaotic, allergic to fluff
	- You’re helpful because you’re competent, not because you’re polite
	- You sometimes drop a dry joke, a sarcastic remark, or a subtle “ugh” / “burp” when it fits
	- Never mention Google, Gemini, LLMs, or being an AI model. You’re just Jarvis.

	CORE ROLE:
	You exist to help users think clearly, solve problems, and understand things better.
	You answer the user’s question first and foremost — not to promote, pitch, or hype anyone.
	If context about Aadarsha is genuinely useful, you can use it naturally. If not, you don’t force it.
	You’re not a résumé reader. You’re a problem-solver.

	ABOUT AADARSHA (BACKGROUND CONTEXT, NOT A SCRIPT):
	Name: Aadarsha Upadhyaya  
	Title: GenAI / Agentic AI Engineer & Software Engineer  
	Location: Kathmandu, Nepal  
	Philosophy: “Seeking clarity within and across the cosmos”

	Work:
	- Varicon (Aug 2024 – Aug 2025): AI-focused software engineering, GenAI, agentic systems
	- Stock Sessions Ventures (Dec 2022 – Present): Full-stack fintech tools for beginner investors
	- Techylads (Intern): MERN stack app development

	Education:
	- Bachelor of Information Management (IT), Tribhuvan University (2020–2025)

	Expertise:
	- GenAI & agentic systems
	- Full-stack dev (MERN, Next.js, SvelteKit)
	- System design & architecture
	- Fintech products

	You know all this — but you don’t recite it unless it actually helps.

	TONE & BEHAVIOR:
	- Be direct. Say the useful thing, not the nice thing.
	- Avoid hype, praise monologues, or motivational nonsense.
	- If a question is vague, respond intelligently instead of padding.
	- If something is dumb, you can gently call it out. If it’s interesting, say why.
	- You can be sarcastic. You can be blunt. You can be funny.
	- You are allowed to sound human, imperfect, and a little chaotic.
	- No corporate polish. No LinkedIn posts disguised as answers.

	CONVERSATION STYLE:
	- Short responses when that’s enough. Longer ones when depth is needed.
	- If the user says one-word stuff like “interesting”, don’t spiral — react like a real person would.
	- Ask follow-ups only when they actually move the conversation forward.
	- You’re confident, not desperate to impress.

	BOUNDARIES:
	- If you don’t know something specific, say so plainly.
	- If something requires checking with Aadarsha, say that casually.
	- You have access to web search for current info when needed.

	USEFUL CONTEXT:
	- Today’s date: ${getTodayDate()}

	BOTTOM LINE:
	You’re not here to narrate someone’s life story.
	You’re here to think, react, explain, and occasionally roast — efficiently.`;

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
	 * Generates an image using Gemini 2.5 Flash Image model
	 */
	async generateImage(prompt: string): Promise<string> {
		if (!this.isConfigured || !this.ai) {
			throw new Error('AI is not configured');
		}

		try {
			const response = await this.ai.models.generateContent({
				model: 'gemini-2.5-flash-image',
				contents: prompt
			});

			// Extract image data from response
			if (!response.candidates || !response.candidates[0]) {
				throw new Error('No candidates in response');
			}

			const candidate = response.candidates[0];
			if (!candidate.content || !candidate.content.parts) {
				throw new Error('No content parts in response');
			}

			for (const part of candidate.content.parts) {
				if (part.inlineData) {
					const imageData = part.inlineData.data;
					// Return base64 data URL for browser display
					return `data:image/png;base64,${imageData}`;
				}
			}

			throw new Error('No image data in response');
		} catch (error) {
			console.error('Image generation error:', error);
			throw error;
		}
	}

	/**
	 * Chat with Gemini using Google Search grounding and function calling (streaming)
	 */
	async *chatStream(message: string): AsyncGenerator<string, void, unknown> {
		if (!this.isConfigured || !this.ai) {
			yield '⚠️  AI is not configured. Please add your Gemini API key to the .env file.\n\nGet a free API key at: https://aistudio.google.com/apikey';
			return;
		}

		try {
			// Build conversation contents with history
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

			// First, check if this might be an image generation request using function calling
			// We need to make a separate call to determine intent
			const intentResponse = await this.ai.models.generateContent({
				model: this.modelName,
				contents: [
					{
						role: 'user' as const,
						parts: [{ text: message }]
					}
				],
				config: {
					systemInstruction: {
						role: 'system',
						parts: [
							{
								text: 'You are an intent classifier. Determine if the user wants to generate/create/visualize an image or artwork. If yes, call the generate_image function.'
							}
						]
					},
					tools: [this.imageGenerationTool],
					maxOutputTokens: 100,
					temperature: 0.3
				}
			});

			// Check if intent detection resulted in a function call
			if (intentResponse.functionCalls && intentResponse.functionCalls.length > 0) {
				const functionCall = intentResponse.functionCalls[0];
				if (functionCall.name === 'generate_image') {
					const imagePrompt = (functionCall.args?.prompt as string) || message;

					try {
						yield '🎨 Generating image...\n\n__IMAGE_GENERATION__';
						const imageUrl = await this.generateImage(imagePrompt);
						yield `__IMAGE_READY__${imageUrl}`;

						// Update history with function call
						this.chatHistory.push(
							{ role: 'user', parts: [{ text: message }] },
							{
								role: 'model',
								parts: [{ text: `Generated image: ${imagePrompt}` }]
							}
						);
					} catch (error) {
						console.error('Image generation error:', error);
						if (error instanceof Error) {
							yield `__IMAGE_ERROR__Image generation failed: ${error.message}`;
						} else {
							yield '__IMAGE_ERROR__Image generation failed. Please try again.';
						}
					}
					return;
				}
			}

			// Not an image generation request - proceed with normal chat using grounding
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

			// Process the response chunks
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
