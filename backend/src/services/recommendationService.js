// backend/src/services/recommendationService.js
const { pool } = require("../config/database");
const SemanticService = require("./semanticService");

class RecommendationService {
  constructor() {
    this.semanticService = new SemanticService();
  }

  // Content-based recommendation
  async getContentBasedRecommendations(bookId, limit = 5) {
    try {
      // Dapatkan buku target
      const targetBook = await pool.query("SELECT * FROM books WHERE id = $1", [
        bookId,
      ]);

      if (targetBook.rows.length === 0) {
        return [];
      }

      const target = targetBook.rows[0];

      // Dapatkan semua buku kecuali target
      const allBooks = await pool.query("SELECT * FROM books WHERE id != $1", [
        bookId,
      ]);

      // Hitung similarity score
      const recommendations = allBooks.rows.map((book) => {
        const similarity = this.semanticService.calculateSemanticSimilarity(
          target,
          book
        );
        return {
          ...book,
          similarity_score: similarity,
          recommendation_reason: this.generateRecommendationReason(
            target,
            book,
            similarity
          ),
        };
      });

      // Sort berdasarkan similarity dan ambil top N
      return recommendations
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit);
    } catch (error) {
      console.error("Error in content-based recommendations:", error);
      return [];
    }
  }

  // Collaborative filtering recommendation
  async getCollaborativeRecommendations(userId, limit = 5) {
    try {
      // Untuk sekarang, return popular books sebagai fallback
      return await this.getPopularBooks(limit);
    } catch (error) {
      console.error("Error in collaborative recommendations:", error);
      return await this.getPopularBooks(limit);
    }
  }

  // Hybrid recommendation (kombinasi content-based dan collaborative)
  async getHybridRecommendations(userId, bookId = null, limit = 5) {
    try {
      const contentBased = bookId
        ? await this.getContentBasedRecommendations(
            bookId,
            Math.ceil(limit / 2)
          )
        : [];

      const collaborative = await this.getCollaborativeRecommendations(
        userId,
        Math.ceil(limit / 2)
      );

      // Kombinasi dan deduplikasi
      const combined = [...contentBased, ...collaborative];
      const uniqueRecommendations = combined.filter(
        (book, index, self) => index === self.findIndex((b) => b.id === book.id)
      );

      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      console.error("Error in hybrid recommendations:", error);
      return [];
    }
  }

  // Semantic search recommendations
  async getSemanticSearchRecommendations(query, limit = 10) {
    try {
      const semanticQuery = this.semanticService.generateSemanticQuery(query);

      // Simple text search untuk sekarang
      const searchQuery = `
        SELECT *, 
               CASE 
                 WHEN LOWER(title) LIKE LOWER($1) THEN 3
                 WHEN LOWER(author) LIKE LOWER($1) THEN 2
                 WHEN LOWER(description) LIKE LOWER($1) THEN 1
                 ELSE 0
               END as relevance_score
        FROM books
        WHERE LOWER(title) LIKE LOWER($1) 
           OR LOWER(author) LIKE LOWER($1) 
           OR LOWER(description) LIKE LOWER($1)
           OR LOWER(genre) LIKE LOWER($1)
        ORDER BY relevance_score DESC
        LIMIT $2
      `;

      const results = await pool.query(searchQuery, [`%${query}%`, limit]);

      return results.rows.map((book) => ({
        ...book,
        semantic_entities: semanticQuery.entities,
        search_intent: semanticQuery.intent,
      }));
    } catch (error) {
      console.error("Error in semantic search:", error);
      return [];
    }
  }

  // Dapatkan buku populer sebagai fallback
  async getPopularBooks(limit = 5) {
    try {
      const popularBooks = await pool.query(
        `
        SELECT 
          b.*,
          COUNT(ui.id) as interaction_count,
          AVG(ui.rating) as avg_rating
        FROM books b
        LEFT JOIN user_interactions ui ON b.id = ui.book_id
        GROUP BY b.id
        ORDER BY interaction_count DESC, avg_rating DESC
        LIMIT $1
      `,
        [limit]
      );

      return popularBooks.rows.map((book) => ({
        ...book,
        recommendation_reason: "Buku populer berdasarkan interaksi user",
      }));
    } catch (error) {
      console.error("Error getting popular books:", error);
      return [];
    }
  }

  // Generate alasan rekomendasi
  generateRecommendationReason(targetBook, recommendedBook, similarity) {
    const reasons = [];

    if (targetBook.genre === recommendedBook.genre) {
      reasons.push(`Genre yang sama: ${targetBook.genre}`);
    }

    if (targetBook.author === recommendedBook.author) {
      reasons.push(`Author yang sama: ${targetBook.author}`);
    }

    if (targetBook.publisher === recommendedBook.publisher) {
      reasons.push(`Penerbit yang sama: ${targetBook.publisher}`);
    }

    const yearDiff = Math.abs(
      targetBook.publication_year - recommendedBook.publication_year
    );
    if (yearDiff <= 3) {
      reasons.push(`Tahun terbit yang berdekatan (${yearDiff} tahun)`);
    }

    if (reasons.length === 0) {
      reasons.push("Konten yang serupa berdasarkan analisis semantik");
    }

    return reasons.join(", ");
  }

  // Record user interaction untuk learning
  async recordUserInteraction(userId, bookId, interactionType, rating = null) {
    try {
      await pool.query(
        `
        INSERT INTO user_interactions (user_id, book_id, interaction_type, rating)
        VALUES ($1, $2, $3, $4)
      `,
        [userId, bookId, interactionType, rating]
      );
    } catch (error) {
      console.error("Error recording user interaction:", error);
    }
  }
}

module.exports = RecommendationService;
