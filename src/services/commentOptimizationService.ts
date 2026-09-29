import {
  BookFeedback,
  BookFeedbackSummary,
  FeedbackCategory,
  OptimizedCategory,
  FeedbackPriority
} from '../types';

// Stopwords list for text normalization
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t',
  'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t',
  'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s',
  'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s',
  'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re',
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'please', 'kindly', 'sir', 'madam', 'book', 'books'
]);

/**
 * Normalizes text into an array of meaningful keyword tokens
 */
export const normalizeCommentTokens = (text: string): string[] => {
  if (!text) return [];
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(' ');
  return words.filter(w => w.length > 2 && !STOP_WORDS.has(w));
};

/**
 * Classifies comment text into optimized category and recommended priority
 */
export const classifyComment = (
  comment: string,
  selectedCategory?: FeedbackCategory
): {
  optimizedCategory: OptimizedCategory;
  priority: FeedbackPriority;
  detectedKeywords: string[];
} => {
  const lower = comment.toLowerCase();
  const detectedKeywords: string[] = [];

  // Edition Request patterns
  const editionPatterns = ['edition', 'latest edition', 'newer edition', 'new edition', 'reprint', 'updated version', 'outdated edition', 'volume'];
  // Availability patterns
  const availabilityPatterns = ['copies', 'availability', 'shortage', 'not enough', 'out of stock', 'borrow', 'unavailable', 'only one copy', 'insufficient'];
  // Content Accuracy patterns
  const accuracyPatterns = ['incorrect', 'error', 'mistake', 'typo', 'wrong', 'inaccurate', 'errata', 'faulty', 'misleading', 'broken code'];
  // Book Quality patterns
  const qualityPatterns = ['damaged', 'torn', 'binding', 'missing pages', 'dirty', 'page cut', 'poor print', 'blurred', 'broken cover', 'spill'];
  // Library Service patterns
  const servicePatterns = ['librarian', 'counter', 'staff', 'desk', 'circulation', 'timing', 'renewal', 'fine', 'policy', 'scanner'];
  // Positive Feedback patterns
  const positivePatterns = ['useful', 'great', 'excellent', 'helpful', 'amazing', 'must read', 'clear', 'comprehensive', 'best', 'good', 'favorite', 'loved', 'informative'];
  // Complaint patterns
  const complaintPatterns = ['terrible', 'worst', 'bad', 'disappointed', 'unusable', 'waste', 'useless', 'horrible'];

  const matchesAny = (patterns: string[]) => {
    return patterns.filter(p => lower.includes(p));
  };

  const matchedEdition = matchesAny(editionPatterns);
  const matchedAvail = matchesAny(availabilityPatterns);
  const matchedAccuracy = matchesAny(accuracyPatterns);
  const matchedQuality = matchesAny(qualityPatterns);
  const matchedService = matchesAny(servicePatterns);
  const matchedPositive = matchesAny(positivePatterns);
  const matchedComplaint = matchesAny(complaintPatterns);

  let optimizedCategory: OptimizedCategory = 'Positive Feedback';
  let priority: FeedbackPriority = 'Normal';

  if (matchedQuality.length > 0) {
    optimizedCategory = 'Book Quality';
    detectedKeywords.push(...matchedQuality);
    // Severely damaged pages or missing pages warrant high priority
    if (lower.includes('missing page') || lower.includes('torn page') || lower.includes('unusable') || lower.includes('severe')) {
      priority = 'High';
    } else {
      priority = 'Medium';
    }
  } else if (matchedAccuracy.length > 0) {
    optimizedCategory = 'Content Accuracy';
    detectedKeywords.push(...matchedAccuracy);
    if (lower.includes('major error') || lower.includes('completely wrong') || lower.includes('critical typo')) {
      priority = 'High';
    } else {
      priority = 'Medium';
    }
  } else if (matchedAvail.length > 0) {
    optimizedCategory = 'Book Availability';
    detectedKeywords.push(...matchedAvail);
    if (lower.includes('urgently') || lower.includes('always out of stock') || lower.includes('exam')) {
      priority = 'High';
    } else {
      priority = 'Medium';
    }
  } else if (matchedEdition.length > 0) {
    optimizedCategory = 'Edition Request';
    detectedKeywords.push(...matchedEdition);
    priority = 'Medium';
  } else if (matchedService.length > 0) {
    optimizedCategory = 'Library Service';
    detectedKeywords.push(...matchedService);
    priority = 'Normal';
  } else if (matchedComplaint.length > 0) {
    optimizedCategory = 'Complaint';
    detectedKeywords.push(...matchedComplaint);
    priority = 'Medium';
  } else if (matchedPositive.length > 0) {
    optimizedCategory = 'Positive Feedback';
    detectedKeywords.push(...matchedPositive);
    priority = 'Normal';
  } else {
    // If user explicitly selected a category, align optimized category
    if (selectedCategory === 'Edition Request') {
      optimizedCategory = 'Edition Request';
      priority = 'Medium';
    } else if (selectedCategory === 'Book Availability') {
      optimizedCategory = 'Book Availability';
      priority = 'Medium';
    } else if (selectedCategory === 'Content Accuracy') {
      optimizedCategory = 'Content Accuracy';
      priority = 'Medium';
    } else if (selectedCategory === 'Book Quality') {
      optimizedCategory = 'Book Quality';
      priority = 'Medium';
    } else if (selectedCategory === 'Library Service') {
      optimizedCategory = 'Library Service';
      priority = 'Normal';
    } else {
      optimizedCategory = 'General Suggestion';
      priority = 'Normal';
    }
  }

  return {
    optimizedCategory,
    priority,
    detectedKeywords: Array.from(new Set(detectedKeywords))
  };
};

