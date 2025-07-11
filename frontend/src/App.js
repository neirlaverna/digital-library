// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
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
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={idID}>
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
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
