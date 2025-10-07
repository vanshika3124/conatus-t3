import React, { useState, useEffect } from 'react';
import './App.css'; // CSS file ko import karein

// Main App Component
const App = () => {
  // --- STATE MANAGEMENT ---
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // --- API KEY & CATEGORIES ---
  const apiKey = 'a8ea24392d444592afd61f8137cfdd1f';
  const categories = ['general', 'business', 'technology', 'entertainment', 'health', 'science', 'sports'];

  // --- DATA FETCHING ---
  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedArticle(null);

    if (apiKey === 'YOUR_API_KEY') {
      console.log("Using mock data. Please add your NewsAPI key.");
      setTimeout(() => {
        setArticles(mockArticles);
        setFilteredArticles(mockArticles);
        setLoading(false);
      }, 800);
      return;
    }
    
    const fetchNews = async () => {
      try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`);
        if (!response.ok) throw new Error('Network response was not ok. Your API key might be invalid or the request failed.');
        const data = await response.json();
        if (data.status === "error") throw new Error(data.message);
        const validArticles = data.articles.filter(article => article.title && article.title !== "[Removed]");
        setArticles(validArticles);
        setFilteredArticles(validArticles);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category, apiKey]);

  // --- SEARCH FILTERING ---
  useEffect(() => {
    const results = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(results);
  }, [searchTerm, articles]);

  // --- EVENT HANDLERS ---
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSearchTerm('');
  };
  const handleArticleClick = (article) => setSelectedArticle(article);
  const handleBackToList = () => setSelectedArticle(null);

  // --- RENDER LOGIC ---
  return (
    <div>
      <Header 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange}
        categories={categories}
        activeCategory={category}
        onCategoryChange={handleCategoryChange}
      />
      
      <main className="container">
        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        )}
        {error && <p style={{textAlign: 'center', color: '#f87171', marginTop: '2rem', background: '#450a0a', padding: '1rem', borderRadius: '0.5rem'}}>Error: {error}</p>}
        {!loading && !error && (
            selectedArticle ? (
                <ArticleDetail article={selectedArticle} onBack={handleBackToList} />
            ) : (
                <NewsList articles={filteredArticles} onArticleClick={handleArticleClick} />
            )
        )}
      </main>

      <Footer />
    </div>
  );
};

// --- COMPONENTS ---

const Header = ({ searchTerm, onSearchChange, categories, activeCategory, onCategoryChange }) => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
            <h1 className="app-title">NewsWave</h1>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={onSearchChange}
              className="search-input"
            />
        </div>
        <nav className="category-nav">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`category-button ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
        </nav>
      </div>
    </header>
  );
};

const NewsList = ({ articles, onArticleClick }) => {
  if (articles.length === 0) {
    return <p style={{textAlign: 'center', marginTop: '2rem', color: '#64748b'}}>No articles found. Try a different search or category.</p>;
  }
  return (
    <div className="news-list">
      {articles.map((article) => (
        <NewsItem key={`${article.url}-${article.publishedAt}`} article={article} onArticleClick={onArticleClick} />
      ))}
    </div>
  );
};

const NewsItem = ({ article, onArticleClick }) => {
  const imageUrl = article.urlToImage || `https://placehold.co/600x400/1e293b/94a3b8?text=${article.source.name}`;
  const publicationDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="news-item" onClick={() => onArticleClick(article)}>
      <div className="news-item-image-container">
        <img 
          src={imageUrl} 
          alt={article.title} 
          className="news-item-image"
          onError={(e) => { e.currentTarget.src = '[https://placehold.co/600x400/1e293b/64748b?text=Image+Not+Available](https://placehold.co/600x400/1e293b/64748b?text=Image+Not+Available)'; }}
        />
        <span className="news-item-source">{article.source.name}</span>
      </div>
      <div className="news-item-content">
        <h2 className="news-item-title">{article.title}</h2>
        <p className="news-item-date">{publicationDate}</p>
        <p className="news-item-description">{article.description || 'No summary available.'}</p>
      </div>
    </div>
  );
};

const ArticleDetail = ({ article, onBack }) => {
    const imageUrl = article.urlToImage || '[https://placehold.co/800x400/1e293b/94a3b8?text=Full+Story](https://placehold.co/800x400/1e293b/94a3b8?text=Full+Story)';
    const publicationDate = new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="article-detail">
             <button onClick={onBack} className="back-button">
                &larr; Back to News
            </button>
            <h1 className="article-detail-title">{article.title}</h1>
            <div className="article-detail-meta">
                <span>By {article.author || 'Unknown Author'}</span> | <span>{publicationDate}</span>
            </div>
            <img 
              src={imageUrl} 
              alt={article.title} 
              className="article-detail-image"
              onError={(e) => { e.currentTarget.src = '[https://placehold.co/800x400/1e293b/64748b?text=Image+Not+Available](https://placehold.co/800x400/1e293b/64748b?text=Image+Not+Available)'; }}
            />
            <div className="article-detail-content">
                <p>{article.content || article.description || "Full content not available."}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-detail-link">
                    Read the full story on {article.source.name} &rarr;
                </a>
            </div>
        </div>
    );
};


const Footer = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} NewsWave. All Rights Reserved.</p>
      <p>Powered by <a href="[https://newsapi.org/](https://newsapi.org/)" target="_blank" rel="noopener noreferrer">NewsAPI.org</a></p>
    </footer>
  );
};

// MOCK DATA
const mockArticles = [
    { source: { name: "TechCrunch" }, title: "Mock Article 1: The Future of Tech", description: "An inside look at the innovations shaping our world.", publishedAt: "2025-10-07T10:00:00Z", urlToImage: "[https://placehold.co/600x400/3498db/ffffff?text=Tech+Future](https://placehold.co/600x400/3498db/ffffff?text=Tech+Future)", url: "#1" },
    { source: { name: "Bloomberg" }, title: "Mock Article 2: Global Business Trends", description: "What to expect in the world of finance and business this year.", publishedAt: "2025-10-07T09:30:00Z", urlToImage: "[https://placehold.co/600x400/2ecc71/ffffff?text=Business](https://placehold.co/600x400/2ecc71/ffffff?text=Business)", url: "#2" },
    { source: { name: "WebMD" }, title: "Mock Article 3: Health & Wellness Discoveries", description: "New breakthroughs in medicine and personal health.", publishedAt: "2025-10-07T09:00:00Z", urlToImage: "[https://placehold.co/600x400/e74c3c/ffffff?text=Health](https://placehold.co/600x400/e74c3c/ffffff?text=Health)", url: "#3" },
];

export default App;
