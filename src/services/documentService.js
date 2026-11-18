import api from './api';

const PAGE_SIZE = 100;

// Embedding a PDF can legitimately take several minutes; the instance-wide
// 30s timeout is too short for upload and reprocess requests.
const PROCESSING_TIMEOUT = 15 * 60_000;

const listPage = (page) =>
  api.get('/documents', { params: { page, limit: PAGE_SIZE } });

export const documentService = {
  /**
   * The documents API is paginated and has no aggregate endpoint yet, so the
   * dashboard walks every page and aggregates the returned records locally.
   */
  async getAll() {
    const first = await listPage(1);
    const documents = [...(first.data.documents ?? [])];
    const totalPages = Number(first.data.totalPages) || 1;

    for (let page = 2; page <= totalPages; page += 1) {
      const { data } = await listPage(page);
      documents.push(...(data.documents ?? []));
    }

    return { documents, total: Number(first.data.total) || documents.length };
  },

  upload({ files, titles, categories, academicYears, onUploadProgress }) {
    const form = new FormData();
    files.forEach((file) => form.append('documents', file));
    form.append('title', JSON.stringify(titles));
    form.append('category', JSON.stringify(categories));

    if (academicYears?.some(Boolean)) {
      form.append('academicYear', JSON.stringify(academicYears));
    }

    return api.post('/documents/upload', form, {
      timeout: PROCESSING_TIMEOUT,
      onUploadProgress,
    });
  },

  remove: (documentId) => api.delete(`/documents/${documentId}`),

  getById: (documentId) => api.get(`/documents/${documentId}`),

  reprocess: (documentId) =>
    api.post(`/documents/${documentId}/reprocess`, null, {
      timeout: PROCESSING_TIMEOUT,
    }),
};
