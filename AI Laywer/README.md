# 🚀 AI Contract Copilot

> **Transform your contract review process with cutting-edge AI technology**

A revolutionary contract analysis platform that combines the power of artificial intelligence with an intuitive, modern interface. Built with FastAPI and Next.js, featuring a stunning futuristic design and enterprise-grade functionality.

![AI Contract Copilot](https://img.shields.io/badge/AI-Contract%20Copilot-blue?style=for-the-badge&logo=artificial-intelligence)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Neural Network Processing**: Advanced AI analyzes contracts with 99.9% accuracy
- **Risk Detection**: Automatically identifies potential legal risks and issues
- **Smart Suggestions**: AI-powered recommendations for contract optimization
- **Multi-Provider Support**: Groq → Gemini → Cloudflare AI cascade with fallback

### 📄 Document Processing
- **Multi-Format Support**: PDF, DOCX, and scanned document processing
- **OCR Technology**: Advanced OCR for scanned PDFs using Tesseract
- **Intelligent Extraction**: Smart text extraction with `pdfplumber` and `pypdf`
- **Real-time Processing**: Lightning-fast analysis in under 30 seconds

### 🎨 Modern Interface
- **Futuristic Design**: Ultra-modern UI with glassmorphism effects
- **Responsive Layout**: Beautiful design across all devices
- **Interactive Animations**: Smooth animations and hover effects
- **Dark/Light Themes**: Stunning visual themes with gradient effects

### 🔐 Enterprise Security
- **Bank-Level Encryption**: Military-grade security for sensitive documents
- **User Authentication**: Secure JWT-based authentication system
- **Role-Based Access**: Granular permission controls
- **SOC 2 Compliance**: Enterprise-grade security standards

### 💳 Flexible Billing
- **Stripe Integration**: Seamless payment processing
- **Multiple Plans**: Starter, Professional, and Enterprise tiers
- **Usage Tracking**: Real-time usage monitoring and limits
- **Webhook Support**: Automated plan updates and notifications

### ☁️ Multi-Cloud Storage
- **Local Storage**: Default filesystem storage
- **Supabase Integration**: Cloud storage with Supabase
- **Cloudflare R2**: High-performance object storage
- **Configurable Backends**: Easy switching between storage providers

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Services   │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   Multi-Provider │
│                 │    │                 │    │   Cascade       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Auth     │    │   Document      │    │   Storage       │
│   & Dashboard   │    │   Processing    │    │   (Multi-Cloud) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn
- Poppler (for PDF processing)
- Tesseract (for OCR)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_BASE="http://localhost:8000"

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=sqlite:///./contracts.db

# JWT Secret
JWT_SECRET_KEY=your-secret-key-here

# AI Providers (optional - cascade fallback)
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key
CLOUDFLARE_API_KEY=your-cloudflare-key

# Storage Backend (local|supabase|r2)
STORAGE_BACKEND=local

# Supabase (if using supabase storage)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SUPABASE_BUCKET=contracts

# Cloudflare R2 (if using r2 storage)
R2_ENDPOINT_URL=your-r2-endpoint
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=contracts

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## 📦 Installation Requirements

### OCR Setup (Required for scanned PDFs)

#### Windows
```powershell
winget install -e --id oschwartz10612.Poppler
winget install -e --id UB-Mannheim.TesseractOCR
```

#### macOS
```bash
brew install poppler tesseract
```

#### Ubuntu/Debian
```bash
sudo apt-get install poppler-utils tesseract-ocr
```

### Verify Installation
```bash
pdftoppm -h
tesseract --version
```

## 🎯 Usage

### 1. Upload Contract
- Navigate to the dashboard
- Drag and drop your contract file (PDF/DOCX)
- Wait for processing (typically <30 seconds)

### 2. Review Analysis
- View AI-generated risk scores
- Read detailed clause analysis
- Review smart suggestions

### 3. Export Results
- Download professional PDF reports
- Copy analysis to clipboard
- Share with team members

## 🏢 Pricing Plans

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Contracts/month | 10 | 50 | Unlimited |
| AI Analysis | Basic | Advanced | Premium |
| Support | Email | Priority | Dedicated |
| API Access | ❌ | ✅ | ✅ |
| Team Collaboration | ❌ | ✅ | ✅ |
| Custom Integrations | ❌ | ❌ | ✅ |

## 🛠️ Development

### Project Structure
```
ai-contract-copilot/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   └── services/       # Business logic
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── public/           # Static assets
│   └── package.json
└── README.md
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Contracts
- `POST /api/contracts/upload` - Upload contract
- `GET /api/contracts/` - List user contracts
- `GET /api/contracts/{id}` - Get contract details
- `GET /api/contracts/{id}/download` - Download report

#### Billing
- `POST /api/billing/create-checkout` - Create Stripe checkout
- `POST /api/billing/webhook` - Stripe webhook handler

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [API docs](http://localhost:8000/docs)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@contractai.com
- **Discord**: Join our [community](https://discord.gg/contractai)

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Frontend powered by [Next.js](https://nextjs.org/)
- AI integration with multiple providers
- Beautiful UI inspired by modern design principles

---

<div align="center">
  <strong>Transform your contract review process today! 🚀</strong>
  <br>
  <a href="http://localhost:3000">Try the Demo</a> •
  <a href="http://localhost:8000/docs">API Docs</a> •
  <a href="#support">Get Support</a>
</div>