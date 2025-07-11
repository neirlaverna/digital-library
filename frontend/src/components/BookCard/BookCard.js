// frontend/src/components/BookCard/BookCard.js
import React, { useState } from "react";
import { Card, Tag, Rate, Button, Tooltip, Modal } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  BookOutlined,
  EyeOutlined,
  ShareAltOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import LazyLoad from "react-lazyload";
import { userPreferences, apiService } from "../../services/apiService";

const StyledCard = styled(motion.div)`
  .ant-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
    }
  }

  .ant-card-cover {
    position: relative;
    overflow: hidden;
    border-radius: 15px 15px 0 0;
  }

  .ant-card-body {
    padding: 16px;
  }
`;

const CoverImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const BookTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

const BookAuthor = styled.p`
  color: #666;
  font-size: 14px;
  margin: 4px 0;
  font-weight: 500;
`;

const BookDescription = styled.p`
  color: #888;
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin: 8px 0;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const GenreTag = styled(Tag)`
  border-radius: 12px;
  font-size: 11px;
  padding: 2px 8px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
`;

const OverlayActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${StyledCard}:hover & {
    opacity: 1;
  }
`;

const SemanticInfo = styled.div`
  margin: 8px 0;
  padding: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 3px solid #667eea;
`;

const RecommendationReason = styled.div`
  font-size: 11px;
  color: #667eea;
  font-style: italic;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
`;

const BookCard = ({
  book,
  showRecommendationReason = false,
  showSemanticInfo = false,
  onClick,
}) => {
  const [isFavorite, setIsFavorite] = useState(
    userPreferences.getFavoriteBooks().includes(book.id)
  );
  const [userRating, setUserRating] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    const newFavorites = userPreferences.toggleFavorite(book.id);
    setIsFavorite(newFavorites.includes(book.id));
  };

  const handleRating = (value) => {
    setUserRating(value);
    apiService.rateBook(book.id, value).catch(console.error);
  };

  const handleAddToReadingList = (e) => {
    e.stopPropagation();
    userPreferences.addToReadingList(book.id);
    Modal.success({
      title: "Berhasil!",
      content: `"${book.title}" telah ditambahkan ke daftar bacaan Anda.`,
    });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Baca "${book.title}" oleh ${book.author}`,
        url: window.location.origin + `/books/${book.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        window.location.origin + `/books/${book.id}`
      );
      Modal.info({
        title: "Link Disalin!",
        content: "Link buku telah disalin ke clipboard.",
      });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  return (
    <StyledCard
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onClick || (() => {})}
    >
      <Card
        hoverable
        cover={
          <div style={{ position: "relative" }}>
            <LazyLoad height={200} offset={100}>
              <CoverImage
                src={book.cover_url || book.cover}
                alt={book.title}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(
                    book.title
                  )}`;
                }}
              />
            </LazyLoad>

            <OverlayActions>
              <Tooltip
                title={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
              >
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleFavoriteToggle}
                  style={{
                    background: isFavorite
                      ? "#ff4d4f"
                      : "rgba(255, 255, 255, 0.8)",
                    color: isFavorite ? "white" : "#333",
                    border: "none",
                  }}
                />
              </Tooltip>

              <Tooltip title="Tambah ke daftar bacaan">
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<BookOutlined />}
                  onClick={handleAddToReadingList}
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    color: "#333",
                    border: "none",
                  }}
                />
              </Tooltip>

              <Tooltip title="Bagikan">
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    color: "#333",
                    border: "none",
                  }}
                />
              </Tooltip>
            </OverlayActions>
          </div>
        }
        bodyStyle={{ padding: "16px" }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "8px",
            }}
          >
            <GenreTag>{book.genre}</GenreTag>
            <span style={{ fontSize: "12px", color: "#999" }}>
              {book.publication_year} • {book.page_count} hal
            </span>
          </div>

          <BookTitle>{book.title}</BookTitle>
          <BookAuthor>oleh {book.author}</BookAuthor>

          {book.publisher && (
            <div
              style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}
            >
              {book.publisher}
            </div>
          )}

          <BookDescription>{book.description}</BookDescription>

          {showSemanticInfo && book.semantic_entities && (
            <SemanticInfo>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                Entitas Semantik:
              </div>
              {book.semantic_entities.topics &&
                book.semantic_entities.topics.length > 0 && (
                  <div style={{ fontSize: "10px" }}>
                    <strong>Topik:</strong>{" "}
                    {book.semantic_entities.topics.join(", ")}
                  </div>
                )}
            </SemanticInfo>
          )}

          {showRecommendationReason && book.recommendation_reason && (
            <RecommendationReason>
              💡 {book.recommendation_reason}
            </RecommendationReason>
          )}

          <CardActions>
            <Rate
              size="small"
              value={userRating}
              onChange={handleRating}
              style={{ fontSize: "14px" }}
            />

            <ActionButtons>
              <Link to={`/books/${book.id}`}>
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  style={{
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    border: "none",
                    borderRadius: "6px",
                  }}
                >
                  Detail
                </Button>
              </Link>
            </ActionButtons>
          </CardActions>

          {book.similarity_score && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "11px",
                color: "#667eea",
                textAlign: "center",
              }}
            >
              Similarity: {(book.similarity_score * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </Card>
    </StyledCard>
  );
};

export default BookCard;
