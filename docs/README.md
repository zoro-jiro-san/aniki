# Aniki Landing Page

Professional website for Aniki (兄貴) - Autonomous Agent Treasury Management on Sui Blockchain.

## 🌐 Live Website

Visit the live landing page: [https://your-username.github.io/aniki](https://your-username.github.io/aniki)

## 🎯 Purpose

This landing page showcases Aniki's capabilities to the Sui developer community and serves as the main entry point for:

- **Developers** looking to integrate autonomous treasury management
- **Enterprises** seeking secure digital asset management
- **Sui Community** interested in AI agent orchestration
- **Hackathon Judges** evaluating the OpenClaw submission

## ✨ Features Highlighted

### 🛡️ Security-First Design
- **Air-gap wallet management** with cold/hot wallet separation
- **Multi-signature support** for high-value transactions
- **ML-based fraud detection** with real-time monitoring
- **Emergency controls** for instant system lockdown

### 🌊 Sui Native Integration
- **Move smart contracts** for treasury operations
- **SuiNS integration** for human-readable addresses
- **RPC failover system** for reliability
- **Gas optimization** for cost efficiency

### 🤖 Agent Orchestration
- **Multi-agent coordination** on Sui network
- **Autonomous task decomposition** and execution
- **Intelligent budget allocation** across agents
- **Security-aware agent spawning**

## 🚀 Deployment

### GitHub Pages Setup

1. **Enable GitHub Pages**:
   ```bash
   # Go to repository Settings > Pages
   # Source: Deploy from a branch
   # Branch: main / docs
   ```

2. **Custom Domain** (Optional):
   ```bash
   # Add CNAME file to docs/ folder
   echo "aniki.sui.dev" > docs/CNAME
   ```

3. **SSL Certificate**:
   - GitHub Pages provides free SSL
   - Enable "Enforce HTTPS" in settings

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/aniki.git
cd aniki/docs

# Serve locally (if using Jekyll)
bundle exec jekyll serve

# Or use a simple HTTP server
python -m http.server 8000
# Visit: http://localhost:8000
```

## 📱 Responsive Design

The landing page is fully responsive and optimized for:

- **Desktop** (1200px+) - Full-featured experience
- **Tablet** (768px-1199px) - Adapted layout
- **Mobile** (320px-767px) - Touch-optimized interface

## 🎨 Design System

### Color Palette
- **Primary**: `#4FC3F7` (Sui Blue)
- **Secondary**: `#29B6F6` (Lighter Blue)
- **Accent**: `#0277BD` (Dark Blue)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FF9800` (Orange)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 700 weight
- **Body**: 400 weight
- **UI Elements**: 500-600 weight

### Components
- **Cards**: Shadow-based depth
- **Buttons**: Rounded, hover animations
- **Icons**: Font Awesome 6
- **Code**: Courier New (monospace)

## 📊 Performance

### Optimization Features
- **Lazy loading** for images and animations
- **CSS minification** and optimization
- **Font optimization** with display swap
- **Responsive images** with proper sizing
- **Semantic HTML** for accessibility

### Loading Metrics (Target)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🔍 SEO Optimization

### Meta Tags
- **Title**: Descriptive and keyword-rich
- **Description**: Comprehensive project summary
- **Keywords**: Sui, blockchain, treasury, agents
- **Open Graph**: Social media optimization

### Content Structure
- **H1-H6 hierarchy** for search engines
- **Semantic HTML** with proper landmarks
- **Alt text** for all images
- **Structured data** for rich snippets

### Social Media
- **Twitter Cards** for link previews
- **Open Graph** for Facebook/LinkedIn
- **Custom thumbnails** for sharing

## 🎯 Target Audience

### Primary Audience
- **Sui Developers** building DeFi applications
- **Enterprise DevOps** teams managing digital assets
- **Blockchain Security** professionals
- **DeFi Protocol** developers

### Messaging Strategy
- **Technical Authority**: Deep Sui integration
- **Security Focus**: Enterprise-grade features
- **Innovation**: AI-powered automation
- **Trust**: Production-ready codebase

## 📈 Analytics & Tracking

### Recommended Setup
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>

<!-- GitHub Pages insights -->
<!-- Automatic tracking via GitHub -->

<!-- Custom events -->
<script>
// Track demo interactions
gtag('event', 'demo_start', {
  'event_category': 'engagement',
  'event_label': 'landing_page'
});
</script>
```

### Key Metrics to Track
- **Page views** and unique visitors
- **Demo interactions** and engagement
- **GitHub link clicks** from landing page
- **Time on page** and bounce rate
- **Mobile vs desktop** usage

## 🛠️ Maintenance

### Regular Updates
- **Security patches** for dependencies
- **Content updates** as features evolve
- **Performance monitoring** and optimization
- **Browser compatibility** testing

### Content Calendar
- **Weekly**: Security metrics update
- **Monthly**: Feature highlights refresh
- **Quarterly**: Complete design review
- **Annually**: Full redesign consideration

## 📞 Support

### Contact Methods
- **GitHub Issues**: Technical questions
- **Email**: team@aniki-sui.dev
- **Discord**: Sui community channels
- **Twitter**: @aniki_sui

### Documentation Links
- **Main Repository**: [github.com/your-username/aniki](https://github.com/your-username/aniki)
- **API Documentation**: [docs/api.md](../docs/api.md)
- **Deployment Guide**: [DEPLOYMENT.md](../DEPLOYMENT.md)
- **Hackathon Submission**: [HACKATHON.md](../HACKATHON.md)

---

**Built for the OpenClaw Hackathon** | **Deadline: February 11, 2026**  
**Targeting Top 5 Prize**: $1,900 for innovative Sui ecosystem projects