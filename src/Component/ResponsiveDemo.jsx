import React from 'react';

const ResponsiveDemo = () => {
  return (
    <div className="container-responsive">
      {/* Responsive Header */}
      <header className="padding-responsive">
        <h1 className="text-responsive-xl" style={{ textAlign: 'center', color: '#05242a' }}>
          Kabadi Techno - Responsive Design Demo
        </h1>
        <p className="text-responsive-base" style={{ textAlign: 'center', marginTop: '10px' }}>
          This demo showcases our responsive design system in action
        </p>
      </header>

      {/* Responsive Grid Layout */}
      <section className="margin-responsive">
        <h2 className="text-responsive-lg" style={{ marginBottom: '20px', color: '#56b124' }}>
          Card Grid Layout
        </h2>
        
        <div className="card-grid-3-responsive">
          <div className="card-responsive">
            <div className="card-header-responsive">
              <h3 className="card-title-responsive">Desktop View</h3>
              <p className="card-subtitle-responsive">Large screens (1024px+)</p>
            </div>
            <div className="card-body-responsive">
              <p className="card-content-responsive">
                On desktop, this content appears in a 3-column grid layout with full spacing and larger text.
              </p>
            </div>
            <div className="card-footer-responsive">
              <button className="btn-responsive" style={{ background: '#56b124', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>
                Learn More
              </button>
            </div>
          </div>

          <div className="card-responsive">
            <div className="card-header-responsive">
              <h3 className="card-title-responsive">Tablet View</h3>
              <p className="card-subtitle-responsive">Medium screens (768px-1023px)</p>
            </div>
            <div className="card-body-responsive">
              <p className="card-content-responsive">
                On tablets, content adapts to a 2-column layout with optimized spacing for touch interaction.
              </p>
            </div>
            <div className="card-footer-responsive">
              <button className="btn-responsive" style={{ background: '#56b124', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>
                Learn More
              </button>
            </div>
          </div>

          <div className="card-responsive">
            <div className="card-header-responsive">
              <h3 className="card-title-responsive">Mobile View</h3>
              <p className="card-subtitle-responsive">Small screens (320px-767px)</p>
            </div>
            <div className="card-body-responsive">
              <p className="card-content-responsive">
                On mobile devices, content stacks in a single column with touch-friendly buttons and optimal readability.
              </p>
            </div>
            <div className="card-footer-responsive">
              <button className="btn-responsive" style={{ background: '#56b124', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Form Example */}
      <section className="margin-responsive">
        <h2 className="text-responsive-lg" style={{ marginBottom: '20px', color: '#56b124' }}>
          Responsive Form Layout
        </h2>
        
        <div className="form-container-responsive" style={{ maxWidth: '600px' }}>
          <h3 className="form-title-responsive">Contact Form Demo</h3>
          
          <div className="form-row-responsive">
            <div className="form-col-responsive">
              <div className="form-group-responsive">
                <label className="form-label-responsive">First Name</label>
                <input type="text" className="form-input-responsive" placeholder="Enter first name" />
              </div>
            </div>
            <div className="form-col-responsive">
              <div className="form-group-responsive">
                <label className="form-label-responsive">Last Name</label>
                <input type="text" className="form-input-responsive" placeholder="Enter last name" />
              </div>
            </div>
          </div>

          <div className="form-group-responsive">
            <label className="form-label-responsive">Email</label>
            <input type="email" className="form-input-responsive" placeholder="Enter your email" />
          </div>

          <div className="form-group-responsive">
            <label className="form-label-responsive">Message</label>
            <textarea className="form-textarea-responsive" placeholder="Enter your message"></textarea>
          </div>

          <button type="submit" className="form-button-responsive">
            Send Message
          </button>
        </div>
      </section>

      {/* Responsive Visibility Demo */}
      <section className="margin-responsive">
        <h2 className="text-responsive-lg" style={{ marginBottom: '20px', color: '#56b124' }}>
          Device-Specific Content
        </h2>
        
        <div className="card-responsive">
          <div className="card-body-responsive">
            <div className="hidden-mobile" style={{ padding: '20px', background: '#e8f5e8', borderRadius: '8px', marginBottom: '15px' }}>
              <strong>Desktop/Tablet Only:</strong> This content is only visible on tablet and desktop devices. 
              It might contain detailed information or complex interactions better suited for larger screens.
            </div>
            
            <div className="show-mobile hidden-tablet hidden-desktop" style={{ padding: '20px', background: '#ffe8e8', borderRadius: '8px', marginBottom: '15px' }}>
              <strong>Mobile Only:</strong> This content is optimized for mobile devices. 
              It's simplified for better mobile experience and touch interaction.
            </div>
            
            <div style={{ padding: '20px', background: '#e8e8ff', borderRadius: '8px' }}>
              <strong>All Devices:</strong> This content is visible on all device types and adapts its layout accordingly.
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="margin-responsive">
        <h2 className="text-responsive-lg" style={{ marginBottom: '20px', color: '#56b124' }}>
          Feature Showcase
        </h2>
        
        <div className="card-grid-4-responsive">
          <div className="feature-card-responsive">
            <div className="feature-icon-responsive">📱</div>
            <h3 className="feature-title-responsive">Mobile First</h3>
            <p className="feature-description-responsive">
              Designed with mobile devices as the primary focus, ensuring optimal performance on all screens.
            </p>
          </div>

          <div className="feature-card-responsive">
            <div className="feature-icon-responsive">⚡</div>
            <h3 className="feature-title-responsive">Fast Loading</h3>
            <p className="feature-description-responsive">
              Optimized CSS and images ensure quick loading times across all device types and connection speeds.
            </p>
          </div>

          <div className="feature-card-responsive">
            <div className="feature-icon-responsive">♿</div>
            <h3 className="feature-title-responsive">Accessible</h3>
            <p className="feature-description-responsive">
              Built with accessibility in mind, supporting screen readers and keyboard navigation.
            </p>
          </div>

          <div className="feature-card-responsive">
            <div className="feature-icon-responsive">🎨</div>
            <h3 className="feature-title-responsive">Modern Design</h3>
            <p className="feature-description-responsive">
              Clean, modern interface that adapts beautifully to any screen size or orientation.
            </p>
          </div>
        </div>
      </section>

      {/* Responsive Image Demo */}
      <section className="margin-responsive">
        <h2 className="text-responsive-lg" style={{ marginBottom: '20px', color: '#56b124' }}>
          Responsive Images
        </h2>
        
        <div className="card-responsive">
          <div className="img-container-responsive">
            <img 
              src="/Kabadi_Techno_logo.png" 
              alt="Kabadi Techno Logo" 
              className="img-responsive"
              style={{ margin: '0 auto', maxWidth: '300px' }}
            />
          </div>
          <div className="card-body-responsive">
            <h3 className="card-title-responsive" style={{ color: '#05242a' }}>Responsive Logo</h3>
            <p className="card-content-responsive">
              This logo automatically scales to fit the container while maintaining its aspect ratio across all devices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResponsiveDemo;