/**
 * Calculates Jaccard token similarity between two sets of keyword tokens (0 to 1)
 */
export const calculateTokenSimilarity = (tokensA: string[], tokensB: string[]): number => {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersection++;
    }
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

/**
 * Groups similar feedback items for a specific book or overall catalog
 * Enriches feedbacks with similar count without mutating original data
 */
export const enrichFeedbacksWithSimilarDetection = (feedbacks: BookFeedback[]): {
  enriched: BookFeedback[];
  similarGroups: { key: string; label: string; count: number; items: BookFeedback[] }[];
  mostCommonSuggestion?: string;
} => {
  if (!feedbacks || feedbacks.length === 0) {
    return { enriched: [], similarGroups: [] };
  }

  const tokenizedList = feedbacks.map(f => ({
    feedback: f,
    tokens: normalizeCommentTokens(f.comment),
    optCat: f.optimizedCategory || f.category
  }));

  // Cluster feedbacks based on shared category + high token similarity (>= 0.35) or identical keyword topics
  const clusters: { label: string; items: BookFeedback[]; tokens: string[] }[] = [];

  tokenizedList.forEach(item => {
    let matchedClusterIndex = -1;

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const similarity = calculateTokenSimilarity(item.tokens, cluster.tokens);
      
      // Match if same optimized category and substantial token overlap, or same specific request type
      if (
        (item.optCat === 'Edition Request' && cluster.label.includes('Edition')) ||
        (item.optCat === 'Book Availability' && cluster.label.includes('Copies')) ||
        (item.optCat === 'Book Quality' && cluster.label.includes('Condition')) ||
        similarity >= 0.35
      ) {
        matchedClusterIndex = i;
        break;
      }
    }

    if (matchedClusterIndex >= 0) {
      clusters[matchedClusterIndex].items.push(item.feedback);
      clusters[matchedClusterIndex].tokens = Array.from(new Set([...clusters[matchedClusterIndex].tokens, ...item.tokens]));
    } else {
      let label = 'General Feedback';
      if (item.optCat === 'Edition Request') label = 'Request for newer edition / reprint';
      else if (item.optCat === 'Book Availability') label = 'Request for additional physical copies';
      else if (item.optCat === 'Content Accuracy') label = 'Errata / Content clarification';
      else if (item.optCat === 'Book Quality') label = 'Physical wear / Binding condition report';
      else if (item.optCat === 'Positive Feedback') label = 'Commendation & positive recommendation';
      else if (item.tokens.length > 0) label = `Topic: "${item.tokens.slice(0, 3).join(' ')}"`;

      clusters.push({
        label,
        items: [item.feedback],
        tokens: item.tokens
      });
    }
  });

  // Calculate similar counts per feedback
  const feedbackSimilarCountMap: Record<string, { count: number; groupKey: string }> = {};

  clusters.forEach((cluster, idx) => {
    const key = `group_${idx}_${cluster.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    cluster.items.forEach(fb => {
      feedbackSimilarCountMap[fb.id] = {
        count: cluster.items.length,
        groupKey: key
      };
    });
  });

  const enriched = feedbacks.map(fb => {
    const simInfo = feedbackSimilarCountMap[fb.id] || { count: 1, groupKey: 'default' };
    return {
      ...fb,
      similarCount: simInfo.count,
      similarGroupKey: simInfo.groupKey
    };
  });

  const formattedGroups = clusters
    .filter(c => c.items.length >= 1)
    .sort((a, b) => b.items.length - a.items.length)
    .map((c, idx) => ({
      key: `cluster_${idx}`,
      label: c.label,
      count: c.items.length,
      items: c.items
    }));

  const mostCommon = formattedGroups.find(g => !g.label.includes('Positive') && g.count > 1)?.label;

  return {
    enriched,
    similarGroups: formattedGroups,
    mostCommonSuggestion: mostCommon || (formattedGroups.length > 0 ? formattedGroups[0].label : undefined)
  };
};

/**
 * Computes complete aggregate summary metrics for a specific book's feedbacks
 */
export const calculateBookFeedbackSummary = (feedbacks: BookFeedback[]): BookFeedbackSummary => {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const categoryCounts: Record<FeedbackCategory, number> = {
    'Book Quality': 0,
    'Book Availability': 0,
    'Content Accuracy': 0,
    'Edition Request': 0,
    'Library Service': 0,
    'Other': 0
  };
  const optimizedCounts: Record<OptimizedCategory, number> = {
    'Positive Feedback': 0,
    'Edition Request': 0,
    'Book Availability': 0,
    'Content Accuracy': 0,
    'Book Quality': 0,
    'Library Service': 0,
    'General Suggestion': 0,
    'Complaint': 0
  };

  let totalRatingSum = 0;
  let highPriorityCount = 0;
  let pendingCount = 0;
  let resolvedCount = 0;

  feedbacks.forEach(f => {
    const r = Math.min(5, Math.max(1, Math.round(f.rating || 5))) as 1 | 2 | 3 | 4 | 5;
    distribution[r] = (distribution[r] || 0) + 1;
    totalRatingSum += f.rating || 5;

    if (f.category && categoryCounts[f.category] !== undefined) {
      categoryCounts[f.category]++;
    } else {
      categoryCounts['Other']++;
    }

    if (f.optimizedCategory && optimizedCounts[f.optimizedCategory] !== undefined) {
      optimizedCounts[f.optimizedCategory]++;
    } else {
      optimizedCounts['General Suggestion']++;
    }

    if (f.priority === 'High') highPriorityCount++;
    if (f.status === 'New') pendingCount++;
    if (f.status === 'Resolved') resolvedCount++;
  });

  const totalReviews = feedbacks.length;
  const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

  const { similarGroups, mostCommonSuggestion } = enrichFeedbacksWithSimilarDetection(feedbacks);

  return {
    averageRating,
    totalReviews,
    ratingDistribution: distribution,
    categoryCounts,
    optimizedCategoryCounts: optimizedCounts,
    highPriorityCount,
    pendingCount,
    resolvedCount,
    mostCommonSuggestion,
    similarGroups
  };
};

/**
 * Computes global statistics across all books for the Staff Comment Optimization dashboard
 */
export const calculateGlobalFeedbackMetrics = (feedbacks: BookFeedback[]) => {
  const total = feedbacks.length;
  const newCount = feedbacks.filter(f => f.status === 'New').length;
  const reviewedCount = feedbacks.filter(f => f.status === 'Reviewed').length;
  const resolvedCount = feedbacks.filter(f => f.status === 'Resolved').length;
  const highPriorityCount = feedbacks.filter(f => f.priority === 'High').length;
  
  const sumRating = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
  const averageRating = total > 0 ? Number((sumRating / total).toFixed(1)) : 0;

  // Breakdown by book
  const bookMap: Record<string, { title: string; count: number; sumRating: number; highPriority: number }> = {};
  feedbacks.forEach(f => {
    if (!bookMap[f.bookId]) {
      bookMap[f.bookId] = { title: f.bookTitle || f.bookId, count: 0, sumRating: 0, highPriority: 0 };
    }
    bookMap[f.bookId].count++;
    bookMap[f.bookId].sumRating += f.rating || 5;
    if (f.priority === 'High') bookMap[f.bookId].highPriority++;
  });

  const topFeedbackBooks = Object.entries(bookMap)
    .map(([bookId, data]) => ({
      bookId,
      bookTitle: data.title,
      feedbackCount: data.count,
      avgRating: Number((data.sumRating / data.count).toFixed(1)),
      highPriority: data.highPriority
    }))
    .sort((a, b) => b.feedbackCount - a.feedbackCount);

  return {
    total,
    newCount,
    reviewedCount,
    resolvedCount,
    highPriorityCount,
    averageRating,
    topFeedbackBooks
  };
};
