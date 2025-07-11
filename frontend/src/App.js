// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import idID from "antd/locale/id_ID";
import { ThemeProvider } from "styled-components";
import { GlobalStyle, theme } from "./styles/GlobalStyle";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import BookDetailPage from "./pages/BookDetailPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h1>Oops! Terjadi kesalahan</h1>
          <p>Silakan refresh halaman atau hubungi administrator.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Refresh Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={idID}
          theme={{
            token: {
              colorPrimary: "#667eea",
              borderRadius: 8,
            },
          }}
        >
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/books/:id" element={<BookDetailPage />} />
                  <Route
                    path="/recommendations"
                    element={<RecommendationsPage />}
                  />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route
                    path="/knowledge-graph"
                    element={<KnowledgeGraphPage />}
                  />
                  <Route
                    path="*"
                    element={
                      <div style={{ textAlign: "center", padding: "50px" }}>
                        <h2>404 - Halaman Tidak Ditemukan</h2>
                        <p>Halaman yang Anda cari tidak tersedia.</p>
                      </div>
                    }
                  />
                </Routes>
              </Layout>
            </Router>
          </ThemeProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
