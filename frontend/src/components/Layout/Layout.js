// frontend/src/components/Layout/Layout.js
import React, { useState, useEffect } from "react";
import {
  Layout as AntLayout,
  Menu,
  Input,
  Badge,
  Avatar,
  Dropdown,
  Switch,
} from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  BookOutlined,
  BulbOutlined,
  BarChartOutlined,
  ShareAltOutlined,
  UserOutlined,
  HeartOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import { userPreferences } from "../../services/apiService";

const { Header, Content, Sider } = AntLayout;
const { Search } = Input;

const StyledLayout = styled(AntLayout)`
  min-height: 100vh;
  background: transparent;
`;

const StyledHeader = styled(Header)`
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const StyledSider = styled(Sider)`
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);

  .ant-menu {
    background: transparent !important;
    border: none !important;

    .ant-menu-item {
      color: rgba(255, 255, 255, 0.8) !important;
      border-radius: 8px !important;
      margin: 4px 0 !important;

      &:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
      }

      &.ant-menu-item-selected {
        background: linear-gradient(45deg, #667eea, #764ba2) !important;
        color: white !important;
      }
    }
  }
`;

const StyledContent = styled(Content)`
  padding: 24px;
  background: transparent;
  overflow-y: auto;
`;

const Logo = styled(motion.div)`
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 24px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ScrollIndicator = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  z-index: 1000;
  transform-origin: 0%;
`;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedSearchValue.trim()) {
      userPreferences.addToSearchHistory(debouncedSearchValue);
      navigate(`/search?q=${encodeURIComponent(debouncedSearchValue)}`);
    }
  }, [debouncedSearchValue, navigate]);

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">Beranda</Link>,
    },
    {
      key: "/search",
      icon: <SearchOutlined />,
      label: <Link to="/search">Pencarian</Link>,
    },
    {
      key: "/recommendations",
      icon: <BulbOutlined />,
      label: <Link to="/recommendations">Rekomendasi</Link>,
    },
    {
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Analitik</Link>,
    },
    {
      key: "/knowledge-graph",
      icon: <ShareAltOutlined />,
      label: <Link to="/knowledge-graph">Knowledge Graph</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "favorites",
      icon: <HeartOutlined />,
      label: "Favorit Saya",
    },
    {
      key: "reading-list",
      icon: <BookOutlined />,
      label: "Daftar Bacaan",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Pengaturan",
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "favorites") {
      // Handle favorites
    } else if (key === "reading-list") {
      // Handle reading list
    } else if (key === "settings") {
      // Handle settings
    }
  };

  const selectedKey = location.pathname;

  return (
    <StyledLayout>
      <ScrollIndicator
        style={{ width: `${scrollProgress}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress / 100 }}
        transition={{ duration: 0.1 }}
      />

      <StyledHeader>
        <Logo
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📚 Perpustakaan Digital
        </Logo>

        <SearchContainer>
          <Search
            placeholder="Cari buku berdasarkan judul, penulis, atau genre..."
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={(value) => {
              if (value.trim()) {
                navigate(`/search?q=${encodeURIComponent(value)}`);
              }
            }}
            style={{
              borderRadius: "25px",
            }}
          />
        </SearchContainer>

        <HeaderActions>
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={isDarkMode}
            onChange={setIsDarkMode}
          />

          <Badge count={userPreferences.getFavoriteBooks().length}>
            <HeartOutlined
              style={{
                fontSize: "20px",
                color: "rgba(255, 255, 255, 0.8)",
                cursor: "pointer",
              }}
              onClick={() => navigate("/favorites")}
            />
          </Badge>

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
          >
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#667eea",
                cursor: "pointer",
              }}
            />
          </Dropdown>
        </HeaderActions>
      </StyledHeader>

      <AntLayout>
        <StyledSider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={250}
          collapsedWidth={80}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ height: "100%", borderRight: 0 }}
          />
        </StyledSider>

        <StyledContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </StyledContent>
      </AntLayout>
    </StyledLayout>
  );
};

export default Layout;
