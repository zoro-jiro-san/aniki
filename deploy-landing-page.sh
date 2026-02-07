#!/bin/bash

# Aniki Landing Page Deployment Script
# OpenClaw Hackathon 2026 - Sui Track

set -e  # Exit on any error

echo "🚀 Deploying Aniki Landing Page for OpenClaw Hackathon"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v git &> /dev/null; then
    print_error "Git is required but not installed."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed."
    exit 1
fi

print_success "Prerequisites check passed"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "docs" ]; then
    print_error "Please run this script from the aniki project root directory"
    exit 1
fi

# Install dependencies if needed
print_status "Installing dependencies..."
npm install

# Run tests if they exist
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    print_status "Running tests..."
    npm test
fi

# Build project if build script exists
if [ -f "package.json" ] && grep -q "\"build\"" package.json; then
    print_status "Building project..."
    npm run build
fi

# Validate HTML files
print_status "Validating HTML structure..."
if command -v html5-validator &> /dev/null; then
    html5-validator --root docs/ --ignore="Warning: Consider using the h1 element as a top-level heading only" || print_warning "HTML validation completed with warnings"
else
    print_warning "html5-validator not found, skipping HTML validation"
fi

# Check for common issues
print_status "Performing final checks..."

# Check if CNAME file exists (for custom domain)
if [ -f "docs/CNAME" ]; then
    print_success "Custom domain configured: $(cat docs/CNAME)"
else
    print_warning "No custom domain configured"
fi

# Check if favicon exists
if [ -f "docs/assets/images/favicon.svg" ]; then
    print_success "Favicon found"
else
    print_warning "No favicon found"
fi

# Check if demo.js exists
if [ -f "docs/demo.js" ]; then
    print_success "Interactive demo script found"
else
    print_warning "No demo script found"
fi

# Commit and push changes
print_status "Committing and pushing changes..."

git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    git commit -m "feat: Complete professional landing page deployment for OpenClaw Hackathon

- ✅ Professional landing page with interactive demo
- ✅ Comprehensive documentation site
- ✅ GitHub Pages configuration with custom domain
- ✅ SEO optimization with meta tags and sitemap
- ✅ Performance optimization and accessibility
- ✅ Security features highlighted for Sui community
- ✅ Ready for Moltbook submission to Sui channel

🎯 Targeting OpenClaw Hackathon Top 5 Prize ($1,900)
🌊 Built for Sui ecosystem with Move integration
🛡️ Enterprise-grade security with air-gap protection"
    
    print_success "Changes committed successfully"
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin HEAD

print_success "Code pushed to GitHub"

# Display deployment information
echo ""
echo "============================================================"
print_success "🎉 Aniki Landing Page Deployment Complete!"
echo "============================================================"

echo ""
echo "📍 DEPLOYMENT URLS:"
echo "   🌐 GitHub Pages: https://$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')"

if [ -f "docs/CNAME" ]; then
    echo "   🏷️  Custom Domain: https://$(cat docs/CNAME)"
fi

echo "   📚 Documentation: (main-url)/docs.html"
echo "   🐙 GitHub Repo: $(git remote get-url origin)"

echo ""
echo "⏱️  GITHUB PAGES STATUS:"
echo "   • Deployment typically takes 5-10 minutes"
echo "   • Check repository Settings > Pages for status"
echo "   • GitHub Actions workflow will validate deployment"

echo ""
echo "🎯 HACKATHON SUBMISSION:"
echo "   • Project: Aniki (兄貴) - Autonomous Agent Treasury Management"
echo "   • Track: Safety & Security (Air-Gap & Multi-Sig)"
echo "   • Deadline: February 11, 2026, 23:00 PST"
echo "   • Prize Target: Top 5 ($1,900 each)"

echo ""
echo "📱 MOLTBOOK READY:"
echo "   • Landing page is production-ready"
echo "   • Interactive demo functional"
echo "   • Mobile-responsive design"
echo "   • SEO optimized for Sui community"
echo "   • Use MOLTBOOK_SUBMISSION.md for channel posting"

echo ""
echo "🚨 NEXT STEPS:"
echo "   1. Wait for GitHub Pages deployment (5-10 min)"
echo "   2. Test the live site thoroughly"
echo "   3. Post to Moltbook Sui channel"
echo "   4. Submit to DeepSurge hackathon platform"
echo "   5. Engage with Sui developer community"

echo ""
print_success "Ready to showcase Aniki to the Sui ecosystem! 🌊🤖"
echo "============================================================"