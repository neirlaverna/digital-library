// backend/src/config/database.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "digital_library",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database schema untuk Web Semantic
const createTables = async () => {
  try {
    // Tabel utama buku
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE,
        publication_year INTEGER,
        publisher VARCHAR(255),
        page_count INTEGER,
        genre VARCHAR(100),
        description TEXT,
        cover_url VARCHAR(500),
        semantic_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabel untuk ontologi dan semantic relationships
    await pool.query(`
      CREATE TABLE IF NOT EXISTS semantic_relations (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER REFERENCES books(id),
        predicate VARCHAR(255),
        object_id INTEGER REFERENCES books(id),
        object_value TEXT,
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabel untuk user behavior (untuk recommendation)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        book_id INTEGER REFERENCES books(id),
        interaction_type VARCHAR(50),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabel untuk search queries (untuk analisis semantik)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS search_queries (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        semantic_query JSONB,
        results_count INTEGER,
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
};

module.exports = { pool, createTables };
