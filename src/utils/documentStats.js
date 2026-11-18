import { DOCUMENT_CATEGORIES } from '../constants/documents';

const uploadTime = (document) => {
  const time = new Date(document.uploadedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const findCategory = (categories, value) => {
  let category = categories.find((entry) => entry.value === value);
  if (!category) {
    category = {
      value: value || 'uncategorised',
      label: value || 'Uncategorised',
      description: '',
      tone: 'slate',
      count: 0,
      pages: 0,
      chunks: 0,
      completed: 0,
      failed: 0,
    };
    categories.push(category);
  }
  return category;
};

/**
 * Aggregates real document records returned by GET /api/documents.
 * No values are invented: every figure is a sum or count over the API payload.
 */
export const computeDocumentStats = (documents = []) => {
  const categories = DOCUMENT_CATEGORIES.map((category) => ({
    ...category,
    count: 0,
    pages: 0,
    chunks: 0,
    completed: 0,
    failed: 0,
  }));

  const totals = {
    totalDocuments: documents.length,
    totalPages: 0,
    totalChunks: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    pending: 0,
  };

  for (const document of documents) {
    totals.totalPages += Number(document.totalPages) || 0;
    totals.totalChunks += Number(document.totalChunks) || 0;

    const status = document.processingStatus;
    if (status === 'completed') totals.completed += 1;
    else if (status === 'failed') totals.failed += 1;
    else if (status === 'processing') totals.processing += 1;
    else totals.pending += 1;

    const category = findCategory(categories, document.category);
    category.count += 1;
    category.pages += Number(document.totalPages) || 0;
    category.chunks += Number(document.totalChunks) || 0;
    if (status === 'completed') category.completed += 1;
    if (status === 'failed') category.failed += 1;
  }

  const recent = [...documents]
    .sort((a, b) => uploadTime(b) - uploadTime(a))
    .slice(0, 5);

  return {
    ...totals,
    unprocessed: totals.pending + totals.processing,
    completionRate:
      totals.totalDocuments === 0
        ? 0
        : Math.round((totals.completed / totals.totalDocuments) * 100),
    activeCategories: categories.filter((category) => category.count > 0).length,
    categories,
    recent,
  };
};
