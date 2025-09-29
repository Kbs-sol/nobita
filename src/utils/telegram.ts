// Telegram Bot API integration for movie file streaming
export class TelegramService {
  constructor(private botToken: string) {}

  async getFileInfo(fileId: string): Promise<{
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path?: string;
    file_url?: string;
  } | null> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
      }

      const fileInfo = data.result;
      
      // Generate direct download URL
      if (fileInfo.file_path) {
        fileInfo.file_url = `https://api.telegram.org/file/bot${this.botToken}/${fileInfo.file_path}`;
      }

      return fileInfo;

    } catch (error) {
      console.error('Telegram getFile error:', error);
      return null;
    }
  }

  async streamFile(fileId: string, request: Request): Promise<Response> {
    try {
      const fileInfo = await this.getFileInfo(fileId);
      
      if (!fileInfo?.file_url) {
        return new Response('File not found', { status: 404 });
      }

      // Check if this is a range request
      const range = request.headers.get('Range');
      
      if (range) {
        return this.handleRangeRequest(fileInfo.file_url, range);
      }

      // Regular file streaming
      const response = await fetch(fileInfo.file_url);
      
      if (!response.ok) {
        return new Response('File streaming failed', { status: 502 });
      }

      // Return the file with appropriate headers
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'video/mp4'); // Default to MP4
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Headers', 'Range');
      
      return new Response(response.body, {
        status: response.status,
        headers: headers
      });

    } catch (error) {
      console.error('Telegram streaming error:', error);
      return new Response('Streaming error', { status: 500 });
    }
  }

  private async handleRangeRequest(fileUrl: string, rangeHeader: string): Promise<Response> {
    try {
      // Parse range header (e.g., "bytes=0-1023")
      const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (!rangeMatch) {
        return new Response('Invalid Range header', { status: 400 });
      }

      const start = parseInt(rangeMatch[1]);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : undefined;

      // Create range header for Telegram request
      const telegramHeaders = new Headers();
      if (end !== undefined) {
        telegramHeaders.set('Range', `bytes=${start}-${end}`);
      } else {
        telegramHeaders.set('Range', `bytes=${start}-`);
      }

      const response = await fetch(fileUrl, {
        headers: telegramHeaders
      });

      if (!response.ok) {
        return new Response('Range request failed', { status: 502 });
      }

      // Forward the response with appropriate headers
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'video/mp4');
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Headers', 'Range');
      
      return new Response(response.body, {
        status: 206, // Partial Content
        headers: headers
      });

    } catch (error) {
      console.error('Range request error:', error);
      return new Response('Range request error', { status: 500 });
    }
  }

  async getDirectDownloadUrl(fileId: string): Promise<string | null> {
    const fileInfo = await this.getFileInfo(fileId);
    return fileInfo?.file_url || null;
  }

  // Generate a proxy URL for streaming through our Cloudflare Worker
  generateProxyStreamUrl(fileId: string, baseUrl: string): string {
    return `${baseUrl}/api/stream/${encodeURIComponent(fileId)}`;
  }

  // Generate a direct download URL through our proxy
  generateProxyDownloadUrl(fileId: string, baseUrl: string, filename?: string): string {
    const url = `${baseUrl}/api/download/${encodeURIComponent(fileId)}`;
    return filename ? `${url}?filename=${encodeURIComponent(filename)}` : url;
  }

  // Validate file ID format
  isValidFileId(fileId: string): boolean {
    // Basic Telegram file ID validation
    return /^[A-Za-z0-9_-]+$/.test(fileId) && fileId.length > 10;
  }

  // Get file size without downloading
  async getFileSize(fileId: string): Promise<number | null> {
    const fileInfo = await this.getFileInfo(fileId);
    return fileInfo?.file_size || null;
  }

  // Check if file exists and is accessible
  async validateFile(fileId: string): Promise<{
    valid: boolean;
    size?: number;
    error?: string;
  }> {
    try {
      if (!this.isValidFileId(fileId)) {
        return { valid: false, error: 'Invalid file ID format' };
      }

      const fileInfo = await this.getFileInfo(fileId);
      
      if (!fileInfo) {
        return { valid: false, error: 'File not found or not accessible' };
      }

      return {
        valid: true,
        size: fileInfo.file_size
      };

    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error}`
      };
    }
  }
}