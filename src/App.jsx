import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

 
const App = () => {
  
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  
  const categories = ['general', 'business', 'technology', 'entertainment', 'health', 'science', 'sports'];

  
  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedArticle(null);
    
    const fetchNews = async () => {
      try {
        const url = `/.netlify/functions/fetchNews?category=${category}`;
        const response = await axios.get(url);

        if (response.data.status === "error") {
          throw new Error(response.data.message);
        }
        
        const validArticles = response.data.articles.filter(article => article.title && article.title !== "[Removed]");
        setArticles(validArticles);
        setFilteredArticles(validArticles);
        
      } catch (error) {
        setError(error.message || 'Something went wrong while fetching news.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category]); 

  
  useEffect(() => {
    const results = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(results);
  }, [searchTerm, articles]);

   
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSearchTerm('');
  };
  const handleArticleClick = (article) => setSelectedArticle(article);
  const handleBackToList = () => setSelectedArticle(null);

  
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
        {loading && <p>Fetching the latest news...</p>}
        {error && <p>Error: {error}</p>}
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

 

const Header = ({ searchTerm, onSearchChange, categories, activeCategory, onCategoryChange }) => (
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
  
const NewsList = ({ articles, onArticleClick }) => {
    if (articles.length === 0) {
      return <p>No articles found. Try a different search or category.</p>;
    }
    return (
      <div className="news-list">
        {articles.map((article, index) => (
          <NewsItem key={article.url || index} article={article} onArticleClick={onArticleClick} />
        ))}
      </div>
    );
};
  
const NewsItem = ({ article, onArticleClick }) => {
    const imageUrl = article.urlToImage || `https://placehold.co/600x400/1f2937/d1d5db?text=${article.source.name}`;
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
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/1f2937/6b7280?text=Image+Error'; }}
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
    const imageUrl = article.urlToImage || 'https://placehold.co/800x400/1f2937/d1d5db?text=Full+Story';
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
            <img src={imageUrl} alt={article.title} className="article-detail-image" />
            <div className="article-detail-content">
                <p>{article.content || article.description || "Full content not available."}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-detail-link">
                    Read the full story on {article.source.name} &rarr;
                </a>
            </div>
        </div>
    );
};

const Footer = () => (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} NewsWave. All Rights Reserved.</p>
      <p>Powered by <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer">NewsAPI.org</a></p>
    </footer>
);

export default App;