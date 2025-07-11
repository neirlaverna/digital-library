// frontend/src/pages/BookDetailPage.js
import React, { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Rate,
  Button,
  Tag,
  Space,
  Divider,
  Card,
  Breadcrumb,
  Modal,
  message,
  Spin,
  Alert,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  BookOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Container, Grid } from "../styles/GlobalStyle";
import BookCard from "../components/BookCard/BookCard";
import { apiService, userPreferences } from "../services/apiService";

const { Title, Paragraph, Text } = Typography;

const BookDetailContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  margin-bottom: 32px;
`;

const BookCover = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  height: 40px;
  font-weight: 600;

  &.primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    border: none;

    &:hover {
      background: linear-gradient(45deg, #5a6fd8, #6a4190);
    }
  }
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;

  .anticon {
    color: #667eea;
  }
`;

const SemanticSection = styled(Card)`
  margin: 24px 0;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);

  .ant-card-head {
    background: linear-gradient(
      45deg,
      rgba(102, 126, 234, 0.1),
      rgba(118, 75, 162, 0.1)
    );
    border-radius: 12px 12px 0 0;
  }
`;

const RelatedBooksSection = styled.section`
  margin-top: 48px;
`;

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch book details
  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => apiService.getBookById(id),
    onSuccess: (data) => {
      setIsFavorite(userPreferences.getFavoriteBooks().includes(parseInt(id)));
    },
    enabled: !!id,
  });

  // Fetch recommendations based on this book
  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", id],
    queryFn: () =>
      apiService.getRecommendations({ type: "content", bookId: id }),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleFavoriteToggle = () => {
    const newFavorites = userPreferences.toggleFavorite(parseInt(id));
    setIsFavorite(newFavorites.includes(parseInt(id)));
    message.success(
      isFavorite ? "Dihapus dari favorit" : "Ditambahkan ke favorit"
    );
  };

  const handleAddToReadingList = () => {
    userPreferences.addToReadingList(parseInt(id));
    message.success("Ditambahkan ke daftar bacaan");
  };

  const handleRating = (value) => {
    setUserRating(value);
    apiService.rateBook(id, value);
    message.success(`Terima kasih! Anda memberikan rating ${value} bintang`);
  };

  const handleShare = () => {
    const shareData = {
      title: book?.title,
      text: `Baca "${book?.title}" oleh ${book?.author}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success("Link disalin ke clipboard");
    }
  };

  const handleDownload = () => {
    Modal.info({
      title: "Download Buku",
      content:
        "Fitur download akan segera tersedia. Saat ini Anda dapat membaca buku secara online.",
      okText: "Mengerti",
    });
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text>Memuat detail buku...</Text>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container>
        <Alert
          message="Buku Tidak Ditemukan"
          description="Buku yang Anda cari tidak ditemukan atau terjadi kesalahan."
          type="error"
          showIcon
          action={<Button onClick={handleBack}>Kembali</Button>}
        />
      </Container>
    );
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: "24px" }}>
          <Breadcrumb.Item>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ padding: 0 }}
            >
              Kembali
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Detail Buku</Breadcrumb.Item>
          <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
        </Breadcrumb>

        <BookDetailContainer>
          <Row gutter={[32, 32]}>
            {/* Book Cover */}
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <BookCover
                  src={book.cover_url || book.cover}
                  alt={book.title}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300x400/667eea/ffffff?text=${encodeURIComponent(
                      book.title
                    )}`;
                  }}
                />
              </div>
            </Col>

            {/* Book Information */}
            <Col xs={24} md={16}>
              <div>
                <Tag color="blue" style={{ marginBottom: "16px" }}>
                  {book.genre}
                </Tag>

                <Title
                  level={1}
                  style={{ marginBottom: "8px", lineHeight: 1.2 }}
                >
                  {book.title}
                </Title>

                <Title
                  level={3}
                  style={{
                    color: "#666",
                    marginBottom: "16px",
                    fontWeight: 400,
                  }}
                >
                  oleh {book.author}
                </Title>

                {/* Rating */}
                <div style={{ marginBottom: "24px" }}>
                  <Text strong>Berikan Rating: </Text>
                  <Rate
                    value={userRating}
                    onChange={handleRating}
                    style={{ marginLeft: "8px" }}
                  />
                </div>

                {/* Action Buttons */}
                <Space size="middle" wrap>
                  <ActionButton
                    className="primary"
                    icon={<BookOutlined />}
                    onClick={handleAddToReadingList}
                  >
                    Tambah ke Daftar Bacaan
                  </ActionButton>

                  <ActionButton
                    icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFavoriteToggle}
                    style={{
                      color: isFavorite ? "#ff4d4f" : undefined,
                      borderColor: isFavorite ? "#ff4d4f" : undefined,
                    }}
                  >
                    {isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                  </ActionButton>

                  <ActionButton
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                  >
                    Bagikan
                  </ActionButton>

                  <ActionButton
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                  >
                    Download
                  </ActionButton>
                </Space>

                {/* Meta Information */}
                <MetaInfo>
                  <MetaItem>
                    <UserOutlined />
                    <Text>Penulis: {book.author}</Text>
                  </MetaItem>

                  <MetaItem>
                    <CalendarOutlined />
                    <Text>Tahun Terbit: {book.publication_year}</Text>
                  </MetaItem>

                  <MetaItem>
                    <FileTextOutlined />
                    <Text>Jumlah Halaman: {book.page_count} halaman</Text>
                  </MetaItem>

                  <MetaItem>
                    <TagsOutlined />
                    <Text>Penerbit: {book.publisher}</Text>
                  </MetaItem>

                  {book.isbn && (
                    <MetaItem>
                      <Text>ISBN: {book.isbn}</Text>
                    </MetaItem>
                  )}
                </MetaInfo>
              </div>
            </Col>
          </Row>

          <Divider />

          {/* Description */}
          <div>
            <Title level={3}>Deskripsi</Title>
            <Paragraph style={{ fontSize: "16px", lineHeight: 1.6 }}>
              {book.description}
            </Paragraph>
          </div>

          {/* Semantic Information */}
          {book.semantic_data && (
            <SemanticSection title="Informasi Semantik" size="small">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Text strong>Topik Terkait:</Text>
                  <div style={{ marginTop: "8px" }}>
                    {book.semantic_data.entities?.topics?.map(
                      (topic, index) => (
                        <Tag key={index} color="blue" style={{ margin: "2px" }}>
                          {topic}
                        </Tag>
                      )
                    ) || <Text type="secondary">Tidak ada</Text>}
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <Text strong>Konsep:</Text>
                  <div style={{ marginTop: "8px" }}>
                    {book.semantic_data.entities?.concepts?.map(
                      (concept, index) => (
                        <Tag
                          key={index}
                          color="green"
                          style={{ margin: "2px" }}
                        >
                          {concept}
                        </Tag>
                      )
                    ) || <Text type="secondary">Tidak ada</Text>}
                  </div>
                </Col>
              </Row>
            </SemanticSection>
          )}

          {/* Semantic Relations */}
          {book.semantic_relations && book.semantic_relations.length > 0 && (
            <div>
              <Title level={3}>Relasi Semantik</Title>
              <Row gutter={[16, 16]}>
                {book.semantic_relations.map((relation, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <Card
                      size="small"
                      hoverable
                      cover={
                        <img
                          src={relation.cover_url}
                          alt={relation.title}
                          style={{ height: "120px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/200x120/667eea/ffffff?text=${encodeURIComponent(
                              relation.title
                            )}`;
                          }}
                        />
                      }
                      onClick={() => navigate(`/books/${relation.id}`)}
                    >
                      <Card.Meta
                        title={<Text ellipsis>{relation.title}</Text>}
                        description={
                          <div>
                            <Text type="secondary" ellipsis>
                              {relation.author}
                            </Text>
                            <br />
                            <Tag color="orange" size="small">
                              {relation.predicate} (
                              {Math.round(relation.confidence_score * 100)}%)
                            </Tag>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </BookDetailContainer>

        {/* Related Books Recommendations */}
        {recommendations &&
          recommendations.recommendations &&
          recommendations.recommendations.length > 0 && (
            <RelatedBooksSection>
              <Title level={2} style={{ marginBottom: "24px" }}>
                Buku Serupa yang Mungkin Anda Suka
              </Title>
              <Grid minWidth="280px">
                {recommendations.recommendations
                  .slice(0, 6)
                  .map((relatedBook) => (
                    <motion.div
                      key={relatedBook.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <BookCard
                        book={relatedBook}
                        showRecommendationReason={true}
                        onClick={() => navigate(`/books/${relatedBook.id}`)}
                      />
                    </motion.div>
                  ))}
              </Grid>
            </RelatedBooksSection>
          )}
      </motion.div>
    </Container>
  );
};

export default BookDetailPage;
