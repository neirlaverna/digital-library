// frontend/src/pages/RecommendationsPage.js
import React, { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Tabs,
  Card,
  Button,
  Select,
  Empty,
  Spin,
  Alert,
  Space,
} from "antd";
import {
  BulbOutlined,
  UserOutlined,
  BookOutlined,
  FireOutlined,
  HeartOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useQuery } from "react-query";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Container, Grid } from "../styles/GlobalStyle";
import BookCard from "../components/BookCard/BookCard";
import { apiService, userPreferences } from "../services/apiService";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const RecommendationContainer = styled.div`
  padding: 24px 0;
`;

const TabContent = styled.div`
  margin-top: 24px;
`;

const AlgorithmCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  margin-bottom: 24px;
`;

const RecommendationsPage = () => {
  const [activeTab, setActiveTab] = useState("hybrid");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const navigate = useNavigate();

  // Get user preferences
  const favoriteBooks = userPreferences.getFavoriteBooks();
  const readingList = userPreferences.getReadingList();

  // Fetch recommendations based on active tab
  const { data: recommendations, isLoading, error } = useQuery(
    ["recommendations", activeTab, selectedBookId],
    () => {
      const params = { type: activeTab };
      if (selectedBookId && activeTab === "content") {
        params.bookId = selectedBookId;
      }
      return apiService.getRecommendations(params);
    },
    {
      staleTime: 5 * 60 * 1000,
      enabled: activeTab !== "content" || selectedBookId !== null,
    }
  );

  // Fetch books for content-based selection
  const { data: allBooks } = useQuery(
    "all-books-for-recommendations",
    () => apiService.getAllBooks({ limit: 100 }),
    { staleTime: 10 * 60 * 1000 }
  );

  const renderAlgorithmInfo = () => {
    const algorithmInfo = {
      content: {
        title: "Content-Based Filtering",
        icon: <BookOutlined />,
        description: "Merekomendasikan buku berdasarkan kemiripan konten dengan buku yang Anda pilih",
        features: ["Analisis genre", "Kemiripan penulis", "Penerbit yang sama", "Tahun terbit berdekatan"],
        color: "#52c41a"
      },
      collaborative: {
        title: "Collaborative Filtering", 
        icon: <UserOutlined />,
        description: "Merekomendasikan buku berdasarkan preferensi pengguna dengan minat serupa",
        features: ["Rating pengguna", "Perilaku serupa", "Pola interaksi", "Komunitas pembaca"],
        color: "#1890ff"
      },
      hybrid: {
        title: "Hybrid Recommendation",
        icon: <RobotOutlined />,
        description: "Kombinasi terbaik dari content-based dan collaborative filtering",
        features: ["Akurasi tinggi", "Personalisasi", "Mengatasi cold start", "Beragam rekomendasi"],
        color: "#722ed1"
      },
      popular: {
        title: "Popular Books",
        icon: <FireOutlined />,
        description: "Buku-buku populer berdasarkan interaksi dan rating pengguna",
        features: ["Trending", "Rating tinggi", "Banyak dilihat", "Favorit komunitas"],
        color: "#fa541c"
      }
    };

    const info = algorithmInfo[activeTab];
    return (
      <AlgorithmCard>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "24px", color: info.color, marginRight: "12px" }}>
            {info.icon}
          </div>
          <Title level={4} style={{ margin: 0 }}>
            {info.title}
          </Title>
        </div>
        <Paragraph style={{ marginBottom: "16px" }}>
          {info.description}
        </Paragraph>
        <Space wrap>
          {info.features.map((feature, index) => (
            <span key={index} style={{
              background: `${info.color}20`,
              color: info.color,
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500"
            }}>
              {feature}
            </span>
          ))}
        </Space>
      </AlgorithmCard>
    );
  };

  const renderContentBasedSelector = () => {
    if (activeTab !== "content") return null;

    return (
      <Card style={{ marginBottom: "24px" }}>
        <Title level={5}>Pilih buku sebagai referensi:</Title>
        <Select
          placeholder="Pilih buku untuk mendapatkan rekomendasi serupa"
          style={{ width: "100%" }}
          value={selectedBookId}
          onChange={setSelectedBookId}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {allBooks?.books?.map((book) => (
            <Option key={book.id} value={book.id}>
              {book.title} - {book.author}
            </Option>
          ))}
        </Select>
      </Card>
    );
  };

  const renderRecommendations = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Paragraph>Menganalisis preferensi Anda...</Paragraph>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Gagal Memuat Rekomendasi"
          description="Terjadi kesalahan saat mengambil rekomendasi. Silakan coba lagi."
          type="error"
          showIcon
        />
      );
    }

    if (!recommendations?.recommendations?.length) {
      return (
        <Empty
          description={
            activeTab === "content" && !selectedBookId
              ? "Pilih buku terlebih dahulu untuk mendapatkan rekomendasi"
              : "Belum ada rekomendasi tersedia"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <Grid minWidth="280px">
        {recommendations.recommendations.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <BookCard
              book={book}
              showRecommendationReason={true}
              onClick={() => navigate(`/books/${book.id}`)}
            />
          </motion.div>
        ))}
      </Grid>
    );
  };

  return (
    <Container>
      <RecommendationContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={1}>
              <BulbOutlined /> Rekomendasi untuk Anda
            </Title>
            <Paragraph style={{ fontSize: "16px", color: "#666" }}>
              Temukan buku-buku menarik berdasarkan preferensi dan aktivitas Anda
            </Paragraph>
          </div>

          {/* User Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
            <Col xs={24} sm={8}>
              <Card style={{ textAlign: "center" }}>
                <HeartOutlined style={{ fontSize: "24px", color: "#f5222d" }} />
                <div style={{ marginTop: "8px" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    {favoriteBooks.length}
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#666" }}>
                    Buku Favorit
                  </Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ textAlign: "center" }}>
                <BookOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
                <div style={{ marginTop: "8px" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    {readingList.length}
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#666" }}>
                    Daftar Bacaan
                  </Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ textAlign: "center" }}>
                <RobotOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
                <div style={{ marginTop: "8px" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    {recommendations?.recommendations?.length || 0}
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#666" }}>
                    Rekomendasi
                  </Paragraph>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Recommendation Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            centered
          >
            <TabPane
              tab={
                <span>
                  <RobotOutlined />
                  Hybrid
                </span>
              }
              key="hybrid"
            >
              <TabContent>
                {renderAlgorithmInfo()}
                {renderRecommendations()}
              </TabContent>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <BookOutlined />
                  Content-Based
                </span>
              }
              key="content"
            >
              <TabContent>
                {renderAlgorithmInfo()}
                {renderContentBasedSelector()}
                {renderRecommendations()}
              </TabContent>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Collaborative
                </span>
              }
              key="collaborative"
            >
              <TabContent>
                {renderAlgorithmInfo()}
                {renderRecommendations()}
              </TabContent>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <FireOutlined />
                  Popular
                </span>
              }
              key="popular"
            >
              <TabContent>
                {renderAlgorithmInfo()}
                {renderRecommendations()}
              </TabContent>
            </TabPane>
          </Tabs>
        </motion.div>
      </RecommendationContainer>
    </Container>
  );
};

export default RecommendationsPage;

// frontend/src/pages/KnowledgeGraphPage.js
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Select,
  Slider,
  Switch,
  Row,
  Col,
  Spin,
  Alert,
  Space,
  Tag,
  Tooltip,
  Modal,
} from "antd";
import {
  ShareAltOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  BookOutlined,
  UserOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useQuery } from "react-query";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import { Container } from "../styles/GlobalStyle";
import { apiService } from "../services/apiService";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const KnowledgeGraphContainer = styled.div`
  padding: 24px 0;
