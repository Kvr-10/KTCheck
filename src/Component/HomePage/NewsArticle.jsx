import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import Navbar from '../Navbar';
import MainFooter from '../Footer/MainFooter';
import TermFooter from '../Footer/TermFooter';
import { USER_API_ENDPOINTS } from '../../utils/apis';
import '../../Css/NewsArticle.css';

const NewsArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArticleData();
  }, [id]);

  const fetchArticleData = async () => {
    try {
      setLoading(true);
      
      // Fetch all news data
      const response = await fetch(USER_API_ENDPOINTS.HOMEPAGE_NEWS);
      if (response.ok) {
        const data = await response.json();
        
        // Find the specific article
        const currentArticle = data.find(item => item.id === parseInt(id));
        if (currentArticle) {
          setArticle(currentArticle);
          
          // Set related articles (excluding current article)
          const related = data.filter(item => 
            item.id !== parseInt(id) && 
            item.category === currentArticle.category
          ).slice(0, 3);
          
          // If not enough related articles from same category, add from other categories
          if (related.length < 3) {
            const additionalArticles = data.filter(item => 
              item.id !== parseInt(id) && 
              !related.some(relatedItem => relatedItem.id === item.id)
            ).slice(0, 3 - related.length);
            
            setRelatedArticles([...related, ...additionalArticles]);
          } else {
            setRelatedArticles(related);
          }
        } else {
          setError('Article not found');
        }
      } else {
        setError('Failed to fetch article data');
      }
    } catch (error) {
      console.error('Error fetching article data:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRelatedArticleClick = (articleId) => {
    window.location.href = `/home/news/${articleId}`;
  };

  if (loading) {
    return (
      <div className="news-article-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading article...</p>
        </div>
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="news-article-page">
        <Navbar />
        <div className="error-container">
          <h2>Article Not Found</h2>
          <p>{error || 'The requested article could not be found.'}</p>
          <button onClick={() => window.location.href = '/home'} className="back-home-btn">
            Back to Home
          </button>
        </div>
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  return (
    <div className="news-article-page">
      <Navbar />
      
      <main className="article-main">
        <div className="article-container">
          {/* Article Header */}
          <header className="article-header">
            <h1 className="article-title">
              {article.title}
              <span className={`category-tag ${article.category.toLowerCase()}`}>
                {article.category}
              </span>
            </h1>
          </header>

          {/* Article Image */}
          <div className="article-image-container">
            <img 
              src={article.image} 
              alt={article.title}
              className="article-image"
            />
          </div>

          {/* Article Content */}
          <div className="article-content">
            <div className="article-description">
              {article.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* External Link */}
            {article.link_url && (
              <div className="external-link-section">
                <a 
                  href={article.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link-btn"
                >
                  {article.link_text || 'Read Full Article'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section className="related-articles-section">
              <div className="related-stories-header">
                <h2 className="related-articles-title">Related Stories</h2>
              </div>
              <Splide
                options={{
                  perPage: 3,
                  gap: "1rem",
                  pagination: false,
                  arrows: true,
                  breakpoints: {
                    1024: { 
                      perPage: 2,
                      gap: "1rem"
                    },
                    768: { 
                      perPage: 1,
                      gap: "1rem"
                    },
                  },
                }}
                className="related-articles-slider"
              >
                {relatedArticles.map((relatedArticle) => (
                  <SplideSlide key={relatedArticle.id}>
                    <div 
                      className="related-article-card"
                      onClick={() => handleRelatedArticleClick(relatedArticle.id)}
                    >
                      <div className="related-article-image">
                        <img 
                          src={relatedArticle.image} 
                          alt={relatedArticle.title}
                        />
                        <span className={`related-category-badge ${relatedArticle.category.toLowerCase()}`}>
                          {relatedArticle.category}
                        </span>
                      </div>
                      <div className="related-article-content">
                        <h3 className="related-article-title">
                          {relatedArticle.title}
                        </h3>
                        <p className="related-article-description">
                          {relatedArticle.description.length > 120 
                            ? relatedArticle.description.substring(0, 120) + "..." 
                            : relatedArticle.description}
                        </p>
                        <span className="read-more-link">Read More →</span>
                      </div>
                    </div>
                  </SplideSlide>
                ))}
              </Splide>
            </section>
          )}
        </div>
      </main>

      <MainFooter />
      <TermFooter />
    </div>
  );
};

export default NewsArticle;
