// OpenRouter API integration for AI blog generation
import type { Movie, MovieBlog } from '../types';

export class OpenRouterService {
  constructor(
    private apiKey: string,
    private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions'
  ) {}

  async generateBlogPost(movie: Movie): Promise<{
    title: string;
    content: string;
    summary: string;
    keywords: string;
  }> {
    const characters = movie.characters ? JSON.parse(movie.characters) : [];
    const ottPlatforms = movie.ott_availability ? JSON.parse(movie.ott_availability) : [];

    const prompt = this.createBlogPrompt(movie, characters, ottPlatforms);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://doraemon-stream.pages.dev',
          'X-Title': 'Doraemon Movie Stream Blog Generator'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional anime movie blogger who writes engaging, SEO-optimized blog posts about Doraemon movies. 
              Write in a fun, enthusiastic tone that appeals to both children and adults. 
              Include proper HTML formatting with headings, paragraphs, and lists.
              Focus on plot, characters, animation quality, and emotional themes.
              Always maintain a positive, family-friendly tone.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No content generated from OpenRouter API');
      }

      return this.parseBlogResponse(generatedText, movie);

    } catch (error) {
      console.error('OpenRouter API error:', error);
      // Fallback to template-based blog generation
      return this.generateFallbackBlog(movie, characters, ottPlatforms);
    }
  }

  private createBlogPrompt(movie: Movie, characters: string[], ottPlatforms: string[]): string {
    return `Write a comprehensive, engaging blog post about the Doraemon movie "${movie.title}" (${movie.year}).

Movie Details:
- Title: ${movie.title}
- Year: ${movie.year}
- Description: ${movie.description || 'A wonderful Doraemon adventure'}
- Main Characters: ${characters.join(', ')}
- Available on: ${ottPlatforms.join(', ') || 'Various platforms'}
- Duration: ${movie.duration_minutes ? `${movie.duration_minutes} minutes` : 'Feature length'}
- Rating: ${movie.rating || 'Highly rated'}

Please structure the blog post as follows:
1. Start with "TITLE: [engaging blog title]"
2. Then "CONTENT: [full HTML blog content with proper tags]"
3. Then "SUMMARY: [2-3 sentence summary for meta description]"
4. Finally "KEYWORDS: [comma-separated SEO keywords]"

The blog should be 800-1200 words, include:
- An engaging introduction
- Plot overview (no major spoilers)
- Character analysis
- Animation and visual quality discussion
- Themes and emotional impact
- Why families should watch it
- Where to watch information

Use HTML tags like <h2>, <h3>, <p>, <ul>, <li> for proper formatting.
Make it SEO-friendly and engaging for both kids and parents.`;
  }

  private parseBlogResponse(response: string, movie: Movie): {
    title: string;
    content: string;
    summary: string;
    keywords: string;
  } {
    const titleMatch = response.match(/TITLE:\s*(.+?)(?=\n|CONTENT:)/s);
    const contentMatch = response.match(/CONTENT:\s*(.+?)(?=\nSUMMARY:|$)/s);
    const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=\nKEYWORDS:|$)/s);
    const keywordsMatch = response.match(/KEYWORDS:\s*(.+?)$/s);

    return {
      title: titleMatch?.[1]?.trim() || `${movie.title}: A Doraemon Adventure Worth Watching`,
      content: contentMatch?.[1]?.trim() || this.generateFallbackContent(movie),
      summary: summaryMatch?.[1]?.trim() || `Discover the magical world of ${movie.title}, a heartwarming Doraemon movie that brings adventure and friendship to life.`,
      keywords: keywordsMatch?.[1]?.trim() || `Doraemon, ${movie.title}, anime movie, Japanese animation, family entertainment`
    };
  }

  private generateFallbackBlog(movie: Movie, characters: string[], ottPlatforms: string[]): {
    title: string;
    content: string;
    summary: string;
    keywords: string;
  } {
    return {
      title: `${movie.title}: A Magical Doraemon Adventure`,
      content: this.generateFallbackContent(movie, characters, ottPlatforms),
      summary: `Experience the wonder of ${movie.title} (${movie.year}), a delightful Doraemon movie filled with adventure, friendship, and the magic that makes this series beloved worldwide.`,
      keywords: `Doraemon, ${movie.title}, anime movie, ${movie.year}, Japanese animation, family movie, adventure, friendship, ${characters.join(', ')}`
    };
  }

  private generateFallbackContent(movie: Movie, characters?: string[], ottPlatforms?: string[]): string {
    const chars = characters || [];
    const platforms = ottPlatforms || [];

    return `
      <h2>Welcome to the World of ${movie.title}</h2>
      <p>Released in ${movie.year}, <strong>${movie.title}</strong> continues the beloved tradition of Doraemon movies that have captivated audiences for decades. This animated masterpiece brings together everything we love about the series: heartwarming friendship, incredible adventures, and the magical gadgets from the 22nd century.</p>

      <h3>The Story</h3>
      <p>${movie.description || 'This Doraemon adventure takes our favorite characters on an unforgettable journey filled with excitement, challenges, and valuable life lessons. As always, the story beautifully balances humor with heartfelt moments that resonate with viewers of all ages.'}</p>

      <h3>Beloved Characters</h3>
      <p>The movie features our favorite characters including ${chars.length > 0 ? chars.join(', ') : 'Doraemon, Nobita, Shizuka, Gian, and Suneo'}. Each character brings their unique personality and strengths to the adventure, creating the perfect team dynamic that fans have come to love.</p>

      <h3>Animation and Visual Excellence</h3>
      <p>The animation quality in ${movie.title} showcases the evolution of the Doraemon franchise. With vibrant colors, fluid character movements, and beautifully crafted environments, every frame is a treat for the eyes. The attention to detail in both character expressions and background art creates an immersive experience.</p>

      <h3>Themes and Messages</h3>
      <p>Like all great Doraemon movies, this film explores important themes such as friendship, courage, personal growth, and the power of believing in yourself. These universal messages make the movie enjoyable for children while providing meaningful content for adult viewers.</p>

      <h3>Why You Should Watch</h3>
      <ul>
        <li>Perfect family entertainment suitable for all ages</li>
        <li>Beautiful animation and engaging storytelling</li>
        <li>Valuable life lessons wrapped in fun adventures</li>
        <li>Continuation of the beloved Doraemon legacy</li>
        ${movie.duration_minutes ? `<li>Runtime of ${movie.duration_minutes} minutes - perfect for movie night</li>` : ''}
      </ul>

      <h3>Where to Watch</h3>
      <p>${platforms.length > 0 
        ? `You can enjoy ${movie.title} on ${platforms.join(', ')}. ` 
        : ''}Check your local streaming platforms for availability, and don't miss this wonderful addition to the Doraemon movie collection.</p>

      <p>Whether you're a longtime fan of the series or discovering Doraemon for the first time, ${movie.title} offers the perfect blend of adventure, humor, and heart that makes it a must-watch for the whole family.</p>
    `;
  }

  async generateDailyBlogUpdates(movies: Movie[]): Promise<{ success: boolean; generated: number; errors: string[] }> {
    const results = {
      success: true,
      generated: 0,
      errors: [] as string[]
    };

    for (const movie of movies) {
      try {
        await this.generateBlogPost(movie);
        results.generated++;
      } catch (error) {
        results.errors.push(`Failed to generate blog for "${movie.title}": ${error}`);
      }
    }

    if (results.errors.length > 0) {
      results.success = false;
    }

    return results;
  }
}