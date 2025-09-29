# ArtSaaS - Supporting Artists Through Community

A comprehensive platform connecting artists with volunteers and supporters, providing mentorship, mental health resources, and financial support for creative communities.

![ArtSaaS Logo](https://via.placeholder.com/200x60/6366f1/ffffff?text=ArtSaaS)

## 🌟 Features

### For Artists
- **Rich Profiles**: Create detailed artist profiles with bio, location, and artistic focus
- **Portfolio Management**: Upload and showcase artwork with descriptions and pricing
- **Mentorship Access**: Request mentorship from experienced volunteers
- **Mental Health Support**: PHQ-9 and GAD-7 assessments with trend tracking
- **Financial Support**: Receive donations and recurring support from patrons

### For Volunteers
- **Mentorship Opportunities**: Offer guidance to emerging artists
- **Session Logging**: Track mentorship sessions with detailed notes
- **Impact Measurement**: Monitor the progress and success of mentored artists
- **Community Building**: Connect with other volunteers and artists

### For Administrators
- **User Management**: Oversee all platform users and activities
- **Assessment Review**: Monitor mental health assessments and provide support
- **Financial Oversight**: Track donations and platform financials
- **Analytics Dashboard**: View community metrics and impact data

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: PocketBase (local-first SQLite database)
- **Authentication**: PocketBase Auth with role-based access
- **Payments**: Stripe integration for donations and subscriptions
- **File Uploads**: PocketBase file storage for artwork images
- **Charts**: Recharts for data visualization
- **Deployment**: Optimized for local development and production

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PocketBase (for local development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd artsaas
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

Required environment variables:
```env
POCKETBASE_URL=http://localhost:8090
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXTAUTH_SECRET=your-secret-key
```

### 3. Start PocketBase
```bash
# Download and run PocketBase
./scripts/init-pb.sh
```

### 4. Bootstrap Database
```bash
# Create collections and seed data
./scripts/bootstrap-collections.sh
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see ArtSaaS in action!

## 📊 Database Schema

### Core Collections

#### Users
- **Role-based access**: artist, volunteer, admin, guest
- **Profile information**: name, bio, location, website
- **Authentication**: Email/password with PocketBase Auth

#### Artists
- **Extended profiles**: artistic mediums, experience level
- **Portfolio settings**: website, social media, artistic statement
- **Mentorship preferences**: availability and preferred type

#### Artworks
- **Portfolio pieces**: images, descriptions, pricing
- **Metadata**: medium, dimensions, year created
- **Engagement**: views, likes, featured status

#### Mentorship Requests
- **Matching system**: artists request volunteers
- **Communication**: messages and status tracking
- **Preferences**: meeting type and frequency

#### Mentorship Sessions
- **Session logging**: detailed notes and outcomes
- **Progress tracking**: goals, challenges, next steps
- **Feedback system**: ratings and reviews

#### Mental Health Assessments
- **PHQ-9 & GAD-7**: standardized depression and anxiety screening
- **Trend tracking**: historical data and progress visualization
- **Risk assessment**: automated flagging and admin review

#### Donations
- **Financial support**: one-time and recurring donations
- **Payment processing**: Stripe integration with webhooks
- **Transparency**: donor messages and artist earnings

## 🎯 User Roles & Permissions

### Artist
- Create and manage profile
- Upload and manage artworks
- Request mentorship
- Complete mental health assessments
- Receive donations
- View personal dashboard

### Volunteer
- Browse and accept mentorship requests
- Log and manage mentorship sessions
- View volunteer dashboard
- Access community resources

### Admin
- Full platform access
- User management
- Assessment review
- Financial oversight
- System analytics

### Guest
- Browse public artist profiles
- Make donations
- Limited platform access

## 💰 Financial Support

### For Artists
- **One-time donations**: Support specific artists or artworks
- **Recurring support**: Monthly pledges for ongoing support
- **Artwork purchases**: Direct sales through the platform
- **Transparent fees**: Clear breakdown of platform cuts

### For Supporters
- **Impact tracking**: See how donations support artists
- **Tax receipts**: Automatic donation records
- **Anonymous giving**: Option to donate privately

## 🧠 Mental Health Support

### Assessment Tools
- **PHQ-9**: Depression screening questionnaire
- **GAD-7**: Anxiety screening questionnaire
- **Combined assessments**: Both tools in one session

### Support Features
- **Trend visualization**: Track progress over time
- **Crisis resources**: Immediate access to help
- **Admin oversight**: Professional review of concerning scores
- **Privacy protection**: Secure, encrypted data storage

## 👥 Mentorship Program

### For Artists
- **Find mentors**: Browse available volunteers by expertise
- **Request guidance**: Submit detailed mentorship requests
- **Track progress**: Log sessions and monitor development
- **Rate experiences**: Provide feedback on mentorship quality

### For Volunteers
- **Offer expertise**: Share skills and experience
- **Manage sessions**: Schedule and log mentorship meetings
- **Track impact**: Monitor artist progress and success
- **Build reputation**: Receive ratings and testimonials

## 📈 Analytics & Impact

### Community Metrics
- **Active users**: Artists, volunteers, and supporters
- **Engagement rates**: Profile views, mentorship sessions
- **Financial impact**: Total donations and artist earnings
- **Mental health trends**: Assessment scores and improvements

### Individual Dashboards
- **Artists**: Portfolio views, donations, mentorship progress
- **Volunteers**: Sessions completed, artists mentored, ratings
- **Admins**: Platform health, user satisfaction, system usage

## 🔧 Development

### Project Structure
```
artsaas/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Role-specific dashboards
│   ├── artists/           # Artist profiles and portfolios
│   └── ...               # Other app routes
├── components/            # Reusable UI components
├── lib/                  # Utilities and configurations
├── scripts/              # Database and setup scripts
│   ├── schemas/          # PocketBase collection schemas
│   └── data/            # Seed data files
└── hooks/               # Custom React hooks
```

### Key Scripts
- `init-pb.sh`: Initialize PocketBase server
- `bootstrap-collections.sh`: Create database collections
- `start-local.sh`: Start complete development environment

### Development Commands
```bash
npm run dev          # Start development server
npm run build       # Build for production
npm run type-check  # TypeScript type checking
npm run lint        # Code linting
npm run test        # Run tests
```

## 🌍 Deployment

### Local Development
1. Start PocketBase: `./scripts/init-pb.sh`
2. Bootstrap data: `./scripts/bootstrap-collections.sh`
3. Start Next.js: `npm run dev`

### Production Deployment
- **Recommended**: Railway, Vercel, or similar
- **Database**: PocketBase runs alongside the app
- **File Storage**: Configure cloud storage for production
- **Environment**: Set all production environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component patterns
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the foundation of the Local-First SaaS Boilerplate
- Thanks to all contributors and supporters
- Special thanks to the artistic community for inspiration

## 📞 Support

For support and questions:
- 📧 Email: support@artsaas.com
- 💬 Discord: [Join our community](https://discord.gg/artsaas)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**ArtSaaS** - Empowering artists, building communities, supporting creativity. 🎨
