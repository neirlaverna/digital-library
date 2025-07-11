// frontend/src/pages/AnalyticsPage.js
import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Select,
  DatePicker,
  Spin,
  Empty,
  Table,
  Progress,
  Tag,
} from "antd";
import {
  BarChartOutlined,
  BookOutlined,
  UserOutlined,
  SearchOutlined,
  TrophyOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useQuery } from "react-query";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Container } from "../styles/GlobalStyle";
import { apiService } from "../services/apiService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AnalyticsContainer = styled.div`
  padding: 24px 0;
`;

const StatCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
  }

  .ant-statistic-title {
    color: #666;
    font-weight: 600;
  }

  .ant-statistic-content {
    color: #333;
  }
`;

const ChartCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  margin-bottom: 24px;

  .ant-card-head {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 15px 15px 0 0;
  }
`;

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
];

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery(
    ["analytics", dateRange, selectedMetric],
    () => apiService.getAnalytics(),
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text>Memuat data analitik...</Text>
          </div>
        </div>
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container>
        <Empty description="Data analitik tidak tersedia" />
      </Container>
    );
  }

  // Process data for charts
  const genreData =
    analyticsData.genres?.map((genre, index) => ({
      name: genre.genre,
      value: genre.count,
      color: COLORS[index % COLORS.length],
    })) || [];

  const authorData =
    analyticsData.authors?.slice(0, 10).map((author) => ({
      name:
        author.author.length > 15
          ? author.author.substring(0, 15) + "..."
          : author.author,
      books: author.book_count,
    })) || [];

  const searchTrendsData =
    analyticsData.searchTrends?.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      }),
      searches: trend.search_count,
      users: trend.unique_users,
    })) || [];

  const interactionData =
    analyticsData.interactions?.map((interaction) => ({
      type: interaction.interaction_type,
      count: interaction.count,
    })) || [];

  // Calculate totals
  const totalBooks = genreData.reduce((sum, genre) => sum + genre.value, 0);
  const totalAuthors = analyticsData.authors?.length || 0;
  const totalSearches = searchTrendsData.reduce(
    (sum, trend) => sum + trend.searches,
    0
  );
  const totalInteractions = interactionData.reduce(
    (sum, interaction) => sum + interaction.count,
    0
  );

  // Table columns for top books
  const topBooksColumns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 60,
      render: (rank) => (
        <span
          style={{ fontWeight: "bold", color: rank <= 3 ? "#667eea" : "#666" }}
        >
          #{rank}
        </span>
      ),
    },
    {
      title: "Judul Buku",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Penulis",
      dataIndex: "author",
      key: "author",
      ellipsis: true,
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
      render: (genre) => <Tag color="blue">{genre}</Tag>,
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      sorter: (a, b) => a.views - b.views,
      render: (views) => (
        <span>
          <EyeOutlined style={{ marginRight: 4 }} />
          {views || 0}
        </span>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <span>{rating ? `⭐ ${rating.toFixed(1)}` : "Belum ada"}</span>
      ),
    },
  ];

  // Mock data for top books (in real app, this would come from API)
  const topBooksData = [
    {
      rank: 1,
      title: "Mahir Web Semantic",
      author: "Prof. Dhema Subagja",
      genre: "Techno",
      views: 156,
      rating: 4.8,
    },
    {
      rank: 2,
      title: "Database untuk Industri Masa Kini",
      author: "Dr. Syeh Yunautama",
      genre: "Informatics",
      views: 142,
      rating: 4.6,
    },
    {
      rank: 3,
      title: "Mahir Pemrograman Web",
      author: "Dr. Syeh Yunautama",
      genre: "Informatics",
      views: 128,
      rating: 4.5,
    },
    {
      rank: 4,
      title: "UI/UX bagi programmer pemula",
      author: "Dr. Syeh Yunautama",
      genre: "Informatics",
      views: 98,
      rating: 4.3,
    },
    {
      rank: 5,
      title: "Mahir Algoritma Pemrograman",
      author: "Dr. Purnama Bagja",
      genre: "Informatics",
      views: 87,
      rating: 4.2,
    },
  ];

  return (
    <Container>
      <AnalyticsContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "32px" }}
          >
            <Col>
              <Title level={1}>
                <BarChartOutlined /> Analytics Dashboard
              </Title>
              <Text type="secondary">
                Analisis data dan statistik perpustakaan digital
              </Text>
            </Col>
            <Col>
              <RangePicker
                onChange={setDateRange}
                placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
              />
            </Col>
          </Row>

          {/* Key Metrics */}
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Total Buku"
                  value={totalBooks}
                  prefix={<BookOutlined style={{ color: "#667eea" }} />}
                  suffix="buku"
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Total Penulis"
                  value={totalAuthors}
                  prefix={<UserOutlined style={{ color: "#667eea" }} />}
                  suffix="penulis"
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Total Pencarian"
                  value={totalSearches}
                  prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                  suffix="pencarian"
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Total Interaksi"
                  value={totalInteractions}
                  prefix={<RiseOutlined style={{ color: "#667eea" }} />}
                  suffix="interaksi"
                />
              </StatCard>
            </Col>
          </Row>

          {/* Charts Row 1 */}
          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            {/* Genre Distribution */}
            <Col xs={24} lg={12}>
              <ChartCard title="Distribusi Genre Buku">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Author Distribution */}
            <Col xs={24} lg={12}>
              <ChartCard title="Top 10 Penulis Berdasarkan Jumlah Buku">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={authorData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="books" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>

          {/* Charts Row 2 */}
          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            {/* Search Trends */}
            <Col xs={24} lg={16}>
              <ChartCard title="Tren Pencarian (30 Hari Terakhir)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={searchTrendsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="searches"
                      stroke="#667eea"
                      strokeWidth={3}
                      name="Total Pencarian"
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#764ba2"
                      strokeWidth={3}
                      name="Unique Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* User Interactions */}
            <Col xs={24} lg={8}>
              <ChartCard title="Jenis Interaksi User">
                <div style={{ padding: "20px 0" }}>
                  {interactionData.map((interaction, index) => (
                    <div
                      key={interaction.type}
                      style={{ marginBottom: "16px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <Text>{interaction.type}</Text>
                        <Text strong>{interaction.count}</Text>
                      </div>
                      <Progress
                        percent={Math.round(
                          (interaction.count / totalInteractions) * 100
                        )}
                        strokeColor={COLORS[index % COLORS.length]}
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </ChartCard>
            </Col>
          </Row>

          {/* Top Books Table */}
          <Row>
            <Col span={24}>
              <ChartCard
                title={
                  <>
                    <TrophyOutlined /> Top Buku Berdasarkan Views
                  </>
                }
              >
                <Table
                  columns={topBooksColumns}
                  dataSource={topBooksData}
                  pagination={false}
                  size="middle"
                  rowKey="rank"
                />
              </ChartCard>
            </Col>
          </Row>

          {/* Performance Metrics */}
          <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
            <Col xs={24} md={8}>
              <StatCard>
                <Statistic
                  title="Rata-rata Rating"
                  value={4.5}
                  precision={1}
                  prefix="⭐"
                  suffix="/ 5.0"
                />
              </StatCard>
            </Col>
            <Col xs={24} md={8}>
              <StatCard>
                <Statistic
                  title="Genre Terpopuler"
                  value={genreData[0]?.name || "N/A"}
                  prefix={<TagsOutlined style={{ color: "#667eea" }} />}
                />
              </StatCard>
            </Col>
            <Col xs={24} md={8}>
              <StatCard>
                <Statistic
                  title="Penulis Terpopuler"
                  value={authorData[0]?.name || "N/A"}
                  prefix={<UserOutlined style={{ color: "#667eea" }} />}
                />
              </StatCard>
            </Col>
          </Row>
        </motion.div>
      </AnalyticsContainer>
    </Container>
  );
};

export default AnalyticsPage;
