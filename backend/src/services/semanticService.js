// backend/src/services/semanticService.js

class SemanticService {
  constructor() {
    // Schema.org context untuk buku
    this.context = {
      "@context": {
        "@vocab": "https://schema.org/",
        book: "Book",
        author: "author",
        publisher: "publisher",
        genre: "genre",
        isbn: "isbn",
        pageCount: "numberOfPages",
        publicationYear: "datePublished",
        description: "description",
        coverImage: "image",
      },
    };
  }

  // Konversi data buku ke format JSON-LD
  async convertToJsonLD(book) {
    const jsonldDoc = {
      "@context": this.context["@context"],
      "@type": "Book",
      "@id": `https://perpustakaan.id/books/${book.id}`,
      name: book.title,
      author: {
        "@type": "Person",
        name: book.author,
      },
      publisher: {
        "@type": "Organization",
        name: book.publisher,
      },
      isbn: book.isbn,
      numberOfPages: book.page_count,
      datePublished: book.publication_year?.toString(),
      genre: book.genre,
      description: book.description,
      image: book.cover_url,
      url: `https://perpustakaan.id/books/${book.id}`,
    };

    return jsonldDoc;
  }

  // Ekstrak entitas semantik dari teks
  extractSemanticEntities(text) {
    const entities = {
      topics: [],
      concepts: [],
      keywords: [],
    };

    // Ekstraksi topik programming
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

    // Ekstraksi konsep dari genre dan deskripsi
    const concepts = [
      "technology",
      "education",
      "tutorial",
      "guide",
      "reference",
    ];
    concepts.forEach((concept) => {
      if (lowerText.includes(concept)) {
        entities.concepts.push(concept);
      }
    });

    // Ekstraksi keywords sederhana
    const keywords = text.match(/\b\w{4,}\b/g) || [];
    entities.keywords = [...new Set(keywords.slice(0, 10))];

    return entities;
  }

  // Hitung similarity berdasarkan semantic features
  calculateSemanticSimilarity(book1, book2) {
    let similarityScore = 0;

    // Similarity berdasarkan genre
    if (book1.genre === book2.genre) {
      similarityScore += 0.3;
    }

    // Similarity berdasarkan author
    if (book1.author === book2.author) {
      similarityScore += 0.4;
    }

    // Similarity berdasarkan publisher
    if (book1.publisher === book2.publisher) {
      similarityScore += 0.1;
    }

    // Similarity berdasarkan tahun terbit (dalam rentang 3 tahun)
    const yearDiff = Math.abs(book1.publication_year - book2.publication_year);
    if (yearDiff <= 3) {
      similarityScore += 0.2;
    }

    return Math.min(similarityScore, 1.0);
  }

  // Generate semantic query untuk pencarian
  generateSemanticQuery(query) {
    const semanticQuery = {
      original: query,
      expanded: [],
      entities: this.extractSemanticEntities(query),
      intent: this.detectSearchIntent(query),
    };

    // Ekspansi query berdasarkan sinonim dan konsep terkait
    const synonyms = {
      programming: ["coding", "development", "software"],
      algorithm: ["algoritma", "computation", "logic"],
      database: ["db", "data storage", "sql"],
      web: ["website", "internet", "online"],
    };

    const queryWords = query.toLowerCase().split(" ");
    queryWords.forEach((word) => {
      if (synonyms[word]) {
        semanticQuery.expanded.push(...synonyms[word]);
      }
    });

    return semanticQuery;
  }

  // Deteksi intent pencarian
  detectSearchIntent(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("tutorial") || lowerQuery.includes("learn")) {
      return "learning";
    }
    if (lowerQuery.includes("reference") || lowerQuery.includes("guide")) {
      return "reference";
    }
    if (lowerQuery.includes("author") || lowerQuery.includes("by")) {
      return "author_search";
    }
    if (lowerQuery.includes("new") || lowerQuery.includes("latest")) {
      return "recent_books";
    }

    return "general_search";
  }

  // Build knowledge graph sederhana
  buildKnowledgeGraph(books) {
    const graph = {
      nodes: [],
      edges: [],
    };

    books.forEach((book) => {
      // Node untuk buku
      graph.nodes.push({
        id: `book_${book.id}`,
        type: "Book",
        label: book.title,
        properties: book,
      });

      // Node untuk author
      graph.nodes.push({
        id: `author_${book.author.replace(/\s+/g, "_")}`,
        type: "Person",
        label: book.author,
      });

      // Node untuk genre
      graph.nodes.push({
        id: `genre_${book.genre.replace(/\s+/g, "_")}`,
        type: "Genre",
        label: book.genre,
      });

      // Edges/Relations
      graph.edges.push({
        source: `book_${book.id}`,
        target: `author_${book.author.replace(/\s+/g, "_")}`,
        relation: "writtenBy",
      });

      graph.edges.push({
        source: `book_${book.id}`,
        target: `genre_${book.genre.replace(/\s+/g, "_")}`,
        relation: "hasGenre",
      });
    });

    return graph;
  }
}

module.exports = SemanticService;
