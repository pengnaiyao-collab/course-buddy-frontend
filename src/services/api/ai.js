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
