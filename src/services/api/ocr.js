const resolveApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  if (base.startsWith('http')) {
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  return base;
};

export const recognizeOcr = async ({
  file,
  language = 'chi_sim+eng',
  courseId,
  category,
  tags,
  autoArchive = true,
}) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  if (courseId) formData.append('courseId', String(courseId));
  if (category) formData.append('category', category);
  if (tags) formData.append('tags', tags);
  formData.append('autoArchive', String(autoArchive));

  return fetch(`${resolveApiBase()}/v1/ocr/recognize`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
};
