// frontend/src/pages/SearchPage.js
import React, { useState, useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Select,
  Pagination,
  Spin,
  Empty,
  Card,
  Tag,
  Space,
  Button,
  Radio,
  Slider,
  Collapse,
  Typography,
  Alert,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ClearOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import { Container, Grid } from "../styles/GlobalStyle";
import BookCard from "../components/BookCard/BookCard";
import {
  apiService,
  userPreferences,
  semanticUtils,
} from "../services/apiService";

const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const SearchContainer = styled.div`
  margin-bottom: 24px;
`;

const FilterSidebar = styled(Card)`
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  height: fit-content;
  position: sticky;
  top: 100px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SearchHistory = styled.div`
  margin-bottom: 16px;
`;

const HistoryTag = styled(Tag)`
  margin: 4px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
`;

const SemanticInfo = styled(Alert)`
  margin-bottom: 16px;
  border-radius: 12px;

  .ant-alert-message {
    font-weight: 600;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Filters
  const [filters, setFilters] = useState({
    genre: searchParams.get("genre") || "",
    author: searchParams.get("author") || "",
    year: searchParams.get("year") || "",
    minPages: 0,
    maxPages: 1000,
  });

  // Search history
  const [searchHistory] = useState(userPreferences.getSearchHistory());

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.author) params.set("author", filters.author);
    if (filters.year) params.set("year", filters.year);

    setSearchParams(params);
  }, [debouncedQuery, filters, setSearchParams]);

  // Search API call
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery(
    ["search", debouncedQuery, filters, currentPage, pageSize, sortBy],
    async () => {
      if (
        !debouncedQuery &&
        !filters.genre &&
        !filters.author &&
        !filters.year
      ) {
        // Return recent books if no search query
        return apiService.getAllBooks({
          page: currentPage,
          limit: pageSize,
          ...filters,
        });
      }

      if (debouncedQuery) {
        // Semantic search
        const results = await apiService.searchBooks(debouncedQuery);
        return {
          books: results.data.results || [],
          pagination: {
            total: results.data.results?.length || 0,
            page: currentPage,
            pages: Math.ceil((results.data.results?.length || 0) / pageSize),
          },
        };
      }

      // Filtered search
      return apiService.getAllBooks({
        page: currentPage,
        limit: pageSize,
        ...filters,
      });
    },
    {
      enabled: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      keepPreviousData: true,
    }
  );

  // Get genres for filter
  const { data: analyticsData } = useQuery(
    "analytics",
    () => apiService.getAnalytics(),
    { staleTime: 10 * 60 * 1000 }
  );

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (value.trim()) {
      userPreferences.addToSearchHistory(value);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      genre: "",
      author: "",
      year: "",
      minPages: 0,
      maxPages: 1000,
    });
    setSearchQuery("");
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
  };

  // Process results with semantic highlighting
  const processedResults =
    searchResults?.books?.map((book) => ({
      ...book,
      highlightedTitle: debouncedQuery
        ? semanticUtils.highlightSemanticTerms(book.title, debouncedQuery)
        : book.title,
      highlightedDescription: debouncedQuery
        ? semanticUtils.highlightSemanticTerms(book.description, debouncedQuery)
        : book.description,
      relevanceScore: debouncedQuery
        ? semanticUtils.calculateRelevanceScore(book, debouncedQuery)
        : 0,
    })) || [];

  // Sort results
  const sortedResults = [...processedResults].sort((a, b) => {
    switch (sortBy) {
      case "relevance":
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      case "title":
        return a.title.localeCompare(b.title);
      case "author":
        return a.author.localeCompare(b.author);
      case "year":
        return (b.publication_year || 0) - (a.publication_year || 0);
      case "pages":
        return (b.page_count || 0) - (a.page_count || 0);
      default:
        return 0;
    }
  });

  // Paginate results
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Container>
      <SearchContainer>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Search
              placeholder="Cari buku berdasarkan judul, penulis, genre, atau deskripsi..."
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              style={{ borderRadius: "12px" }}
              prefix={<SearchOutlined />}
            />
          </Col>
        </Row>

        {/* Search History */}
        {searchHistory.length > 0 && !debouncedQuery && (
          <SearchHistory>
            <Text type="secondary">
              <HistoryOutlined /> Pencarian Terakhir:
            </Text>
            <div style={{ marginTop: "8px" }}>
              {searchHistory.slice(0, 5).map((query, index) => (
                <HistoryTag
                  key={index}
                  onClick={() => handleHistoryClick(query)}
                >
                  {query}
                </HistoryTag>
              ))}
            </div>
          </SearchHistory>
        )}

        {/* Semantic Information */}
        {debouncedQuery && (
          <SemanticInfo
            message="Pencarian Semantik Aktif"
            description={`Mencari dengan pemahaman konteks untuk "${debouncedQuery}". Hasil mencakup sinonim dan konsep terkait.`}
            type="info"
            showIcon
          />
        )}
      </SearchContainer>

      <Row gutter={[24, 24]}>
        {/* Filter Sidebar */}
        <Col xs={24} lg={6}>
          <FilterSidebar
            title={
              <>
                <FilterOutlined /> Filter Pencarian
              </>
            }
          >
            <Collapse defaultActiveKey={["genre", "year"]} ghost>
              <Panel header="Genre" key="genre">
                <Select
                  placeholder="Pilih genre"
                  value={filters.genre}
                  onChange={(value) => handleFilterChange("genre", value)}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {analyticsData?.genres?.map((genre) => (
                    <Option key={genre.genre} value={genre.genre}>
                      {genre.genre} ({genre.count})
                    </Option>
                  ))}
                </Select>
              </Panel>

              <Panel header="Penulis" key="author">
                <Select
                  placeholder="Pilih penulis"
                  value={filters.author}
                  onChange={(value) => handleFilterChange("author", value)}
                  style={{ width: "100%" }}
                  allowClear
                  showSearch
                >
                  {analyticsData?.authors?.map((author) => (
                    <Option key={author.author} value={author.author}>
                      {author.author} ({author.book_count})
                    </Option>
                  ))}
                </Select>
              </Panel>

              <Panel header="Tahun Terbit" key="year">
                <Select
                  placeholder="Pilih tahun"
                  value={filters.year}
                  onChange={(value) => handleFilterChange("year", value)}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {Array.from({ length: 25 }, (_, i) => 2024 - i).map(
                    (year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    )
                  )}
                </Select>
              </Panel>

              <Panel header="Jumlah Halaman" key="pages">
                <Slider
                  range
                  min={0}
                  max={1000}
                  value={[filters.minPages, filters.maxPages]}
                  onChange={([min, max]) => {
                    handleFilterChange("minPages", min);
                    handleFilterChange("maxPages", max);
                  }}
                  tooltip={{ formatter: (value) => `${value} hal` }}
                />
                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <Text type="secondary">
                    {filters.minPages} - {filters.maxPages} halaman
                  </Text>
                </div>
              </Panel>
            </Collapse>

            <div style={{ marginTop: "16px" }}>
              <Button block icon={<ClearOutlined />} onClick={clearFilters}>
                Hapus Filter
              </Button>
            </div>
          </FilterSidebar>
        </Col>

        {/* Results */}
        <Col xs={24} lg={18}>
          <ResultsHeader>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {debouncedQuery
                  ? `Hasil untuk "${debouncedQuery}"`
                  : "Semua Buku"}
              </Title>
              <Text type="secondary">
                {isLoading
                  ? "Mencari..."
                  : `${searchResults?.pagination?.total || 0} buku ditemukan`}
              </Text>
            </div>

            <Space>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 150 }}
              >
                <Option value="relevance">Relevansi</Option>
                <Option value="title">Judul</Option>
                <Option value="author">Penulis</Option>
                <Option value="year">Tahun Terbaru</Option>
                <Option value="pages">Jumlah Halaman</Option>
              </Select>

              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="grid">
                  <AppstoreOutlined />
                </Radio.Button>
                <Radio.Button value="list">
                  <BarsOutlined />
                </Radio.Button>
              </Radio.Group>
            </Space>
          </ResultsHeader>

          {/* Loading */}
          {isLoading && (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>
                <Text>Mencari buku...</Text>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert
              message="Terjadi Kesalahan"
              description="Gagal mengambil data. Silakan coba lagi."
              type="error"
              showIcon
            />
          )}

          {/* No Results */}
          {!isLoading && !error && paginatedResults.length === 0 && (
            <NoResults>
              <Empty
                description={
                  debouncedQuery
                    ? `Tidak ada buku yang ditemukan untuk "${debouncedQuery}"`
                    : "Tidak ada buku yang tersedia"
                }
              />
              {debouncedQuery && (
                <div style={{ marginTop: "16px" }}>
                  <Text type="secondary">
                    Coba gunakan kata kunci yang berbeda atau hapus filter
                    pencarian
                  </Text>
                </div>
              )}
            </NoResults>
          )}

          {/* Results */}
          {!isLoading && !error && paginatedResults.length > 0 && (
            <AnimatePresence>
              <Grid minWidth="280px">
                {paginatedResults.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <BookCard
                      book={book}
                      showSemanticInfo={!!debouncedQuery}
                      onClick={() => navigate(`/books/${book.id}`)}
                    />
                  </motion.div>
                ))}
              </Grid>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {!isLoading && !error && paginatedResults.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={sortedResults.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} dari ${total} buku`
                }
                pageSizeOptions={["12", "24", "48"]}
              />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPage;
