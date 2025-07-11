-- database/init.sql
-- Database initialization script for PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create database if not exists
-- (This is handled by docker-compose environment variables)

-- Connect to the database
\c digital_library;

-- Create tables
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
);

-- Table for semantic relations between books
CREATE TABLE IF NOT EXISTS semantic_relations (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    predicate VARCHAR(255) NOT NULL,
    object_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    object_value TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_relation UNIQUE(subject_id, predicate, object_id)
);

-- Table for user interactions (for recommendation system)
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'search', 'download', 'favorite', 'rating'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    metadata JSONB, -- Additional interaction data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for search queries (for semantic analysis)
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    semantic_query JSONB,
    results_count INTEGER DEFAULT 0,
    user_id VARCHAR(255),
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for system analytics
CREATE TABLE IF NOT EXISTS system_analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_daily_metric UNIQUE(metric_name, date_recorded)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING GIN (to_tsvector('indonesian', title));
CREATE INDEX IF NOT EXISTS idx_books_author ON books USING GIN (to_tsvector('indonesian', author));
CREATE INDEX IF NOT EXISTS idx_books_description ON books USING GIN (to_tsvector('indonesian', description));
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_publication_year ON books(publication_year);
CREATE INDEX IF NOT EXISTS idx_books_semantic ON books USING GIN (semantic_data);

CREATE INDEX IF NOT EXISTS idx_semantic_relations_subject ON semantic_relations(subject_id);
CREATE INDEX IF NOT EXISTS idx_semantic_relations_object ON semantic_relations(object_id);
CREATE INDEX IF NOT EXISTS idx_semantic_relations_predicate ON semantic_relations(predicate);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_book ON user_interactions(book_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created ON user_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries USING GIN (to_tsvector('indonesian', query));
CREATE INDEX IF NOT EXISTS idx_search_queries_semantic ON search_queries USING GIN (semantic_query);
CREATE INDEX IF NOT EXISTS idx_search_queries_user ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created ON search_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_system_analytics_metric ON system_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_analytics_date ON system_analytics(date_recorded);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO books (title, author, isbn, publication_year, publisher, page_count, genre, description, cover_url, semantic_data) VALUES 
('Mahir Web Semantic', 'Prof. Dhema Subagja', '978-3-16-148410-0', 2023, 'Matahari', 350, 'Techno', 'Deskripsi singkat tentang buku ini.', 'https://yunautama.xyz/serveran/book_cover.jpg', '{"entities": {"topics": ["web development", "semantic web"], "concepts": ["technology", "education"]}}'),
('Mahir Pemrograman Web', 'Dr. Syeh Yunautama', '978-1-234-56789-0', 2020, 'Yunautama', 250, 'Informatics', 'Deskripsi singkat tentang buku ini.', 'https://yunautama.xyz/serveran/book_cover.jpg', '{"entities": {"topics": ["web development", "programming"], "concepts": ["tutorial", "guide"]}}'),
('Mahir Algoritma Pemrograman', 'Dr. Purnama Bagja', '978-1-234-67789-0', 2020, 'Ramayana', 270, 'Informatics', 'Deskripsi singkat tentang buku ini.', 'https://yunautama.xyz/sevserveran/book_cover.jpg', '{"entities": {"topics": ["algorithm", "programming"], "concepts": ["education", "reference"]}}'),
('Database untuk Industri Masa Kini', 'Dr. Syeh Yunautama', '978-1-234-56744-0', 2022, 'Yunautama', 250, 'Informatics', 'Deskripsi singkat tentang buku ini.', 'https://yunautama.xyz/serveran/book_cover.jpg', '{"entities": {"topics": ["database"], "concepts": ["technology", "industry"]}}'),
('UI/UX bagi programmer pemula', 'Dr. Syeh Yunautama', '978-1-234-58989-0', 2021, 'Yunautama', 150, 'Informatics', 'Deskripsi singkat tentang buku ini.', 'https://yunautama.xyz/serveran/book_cover.jpg', '{"entities": {"topics": ["ui/ux", "programming"], "concepts": ["tutorial", "guide"]}}')
ON CONFLICT (isbn) DO NOTHING;

-- Insert sample semantic relations
INSERT INTO semantic_relations (subject_id, predicate, object_id, confidence_score) VALUES 
(1, 'similarTo', 2, 0.75),
(2, 'similarTo', 3, 0.65),
(2, 'similarTo', 4, 0.80),
(2, 'similarTo', 5, 0.70),
(3, 'similarTo', 4, 0.60),
(4, 'similarTo', 5, 0.55)
ON CONFLICT (subject_id, predicate, object_id) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW book_analytics AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.genre,
    b.publication_year,
    COUNT(ui.id) as interaction_count,
    AVG(ui.rating) as avg_rating,
    COUNT(CASE WHEN ui.interaction_type = 'view' THEN 1 END) as view_count,
    COUNT(CASE WHEN ui.interaction_type = 'favorite' THEN 1 END) as favorite_count
FROM books b
LEFT JOIN user_interactions ui ON b.id = ui.book_id
GROUP BY b.id, b.title, b.author, b.genre, b.publication_year;

CREATE OR REPLACE VIEW popular_books AS
SELECT 
    ba.*,
    COALESCE(ba.interaction_count, 0) + COALESCE(ba.avg_rating, 0) * 10 as popularity_score
FROM book_analytics ba
ORDER BY popularity_score DESC;

CREATE OR REPLACE VIEW search_trends AS
SELECT 
    DATE_TRUNC('day', created_at) as search_date,
    COUNT(*) as search_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(results_count) as avg_results
FROM search_queries
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY search_date;

-- Create functions for recommendation system
CREATE OR REPLACE FUNCTION get_similar_books(book_id INTEGER, similarity_threshold DECIMAL DEFAULT 0.5)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR,
    author VARCHAR,
    similarity_score DECIMAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.author,
        sr.confidence_score
    FROM books b
    JOIN semantic_relations sr ON (sr.object_id = b.id AND sr.subject_id = book_id)
        OR (sr.subject_id = b.id AND sr.object_id = book_id)
    WHERE sr.confidence_score >= similarity_threshold
        AND b.id != book_id
    ORDER BY sr.confidence_score DESC;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION record_user_interaction(
    p_user_id VARCHAR,
    p_book_id INTEGER,
    p_interaction_type VARCHAR,
    p_rating INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $
BEGIN
    INSERT INTO user_interactions (user_id, book_id, interaction_type, rating, metadata)
    VALUES (p_user_id, p_book_id, p_interaction_type, p_rating, p_metadata);
END;
$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Complete database setup
COMMIT;