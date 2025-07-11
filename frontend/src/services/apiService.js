// frontend/src/services/apiService.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add user ID to requests if available
    const userId = localStorage.getItem("userId") || `user_${Date.now()}`;
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", userId);
    }

    if (config.params) {
      config.params.userId = userId;
    } else {
      config.params = { userId };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Books
  getAllBooks: (params = {}) => api.get("/books", { params }),
  getBookById: (id) => api.get(`/books/${id}`),
  searchBooks: (query) => api.get("/books/search", { params: { query } }),

  // Recommendations
  getRecommendations: (params = {}) =>
    api.get("/books/recommendations", { params }),

  // User interactions
  rateBook: (bookId, rating) => {
    const userId = localStorage.getItem("userId");
    return api.post("/books/rate", { userId, bookId, rating });
  },

  // Analytics
  getAnalytics: () => api.get("/books/analytics"),
  getKnowledgeGraph: () => api.get("/books/knowledge-graph"),

  // Sync data
  syncData: () => api.post("/books/sync"),
};

// Semantic search utilities
export const semanticUtils = {
  extractEntities: (text) => {
    const entities = {
      topics: [],
      concepts: [],
      keywords: [],
    };

    const programmingTopics = [
      "web development",
      "programming",
      "algorithm",
      "database",
      "ui/ux",
      "frontend",
      "backend",
      "javascript",
      "python",
      "java",
      "semantic web",
      "artificial intelligence",
    ];

    const lowerText = text.toLowerCase();

    programmingTopics.forEach((topic) => {
      if (lowerText.includes(topic)) {
        entities.topics.push(topic);
      }
    });

    return entities;
  },

  highlightSemanticTerms: (text, searchQuery) => {
    if (!searchQuery) return text;

    const terms = searchQuery.toLowerCase().split(" ");
    let highlightedText = text;

    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<span class="semantic-highlight">$1</span>'
      );
    });

    return highlightedText;
  },

  calculateRelevanceScore: (book, query) => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = book.title.toLowerCase();
    const authorLower = book.author.toLowerCase();
    const descriptionLower = book.description.toLowerCase();

    // Title match (highest weight)
    if (titleLower.includes(queryLower)) score += 0.5;

    // Author match
    if (authorLower.includes(queryLower)) score += 0.3;

    // Description match
    if (descriptionLower.includes(queryLower)) score += 0.2;

    // Exact genre match
    if (book.genre.toLowerCase() === queryLower) score += 0.4;

    return Math.min(score, 1.0);
  },
};

// Local storage utilities for user preferences
export const userPreferences = {
  getViewPreferences: () => {
    return JSON.parse(
      localStorage.getItem("viewPreferences") ||
        '{"layout": "grid", "theme": "light"}'
    );
  },

  setViewPreferences: (preferences) => {
    localStorage.setItem("viewPreferences", JSON.stringify(preferences));
  },

  getSearchHistory: () => {
    return JSON.parse(localStorage.getItem("searchHistory") || "[]");
  },

  addToSearchHistory: (query) => {
    const history = userPreferences.getSearchHistory();
    const newHistory = [query, ...history.filter((q) => q !== query)].slice(
      0,
      10
    );
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  },

  getFavoriteBooks: () => {
    return JSON.parse(localStorage.getItem("favoriteBooks") || "[]");
  },

  toggleFavorite: (bookId) => {
    const favorites = userPreferences.getFavoriteBooks();
    const newFavorites = favorites.includes(bookId)
      ? favorites.filter((id) => id !== bookId)
      : [...favorites, bookId];
    localStorage.setItem("favoriteBooks", JSON.stringify(newFavorites));
    return newFavorites;
  },

  getReadingList: () => {
    return JSON.parse(localStorage.getItem("readingList") || "[]");
  },

  addToReadingList: (bookId) => {
    const readingList = userPreferences.getReadingList();
    if (!readingList.includes(bookId)) {
      const newList = [...readingList, bookId];
      localStorage.setItem("readingList", JSON.stringify(newList));
      return newList;
    }
    return readingList;
  },

  removeFromReadingList: (bookId) => {
    const readingList = userPreferences.getReadingList();
    const newList = readingList.filter((id) => id !== bookId);
    localStorage.setItem("readingList", JSON.stringify(newList));
    return newList;
  },
};

export default api;
