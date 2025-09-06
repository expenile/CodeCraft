import { GoogleGenAI } from "@google/genai";

class AIService {
  constructor() {
    this.ai = null;
    this.isInitialized = false;
  }

  initialize() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
      throw new Error('API key is missing or invalid. Please check your .env file.');
    }

    this.ai = new GoogleGenAI({
      apiKey: apiKey
    });
    this.isInitialized = true;
  }

  extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  async generateComponent(prompt, framework) {
    if (!this.isInitialized) {
      this.initialize();
    }

    const enhancedPrompt = `
You are an experienced programmer with expertise in web development and UI/UX design. You create modern, animated, and fully responsive UI components. You are highly skilled in HTML, CSS, Tailwind CSS, Bootstrap, JavaScript, React, Next.js, Vue.js, Angular, and more.

Now, generate a UI component for: ${prompt}
Framework to use: ${framework}

Requirements:
- The code must be clean, well-structured, and easy to understand.
- Optimize for SEO where applicable.
- Focus on creating a modern, animated, and responsive UI design.
- Include high-quality hover effects, shadows, animations, colors, and typography.
- Return ONLY the code, formatted properly in **Markdown fenced code blocks**.
- Do NOT include explanations, text, comments, or anything else besides the code.
- Give the whole code in a single HTML file.
- Ensure the component is accessible and follows best practices.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: enhancedPrompt,
      });

      return this.extractCode(response.text);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate component. Please try again.');
    }
  }
}

export default new AIService();
