// backend/src/controllers/bookController.js
const { pool } = require("../config/database");
const SemanticService = require("../services/semanticService");
const RecommendationService = require("../services/recommendationService");
const axios = require("axios");

class BookController {
  constructor() {
    this.semanticService = new SemanticService();
    this.recommendationService = new RecommendationService();
  }

  // Sync data dari external API
  async syncData(req, res) {
    try {
      const response = await axios.get(
        "https://yunautama.xyz/serveran/data.json"
      );
      const books = response.data.books;

      for (const book of books) {
        // Generate semantic data
        const jsonldData = await this.semanticService.convertToJsonLD(book);
        const semanticEntities = this.semanticService.extractSemanticEntities(
          `${book.title} ${book.description} ${book.genre}`
        );

        // Cek apakah buku sudah ada
        const existingBook = await pool.query(
          "SELECT id FROM books WHERE isbn = $1",
          [book.ISBN]
        );

        if (existingBook.rows.length === 0) {
          // Insert buku baru
          await pool.query(
            `
            INSERT INTO books (title, author, isbn, publication_year, publisher, page_count, genre, description, cover_url, semantic_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `,
            [
              book.title,
              book.author,
              book.ISBN,
              book.publication_year,
              book.publisher,
              book.page_count,
              book.genre,
              book.description,
              book.cover,
              JSON.stringify({
                jsonld: jsonldData,
                entities: semanticEntities,
              }),
            ]
          );
        }
      }

      // Build semantic relations
      await this.buildSemanticRelations();

      res.json({
        message: "Data synced successfully",
        count: books.length,
      });
    } catch (error) {
      console.error("Error syncing data:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  }

  // Dapatkan semua buku
  async getAllBooks(req, res) {
    try {
      const { page = 1, limit = 10, genre, author, year } = req.query;
      const offset = (page - 1) * limit;

      let query = "SELECT * FROM books WHERE 1=1";
      let params = [];
      let paramCount = 0;

      if (genre) {
        paramCount++;
        query += ` AND genre ILIKE $${paramCount}`;
        params.push(`%${genre}%`);
      }

      if (author) {
        paramCount++;
        query += ` AND author ILIKE $${paramCount}`;
        params.push(`%${author}%`);
      }

      if (year) {
        paramCount++;
        query += ` AND publication_year = $${paramCount}`;
        params.push(year);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${
        paramCount + 2
      }`;
      params.push(limit, offset);

      const books = await pool.query(query, params);

      // Get total count
      let countQuery = "SELECT COUNT(*) FROM books WHERE 1=1";
      let countParams = [];
      let countParamCount = 0;

      if (genre) {
        countParamCount++;
        countQuery += ` AND genre ILIKE $${countParamCount}`;
        countParams.push(`%${genre}%`);
      }

      if (author) {
        countParamCount++;
        countQuery += ` AND author ILIKE $${countParamCount}`;
        countParams.push(`%${author}%`);
      }

      if (year) {
        countParamCount++;
        countQuery += ` AND publication_year = $${countParamCount}`;
        countParams.push(year);
      }

      const totalCount = await pool.query(countQuery, countParams);

      res.json({
        books: books.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount.rows[0].count),
          pages: Math.ceil(totalCount.rows[0].count / limit),
        },
      });
    } catch (error) {
      console.error("Error getting books:", error);
      res.status(500).json({ error: "Failed to get books" });
    }
  }

  // Dapatkan buku berdasarkan ID
  async getBookById(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const book = await pool.query("SELECT * FROM books WHERE id = $1", [id]);

      if (book.rows.length === 0) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Record user interaction
      if (userId) {
        await this.recommendationService.recordUserInteraction(
          userId,
          id,
          "view"
        );
      }

      // Get semantic relations
      const relations = await pool.query(
        `
        SELECT 
          b.id, b.title, b.author, b.cover_url,
          sr.predicate, sr.confidence_score
        FROM semantic_relations sr
        JOIN books b ON sr.object_id = b.id
        WHERE sr.subject_id = $1
        ORDER BY sr.confidence_score DESC
        LIMIT 5
      `,
        [id]
      );

      const bookData = {
        ...book.rows[0],
        semantic_relations: relations.rows,
      };

      res.json(bookData);
    } catch (error) {
      console.error("Error getting book:", error);
      res.status(500).json({ error: "Failed to get book" });
    }
  }

  // Pencarian semantik
  async searchBooks(req, res) {
    try {
      const { query, userId } = req.query;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // Record search query
      if (userId) {
        const semanticQuery = this.semanticService.generateSemanticQuery(query);
        await pool.query(
          `
          INSERT INTO search_queries (query, semantic_query, user_id)
          VALUES ($1, $2, $3)
        `,
          [query, JSON.stringify(semanticQuery), userId]
        );
      }

      // Semantic search
      const results =
        await this.recommendationService.getSemanticSearchRecommendations(
          query
        );

      res.json({
        query: query,
        results: results,
      });
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).json({ error: "Failed to search books" });
    }
  }

  // Dapatkan rekomendasi
  async getRecommendations(req, res) {
    try {
      const { userId, bookId, type = "hybrid" } = req.query;

      let recommendations = [];

      switch (type) {
        case "content":
          if (!bookId) {
            return res
              .status(400)
              .json({
                error: "bookId is required for content-based recommendations",
              });
          }
          recommendations =
            await this.recommendationService.getContentBasedRecommendations(
              bookId
            );
          break;

        case "collaborative":
          if (!userId) {
            return res
              .status(400)
              .json({
                error: "userId is required for collaborative recommendations",
              });
          }
          recommendations =
            await this.recommendationService.getCollaborativeRecommendations(
              userId
            );
          break;

        case "hybrid":
          recommendations =
            await this.recommendationService.getHybridRecommendations(
              userId,
              bookId
            );
          break;

        default:
          recommendations = await this.recommendationService.getPopularBooks();
      }

      res.json({
        type: type,
        recommendations: recommendations,
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  }

  // Rate buku
  async rateBook(req, res) {
    try {
      const { userId, bookId, rating } = req.body;

      if (!userId || !bookId || !rating) {
        return res
          .status(400)
          .json({ error: "userId, bookId, and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      await this.recommendationService.recordUserInteraction(
        userId,
        bookId,
        "rating",
        rating
      );

      res.json({ message: "Rating recorded successfully" });
    } catch (error) {
      console.error("Error rating book:", error);
      res.status(500).json({ error: "Failed to rate book" });
    }
  }

  // Dapatkan knowledge graph
  async getKnowledgeGraph(req, res) {
    try {
      const books = await pool.query("SELECT * FROM books LIMIT 50");
      const graph = this.semanticService.buildKnowledgeGraph(books.rows);

      res.json(graph);
    } catch (error) {
      console.error("Error getting knowledge graph:", error);
      res.status(500).json({ error: "Failed to get knowledge graph" });
    }
  }

  // Get analytics data
  async getAnalytics(req, res) {
    try {
      // Popular genres
      const genreStats = await pool.query(`
        SELECT genre, COUNT(*) as count
        FROM books
        GROUP BY genre
        ORDER BY count DESC
      `);

      // Popular authors
      const authorStats = await pool.query(`
        SELECT author, COUNT(*) as book_count
        FROM books
        GROUP BY author
        ORDER BY book_count DESC
        LIMIT 10
      `);

      // Search trends
      const searchTrends = await pool.query(`
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as search_count
        FROM search_queries
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date
      `);

      // User interaction stats
      const interactionStats = await pool.query(`
        SELECT 
          interaction_type,
          COUNT(*) as count
        FROM user_interactions
        GROUP BY interaction_type
      `);

      res.json({
        genres: genreStats.rows,
        authors: authorStats.rows,
        searchTrends: searchTrends.rows,
        interactions: interactionStats.rows,
      });
    } catch (error) {
      console.error("Error getting analytics:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  }

  // Build semantic relations antar buku
  async buildSemanticRelations() {
    try {
      const books = await pool.query("SELECT * FROM books");

      for (let i = 0; i < books.rows.length; i++) {
        for (let j = i + 1; j < books.rows.length; j++) {
          const book1 = books.rows[i];
          const book2 = books.rows[j];

          const similarity = this.semanticService.calculateSemanticSimilarity(
            book1,
            book2
          );

          if (similarity > 0.3) {
            // Threshold untuk relasi
            // Cek apakah relasi sudah ada
            const existingRelation = await pool.query(
              `
              SELECT id FROM semantic_relations 
              WHERE (subject_id = $1 AND object_id = $2) 
              OR (subject_id = $2 AND object_id = $1)
            `,
              [book1.id, book2.id]
            );

            if (existingRelation.rows.length === 0) {
              await pool.query(
                `
                INSERT INTO semantic_relations (subject_id, predicate, object_id, confidence_score)
                VALUES ($1, $2, $3, $4)
              `,
                [book1.id, "similarTo", book2.id, similarity]
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error building semantic relations:", error);
    }
  }
}

module.exports = new BookController();
