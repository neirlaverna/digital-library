// frontend/src/pages/HomePage.js
import React, { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Statistic,
  Card,
  Tag,
  Space,
  Spin,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  SearchOutlined,
  BulbOutlined,
  RightOutlined,
  SyncOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Container, Grid, GradientButton } from "../styles/GlobalStyle";
import BookCard from "../components/BookCard/BookCard";
import { apiService } from "../services/apiService";

const { Title, Paragraph } = Typography;

const HeroSection = styled.section`
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1),
    rgba(118, 75, 162, 0.1)
  );
  border-radius: 20px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatsSection = styled.section`
  margin: 40px 0;
`;

const StatsCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0 20px 0;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
  }
`;

const GenreTag = styled(Tag)`
  margin: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const FloatingButton = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const HomePage = () => {
  const [syncLoading, setSyncLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch data
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ["recent-books"],
    queryFn: () => apiService.getAllBooks({ limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: recommendationsData, isLoading: recommendationsLoading } =
    useQuery({
      queryKey: ["home-recommendations"],
      queryFn: () =>
        apiService.getRecommendations({ type: "popular", limit: 6 }),
      staleTime: 5 * 60 * 1000,
    });

  const { data: analyticsData } = useQuery({
    queryKey: ["home-analytics"],
    queryFn: () => apiService.getAnalytics(),
    staleTime: 10 * 60 * 1000,
  });

  const handleSyncData = async () => {
    setSyncLoading(true);
    try {
      await apiService.syncData();
      window.location.reload(); // Refresh untuk melihat data baru
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncLoading(false);
    }
  };

  const features = [
    {
      icon: <SearchOutlined style={{ fontSize: "32px", color: "#667eea" }} />,
      title: "Pencarian Semantik",
      description:
        "Cari buku dengan pemahaman konteks dan makna yang lebih baik",
      path: "/search",
    },
    {
      icon: <BulbOutlined style={{ fontSize: "32px", color: "#667eea" }} />,
      title: "Rekomendasi Cerdas",
      description:
        "Dapatkan rekomendasi buku yang dipersonalisasi berdasarkan preferensi Anda",
      path: "/recommendations",
    },
    {
      icon: <BookOutlined style={{ fontSize: "32px", color: "#667eea" }} />,
      title: "Knowledge Graph",
      description: "Jelajahi hubungan antar buku, penulis, dan topik",
      path: "/knowledge-graph",
    },
  ];

  const popularGenres = analyticsData?.genres?.slice(0, 8) || [];

  return (
    <Container>
      {/* Hero Section */}
      <HeroSection>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title level={1} style={{ color: "#333", marginBottom: "16px" }}>
            Selamat Datang di{" "}
            <span className="gradient-text">Perpustakaan Digital</span>
          </Title>
          <Paragraph
            style={{
              fontSize: "18px",
              color: "#666",
              maxWidth: "600px",
              margin: "0 auto 32px auto",
            }}
          >
            Platform perpustakaan digital yang menggunakan teknologi Web
            Semantik untuk memberikan pengalaman pencarian dan rekomendasi yang
            lebih cerdas dan personal.
          </Paragraph>
          <Space size="large">
            <GradientButton onClick={() => navigate("/search")}>
              <SearchOutlined /> Mulai Pencarian
            </GradientButton>
            <Button size="large" onClick={() => navigate("/recommendations")}>
              <BulbOutlined /> Lihat Rekomendasi
            </Button>
          </Space>
        </motion.div>
      </HeroSection>

      {/* Statistics */}
      {analyticsData && (
        <StatsSection>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <StatsCard>
                <Statistic
                  title="Total Buku"
                  value={
                    analyticsData.genres?.reduce(
                      (sum, g) => sum + g.count,
                      0
                    ) || 0
                  }
                  prefix={<BookOutlined style={{ color: "#667eea" }} />}
                />
              </StatsCard>
            </Col>
            <Col xs={24} sm={6}>
              <StatsCard>
                <Statistic
                  title="Genre"
                  value={analyticsData.genres?.length || 0}
                  prefix={<TagsOutlined style={{ color: "#667eea" }} />}
                />
              </StatsCard>
            </Col>
            <Col xs={24} sm={6}>
              <StatsCard>
                <Statistic
                  title="Penulis"
                  value={analyticsData.authors?.length || 0}
                  prefix={<UserOutlined style={{ color: "#667eea" }} />}
                />
              </StatsCard>
            </Col>
            <Col xs={24} sm={6}>
              <StatsCard>
                <Statistic
                  title="Pencarian"
                  value={
                    analyticsData.searchTrends?.reduce(
                      (sum, s) => sum + s.search_count,
                      0
                    ) || 0
                  }
                  prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                />
              </StatsCard>
            </Col>
          </Row>
        </StatsSection>
      )}

      {/* Features */}
      <section>
        <SectionHeader>
          <Title level={2}>Fitur Unggulan</Title>
        </SectionHeader>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} md={8} key={index}>
              <FeatureCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                onClick={() => navigate(feature.path)}
                whileHover={{ y: -8 }}
              >
                <div style={{ marginBottom: "16px" }}>{feature.icon}</div>
                <Title level={4} style={{ marginBottom: "12px" }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ color: "#666" }}>
                  {feature.description}
                </Paragraph>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </section>

      {/* Popular Genres */}
      {popularGenres.length > 0 && (
        <section>
          <SectionHeader>
            <Title level={2}>Genre Populer</Title>
          </SectionHeader>
          <div style={{ textAlign: "center" }}>
            {popularGenres.map((genre, index) => (
              <GenreTag
                key={index}
                onClick={() =>
                  navigate(`/search?genre=${encodeURIComponent(genre.genre)}`)
                }
              >
                {genre.genre} ({genre.count})
              </GenreTag>
            ))}
          </div>
        </section>
      )}

      {/* Latest Books */}
      <section>
        <SectionHeader>
          <Title level={2}>Buku Terbaru</Title>
          <Link to="/search">
            <Button type="link" icon={<RightOutlined />}>
              Lihat Semua
            </Button>
          </Link>
        </SectionHeader>

        {booksLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Grid minWidth="280px">
            {booksData?.books?.slice(0, 8).map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/books/${book.id}`)}
              />
            ))}
          </Grid>
        )}
      </section>

      {/* Recommendations */}
      <section>
        <SectionHeader>
          <Title level={2}>Rekomendasi untuk Anda</Title>
          <Link to="/recommendations">
            <Button type="link" icon={<RightOutlined />}>
              Lihat Semua
            </Button>
          </Link>
        </SectionHeader>

        {recommendationsLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Grid minWidth="280px">
            {recommendationsData?.recommendations?.slice(0, 6).map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showRecommendationReason={true}
                onClick={() => navigate(`/books/${book.id}`)}
              />
            ))}
          </Grid>
        )}
      </section>

      {/* Floating Action Button */}
      <FloatingButton
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<SyncOutlined spin={syncLoading} />}
          onClick={handleSyncData}
          loading={syncLoading}
          style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(45deg, #667eea, #764ba2)",
            border: "none",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
          }}
          title="Sinkronisasi Data"
        />
      </FloatingButton>
    </Container>
  );
};

export default HomePage;
