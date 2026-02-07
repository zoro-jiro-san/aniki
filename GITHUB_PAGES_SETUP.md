# GitHub Pages Deployment Guide for Aniki

This guide will help you deploy the Aniki landing page to GitHub Pages for the OpenClaw Hackathon submission.

## 🚀 Quick Deployment

### 1. Repository Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/your-username/aniki.git
cd aniki

# Ensure all files are committed
git add .
git commit -m "feat: Complete professional landing page for Aniki"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select "Deploy from a branch"
5. Select **main** branch and **/docs** folder
6. Click **Save**

### 3. Custom Domain (Optional)

If you have a custom domain:

1. In the **Pages** settings, add your domain (e.g., `aniki.sui.dev`)
2. The CNAME file is already created in `/docs/CNAME`
3. Configure your DNS provider to point to GitHub Pages:
   ```
   CNAME record: aniki.sui.dev → your-username.github.io
   ```

## 🔗 Access URLs

After deployment (5-10 minutes):

- **Main Site**: https://your-username.github.io/aniki/
- **Documentation**: https://your-username.github.io/aniki/docs.html
- **Custom Domain**: https://aniki.sui.dev (if configured)

## 📊 Automated Deployment

The GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) automatically:

✅ **Builds and Tests**:
- Runs npm install and build
- Validates HTML5 compliance
- Checks for security vulnerabilities
- Runs test suite

✅ **Deploys**:
- Uploads to GitHub Pages
- Updates live site automatically

✅ **Quality Assurance**:
- Runs Lighthouse performance tests
- Performs security scanning
- Validates accessibility

✅ **Notifications**:
- Posts deployment status
- Ready for Moltbook submission

## 🛡️ Security Features

### HTTPS Enforcement
- GitHub Pages provides free SSL certificates
- Site automatically redirects HTTP → HTTPS
- Secure headers implemented

### Content Security
- No sensitive data in public repository
- All API keys are environment variables
- Production-ready security headers

## 📱 Performance Optimization

### Loading Speed
- **Target Metrics**:
  - First Contentful Paint: < 1.5s
  - Largest Contentful Paint: < 2.5s  
  - Cumulative Layout Shift: < 0.1
  - Time to Interactive: < 3s

### Features
- ✅ Responsive design (mobile-first)
- ✅ Lazy loading for images
- ✅ Optimized fonts with display swap
- ✅ Minified CSS and JS
- ✅ Browser caching headers

## 🎯 SEO Optimization

### Meta Tags
```html
<!-- Already implemented in index.html -->
<meta name="description" content="Enterprise-grade autonomous agent treasury management...">
<meta property="og:title" content="Aniki - Autonomous Agent Treasury Management on Sui">
<meta property="og:description" content="Revolutionary AI-powered treasury management...">
<meta property="og:image" content="https://aniki.sui.dev/assets/images/og-image.png">
```

### Structured Data
- Proper HTML5 semantic structure
- H1-H6 hierarchy for content organization
- Schema.org markup for rich snippets

### Sitemap & Robots
- `/sitemap.xml` for search engine crawling
- `/robots.txt` for crawler guidance
- Automatic submission to search engines

## 🧪 Testing

### Local Testing

```bash
# Serve locally for testing
cd docs/
python -m http.server 8000
# Visit: http://localhost:8000
```

### Automated Testing

```bash
# HTML5 validation
npm install -g html5-validator
html5-validator --root docs/

# Performance testing
npm install -g lighthouse
lighthouse https://your-username.github.io/aniki/

# Security scanning
npm audit
```

## 🎨 Customization

### Color Scheme
```css
:root {
  --primary-color: #4FC3F7;    /* Sui Blue */
  --secondary-color: #29B6F6;   /* Lighter Blue */
  --accent-color: #0277BD;      /* Dark Blue */
}
```

### Content Updates
- Edit `/docs/index.html` for main page content
- Edit `/docs/docs.html` for documentation
- Update `/docs/demo.js` for interactive demo
- Modify `/docs/_config.yml` for Jekyll settings

### Analytics Setup

Add to `<head>` section:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🚀 Hackathon Submission

### Checklist for Moltbook Posting

- ✅ **Landing page deployed** and accessible
- ✅ **Interactive demo** working properly
- ✅ **Documentation** complete and clear
- ✅ **Mobile responsive** design verified
- ✅ **Performance optimized** (Lighthouse > 90)
- ✅ **Security implemented** (HTTPS, headers)
- ✅ **SEO optimized** with proper meta tags
- ✅ **GitHub repository** public and well-documented

### Social Media Ready
- **Twitter**: Optimized cards for link previews
- **Discord**: Rich embeds with thumbnails
- **LinkedIn**: Professional presentation
- **Telegram**: Fast loading and mobile-friendly

### Key Messaging for Sui Community

🎯 **Value Proposition**:
- "Enterprise-grade autonomous agent treasury management"
- "Built specifically for Sui ecosystem"
- "Production-ready security with air-gap protection"
- "AI-powered fraud detection and automation"

🛡️ **Security Highlights**:
- Air-gap wallet management
- Multi-signature support
- Real-time fraud detection
- Emergency response systems

🌊 **Sui Integration**:
- Native Move smart contracts
- SuiNS integration
- Gas optimization
- RPC failover system

## 📞 Support

### Issues
- **GitHub Issues**: [Repository Issues](https://github.com/your-username/aniki/issues)
- **Documentation**: [docs.html](https://aniki.sui.dev/docs.html)

### Contact
- **Email**: team@aniki-sui.dev
- **Twitter**: @aniki_sui
- **Discord**: Sui developer community

---

## 🏆 Success Metrics

### Traffic Goals
- **Week 1**: 1,000+ unique visitors
- **Month 1**: 10,000+ page views
- **Sui Community**: Feature in official channels

### Technical Goals
- **Performance**: Lighthouse scores > 90
- **Accessibility**: WCAG 2.1 AA compliance  
- **SEO**: Top 10 for "Sui treasury management"
- **Conversion**: 25%+ GitHub star rate

### Community Goals
- **Developer Adoption**: 100+ GitHub stars
- **Integration**: 10+ projects considering integration
- **Feedback**: Positive reception in Sui Discord
- **Hackathon**: Top 5 placement ($1,900 prize)

**Ready to deploy and showcase Aniki to the Sui community! 🚀**