`;

const GraphContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  height: 600px;
  position: relative;
  overflow: hidden;
`;

const ControlPanel = styled(Card)`
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  margin-bottom: 24px;
`;

const GraphSvg = styled.svg`
  width: 100%;
  height: 100%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const NodeInfo = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const KnowledgeGraphPage = () => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [linkDistance, setLinkDistance] = useState(150);
  const [nodeSize, setNodeSize] = useState(8);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef();
  const navigate = useNavigate();

  // Fetch knowledge graph data
  const { data: rawGraphData, isLoading, error } = useQuery(
    "knowledge-graph",
    () => apiService.getKnowledgeGraph(),
    { staleTime: 10 * 60 * 1000 }
  );

  // D3 simulation
  const simulationRef = useRef();

  useEffect(() => {
    if (rawGraphData && svgRef.current) {
      const processedData = processGraphData(rawGraphData);
      setGraphData(processedData);
      initializeGraph(processedData);
    }
  }, [rawGraphData, linkDistance, nodeSize, showLabels, filterType]);

  const processGraphData = (data) => {
    let nodes = [...data.nodes];
    let edges = [...data.edges];

    // Filter by type
    if (filterType !== "all") {
      nodes = nodes.filter(node => node.type === filterType);
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(edge => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
    }

    // Add node properties for visualization
    nodes = nodes.map(node => ({
      ...node,
      radius: nodeSize + (node.properties?.interaction_count || 0) * 2,
      color: getNodeColor(node.type),
    }));

    return { nodes, edges };
  };

  const getNodeColor = (type) => {
    const colors = {
      Book: "#667eea",
      Person: "#52c41a", 
      Genre: "#fa541c",
      Publisher: "#722ed1",
      Topic: "#13c2c2",
    };
    return colors[type] || "#666";
  };

  const initializeGraph = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    const container = svg.append("g");

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.edges)
        .id(d => d.id)
        .distance(linkDistance)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.radius + 5));

    simulationRef.current = simulation;

    // Create links
    const links = container.append("g")
      .selectAll("line")
      .data(data.edges)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create link labels
    const linkLabels = container.append("g")
      .selectAll("text")
      .data(data.edges)
      .enter()
      .append("text")
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none")
      .text(d => d.relation);

    // Create nodes
    const nodes = container.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", handleNodeClick)
      .on("mouseover", handleNodeHover)
      .on("mouseout", handleNodeOut);

    // Create node labels
    const labels = container.append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("fill", "#333")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.radius + 15)
      .style("pointer-events", "none")
      .style("opacity", showLabels ? 1 : 0)
      .text(d => d.label.length > 15 ? d.label.substring(0, 15) + "..." : d.label);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      linkLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

      nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    
    if (node.type === "Book" && node.properties?.id) {
      // Navigate to book detail
      navigate(`/books/${node.properties.id}`);
    }
  };

  const handleNodeHover = (event, node) => {
    // Highlight connected nodes and edges
    const svg = d3.select(svgRef.current);
    
    svg.selectAll("circle")
      .style("opacity", d => 
        d === node || isConnected(d, node) ? 1 : 0.3
      );
      
    svg.selectAll("line")
      .style("opacity", d => 
        d.source === node || d.target === node ? 1 : 0.1
      );
  };

  const handleNodeOut = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("circle").style("opacity", 1);
    svg.selectAll("line").style("opacity", 0.6);
  };

  const isConnected = (node1, node2) => {
    return graphData.edges.some(edge => 
      (edge.source === node1 && edge.target === node2) ||
      (edge.source === node2 && edge.target === node1)
    );
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom().scaleBy, 1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom().scaleBy, 0.67
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom().transform,
      d3.zoomIdentity
    );
    
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getNodeTypeStats = () => {
    const stats = {};
    graphData.nodes.forEach(node => {
      stats[node.type] = (stats[node.type] || 0) + 1;
    });
    return stats;
  };

  const nodeTypeStats = getNodeTypeStats();

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text>Membangun knowledge graph...</Text>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert
          message="Gagal Memuat Knowledge Graph"
          description="Terjadi kesalahan saat mengambil data. Silakan coba lagi."
          type="error"
          showIcon
        />
      </Container>
    );
  }

  return (
    <Container>
      <KnowledgeGraphContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={1}>
              <ShareAltOutlined /> Knowledge Graph
            </Title>
            <Paragraph style={{ fontSize: "16px", color: "#666" }}>
              Visualisasi hubungan semantik antar buku, penulis, genre, dan topik
            </Paragraph>
          </div>

          {/* Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            {Object.entries(nodeTypeStats).map(([type, count]) => (
              <Col xs={12} sm={6} md={4} key={type}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <div style={{ 
                    fontSize: "18px", 
                    color: getNodeColor(type),
                    marginBottom: "4px" 
                  }}>
                    {type === "Book" && <BookOutlined />}
                    {type === "Person" && <UserOutlined />}
                    {type === "Genre" && <TagsOutlined />}
                    {type === "Publisher" && <InfoCircleOutlined />}
                  </div>
                  <Text strong style={{ fontSize: "16px" }}>{count}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {type}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Control Panel */}
          <ControlPanel
            title={
              <Space>
                <SettingOutlined />
                Kontrol Visualisasi
              </Space>
            }
            size="small"
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={6}>
                <Text strong>Filter Tipe:</Text>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: "100%", marginTop: "4px" }}
                  size="small"
                >
                  <Option value="all">Semua</Option>
                  <Option value="Book">Buku</Option>
                  <Option value="Person">Penulis</Option>
                  <Option value="Genre">Genre</Option>
                  <Option value="Publisher">Penerbit</Option>
                </Select>
              </Col>

              <Col xs={24} sm={6}>
                <Text strong>Jarak Link: {linkDistance}</Text>
                <Slider
                  min={50}
                  max={300}
                  value={linkDistance}
                  onChange={setLinkDistance}
                  size="small"
                />
              </Col>

              <Col xs={24} sm={6}>
                <Text strong>Ukuran Node: {nodeSize}</Text>
                <Slider
                  min={4}
                  max={20}
                  value={nodeSize}
                  onChange={setNodeSize}
                  size="small"
                />
              </Col>

              <Col xs={24} sm={6}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>Label: </Text>
                    <Switch
                      checked={showLabels}
                      onChange={setShowLabels}
                      size="small"
                    />
                  </div>
                  <Space size="small">
                    <Tooltip title="Zoom In">
                      <Button 
                        icon={<ZoomInOutlined />} 
                        onClick={handleZoomIn}
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="Zoom Out">
                      <Button 
                        icon={<ZoomOutOutlined />} 
                        onClick={handleZoomOut}
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="Reset">
                      <Button 
                        icon={<ReloadOutlined />} 
                        onClick={handleReset}
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="Fullscreen">
                      <Button 
                        icon={<FullscreenOutlined />} 
                        onClick={handleFullscreen}
                        size="small"
                      />
                    </Tooltip>
                  </Space>
                </Space>
              </Col>
            </Row>
          </ControlPanel>

          {/* Graph Container */}
          <GraphContainer style={{
            height: isFullscreen ? "80vh" : "600px"
          }}>
            <GraphSvg ref={svgRef} />
            
            {/* Node Info Panel */}
            {selectedNode && (
              <NodeInfo>
                <Title level={5} style={{ margin: "0 0 8px 0" }}>
                  {selectedNode.label}
                </Title>
                <Tag color={selectedNode.color}>
                  {selectedNode.type}
                </Tag>
                {selectedNode.properties && (
                  <div style={{ marginTop: "12px" }}>
                    {selectedNode.type === "Book" && (
                      <>
                        <Text type="secondary">Penulis:</Text>
                        <br />
                        <Text>{selectedNode.properties.author}</Text>
                        <br />
                        <Text type="secondary">Genre:</Text>
                        <br />
                        <Text>{selectedNode.properties.genre}</Text>
                      </>
                    )}
                    {selectedNode.properties.interaction_count && (
                      <>
                        <br />
                        <Text type="secondary">Interaksi:</Text>
                        <br />
                        <Text>{selectedNode.properties.interaction_count}</Text>
                      </>
                    )}
                  </div>
                )}
                <Button
                  type="link"
                  size="small"
                  onClick={() => setSelectedNode(null)}
                  style={{ padding: 0, marginTop: "8px" }}
                >
                  Tutup
                </Button>
              </NodeInfo>
            )}

            {/* Zoom indicator */}
            <div style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px"
            }}>
              Zoom: {Math.round(zoom * 100)}%
            </div>
          </GraphContainer>

          {/* Legend */}
          <Card 
            title="Legenda" 
            size="small" 
            style={{ marginTop: "24px" }}
          >
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Space align="center">
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: getNodeColor("Book")
                  }} />
                  <Text>Buku</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space align="center">
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: getNodeColor("Person")
                  }} />
                  <Text>Penulis</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space align="center">
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: getNodeColor("Genre")
                  }} />
                  <Text>Genre</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space align="center">
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: getNodeColor("Publisher")
                  }} />
                  <Text>Penerbit</Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Instructions */}
          <Card style={{ marginTop: "16px" }}>
            <Title level={5}>Cara Menggunakan:</Title>
            <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
              <li>Klik dan drag node untuk memindahkan posisi</li>
              <li>Hover pada node untuk melihat koneksi</li>
              <li>Klik pada node buku untuk melihat detail</li>
              <li>Gunakan scroll mouse untuk zoom in/out</li>
              <li>Gunakan filter untuk fokus pada tipe tertentu</li>
            </ul>
          </Card>
        </motion.div>
      </KnowledgeGraphContainer>
    </Container>
  );
};

export default KnowledgeGraphPage;