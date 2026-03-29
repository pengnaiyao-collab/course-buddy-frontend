import apiClient from './client';

/**
 * Generate AI content (review outline / key points / exercises)
 * @param {{ type: string, topic: string, fileIds?: string[], language?: string }} data
 */
export const generateContent = (data) => {
  const type = String(data.type || '').toLowerCase();
  const endpointByType = {
    review_outline: '/v1/ai/generate/outline',
    key_points: '/v1/ai/generate/exam-points',
    exercises: '/v1/ai/generate/questions',
    report_framework: '/v1/ai/generate/report-framework',
    core_points: '/v1/ai/generate/core-points',
    data_processing: '/v1/ai/generate/data-processing',
    question_explanation: '/v1/ai/generate/explanation',
    mnemonic: '/v1/ai/generate/mnemonic',
    summary: '/v1/ai/generate/breakdown',
    learning_path: '/v1/ai/generate/learning-path',
  };
  const endpoint = endpointByType[type] || '/v1/ai/generate/breakdown';
  return apiClient.post(endpoint, {
    contentType: 'AUTO',
    subject: data.topic,
    courseId: Number(localStorage.getItem('selectedCourseId') || 1),
    requirements: data.requirements,
    difficulty: data.difficulty,
    count: data.count,
  });
};

/**
 * Stream AI content generation.
 * Returns a fetch Response so the caller can consume the ReadableStream.
 */
export const streamGenerate = async (data) => {
  return Promise.reject(new Error('stream not supported'));
};

/**
 * Stream AI chat with SSE (Server-Sent Events)
 * Processes the stream and calls onToken for each token received
 * @param {ChatRequestDTO} data - Chat message request
 * @param {Function} onToken - Callback for each token: (token: string) => void
 * @param {Function} onDone - Callback when stream completes: (payload: object) => void
 * @param {Function} onError - Callback on error: (error: Error) => void
 */
export const chatStream = async (data, onToken, onDone, onError) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch('/api/v1/ai/chat/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        // Handle SSE data format: "data: ..."
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          // Check if it's the done event
          if (line.includes('event: done')) {
            continue; // Skip this line, done event follows in next data line
          }

          try {
            // Try to parse as JSON for done event payload
            const parsed = JSON.parse(data);
            if (onDone && typeof onDone === 'function') {
              onDone(parsed);
            }
          } catch {
            // Regular token, not JSON
            if (onToken && typeof onToken === 'function') {
              onToken(data);
            }
          }
        } else if (line.startsWith('event: ')) {
          // SSE event name (e.g., "event: done")
          const eventName = line.slice(7).trim();
          if (eventName === 'done' && onDone) {
            // Next line will be the done event data
            continue;
          }
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.trim()) {
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim();
        try {
          const parsed = JSON.parse(data);
          if (onDone && typeof onDone === 'function') {
            onDone(parsed);
          }
        } catch {
          if (onToken && typeof onToken === 'function') {
            onToken(data);
          }
        }
      }
    }
  } catch (error) {
    if (onError && typeof onError === 'function') {
      onError(error);
    } else {
      throw error;
    }
  }
};

/**
 * Get AI generation history
 */
export const getGenerationHistory = (params) =>
  apiClient.get('/v1/ai/generate', { params });

/**
 * Delete a generation history entry
 */
export const deleteGenerationHistory = (id) =>
  Promise.resolve({ data: { id } });

/**
 * Get AI usage statistics for the current user
 */
export const getUsageStats = () => apiClient.get('/v1/ai/usage-stats');

/**
 * List prompt templates
 */
export const listPromptTemplates = (params) =>
  Promise.resolve({ data: [] });

/**
 * Create a custom prompt template
 */
export const createPromptTemplate = (data) =>
  Promise.resolve({ data });

/**
 * Delete a prompt template
 */
export const deletePromptTemplate = (id) =>
  Promise.resolve({ data: { id } });
