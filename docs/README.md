# BowlScore Documentation

Welcome to the BowlScore documentation! This comprehensive guide covers everything you need to know about the BowlScore application - from high-level architecture to detailed implementation specifics.

## Table of Contents

### Getting Started
- [Project Roadmap](./bowlscore-roadmap.md) - Project overview, status, and future plans
- [Features Documentation](./features.md) - Complete feature list and user guides
- [Quick Start Guide](./quick-start.md) - Get up and running quickly

### Technical Documentation
- [Architecture Overview](./architecture.md) - System design and architectural decisions
- [Database Schema](./database-schema.md) - Complete database documentation
- [API Reference](./api-reference.md) - Edge functions and API endpoints
- [Development Guide](./development-guide.md) - How to develop and contribute

### Operations
- [Deployment Guide](./deployment.md) - How to deploy and configure the application
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions

## Quick Navigation

### For Users
- **What can BowlScore do?** → [Features Documentation](./features.md)
- **How do I use feature X?** → [Features Documentation](./features.md)
- **What's coming next?** → [Project Roadmap](./bowlscore-roadmap.md)

### For Developers
- **How is the app structured?** → [Architecture Overview](./architecture.md)
- **How does the database work?** → [Database Schema](./database-schema.md)
- **How do I set up development?** → [Development Guide](./development-guide.md)
- **How do I deploy changes?** → [Deployment Guide](./deployment.md)

### For Product Managers
- **What features exist?** → [Features Documentation](./features.md)
- **What's the roadmap?** → [Project Roadmap](./bowlscore-roadmap.md)
- **What are the key decisions?** → [Architecture Overview](./architecture.md)

### For DevOps
- **How do I deploy?** → [Deployment Guide](./deployment.md)
- **What's the architecture?** → [Architecture Overview](./architecture.md)
- **How do I troubleshoot?** → [Troubleshooting Guide](./troubleshooting.md)

## Document Overview

### [Project Roadmap](./bowlscore-roadmap.md)
**Purpose**: Understand the project's mission, current status, and future direction

**Contents**:
- Project overview and mission statement
- Completed features with detailed descriptions
- Future roadmap organized by phases
- Technical debt and improvement plans
- Success metrics and KPIs
- Recent accomplishments and version history

**Best for**: Product managers, stakeholders, new team members

---

### [Architecture Overview](./architecture.md)
**Purpose**: Understand how BowlScore is built and why

**Contents**:
- Technology stack breakdown
- Component architecture and organization
- State management patterns
- Key architectural decisions with rationale
- Data flow diagrams
- Security architecture
- Performance considerations
- Deployment architecture

**Best for**: Developers, architects, technical leads

---

### [Database Schema](./database-schema.md)
**Purpose**: Complete reference for database structure

**Contents**:
- All tables with field definitions
- Relationships and foreign keys
- Row Level Security (RLS) policies
- Indexes and constraints
- Storage bucket configuration
- Migration history
- Query patterns and examples
- Performance optimization tips

**Best for**: Backend developers, database administrators

---

### [Features Documentation](./features.md)
**Purpose**: Comprehensive guide to all application features

**Contents**:
- Authentication and user management
- Traditional and simplified scorecards
- All training drills (40 Bowls, Lead vs Lead, 2nd's Chance)
- Premium features breakdown
- Subscription management
- Feature comparison tables
- User workflows
- Browser compatibility
- Accessibility features

**Best for**: Users, product managers, support team

---

### [Deployment Guide](./deployment.md)
**Purpose**: Complete deployment and operations manual

**Contents**:
- Environment setup and configuration
- Database deployment procedures
- Edge function deployment
- Frontend deployment (Vercel, Netlify, manual)
- Stripe configuration
- DNS and domain setup
- Monitoring and logging
- Backup procedures
- CI/CD pipeline setup
- Rollback procedures
- Security checklist
- Troubleshooting guide
- Maintenance schedule

**Best for**: DevOps engineers, system administrators

---

## Project Structure

```
bowlscore/
├── docs/                           # This documentation
│   ├── README.md                   # You are here
│   ├── bowlscore-roadmap.md       # Roadmap and project overview
│   ├── architecture.md             # Technical architecture
│   ├── database-schema.md          # Database documentation
│   ├── features.md                 # Feature documentation
│   ├── deployment.md               # Deployment guide
│   ├── development-guide.md        # Development guide (planned)
│   ├── api-reference.md            # API reference (planned)
│   ├── troubleshooting.md          # Troubleshooting (planned)
│   └── quick-start.md              # Quick start (planned)
├── src/                            # Application source code
│   ├── components/                 # React components
│   ├── contexts/                   # React contexts
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility libraries
│   ├── pages/                      # Page components
│   └── ...
├── supabase/                       # Supabase configuration
│   ├── functions/                  # Edge functions
│   └── migrations/                 # Database migrations
└── public/                         # Static assets
```

## Technology Stack Summary

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router 7.9

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)
- **Payments**: Stripe

### Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Supabase Platform
- **CDN**: Automatic via hosting provider

## Key Features at a Glance

✅ **User Authentication**
- Email/password authentication
- Secure password reset
- Profile management

✅ **Scorecards**
- Traditional multi-player scorecard
- Simplified quick scorecard
- JPEG export
- Cloud saving (premium)

✅ **Training Drills**
- 40 Bowls Draw Drill
- Lead vs Lead Drill
- 2nd's Chance Drill
- Session tracking (premium)

✅ **Premium Features**
- Unlimited session history
- Email delivery
- Cloud storage
- Priority support

✅ **Subscription Management**
- Stripe integration
- Trial periods
- Discount system
- Self-service cancellation

## Recent Updates

### November 2024
- Fixed premium feature access bug in Lead vs Lead and 2nd's Chance drills
- Corrected subscription status checking logic
- Created comprehensive documentation suite

### October 2024
- Launched 2nd's Chance drill
- Added trial period tracking
- Implemented discount request system

## Contributing

### For Code Contributors
1. Read the [Development Guide](./development-guide.md)
2. Review the [Architecture Overview](./architecture.md)
3. Check the [Database Schema](./database-schema.md) for data models
4. Follow coding standards and patterns in existing code
5. Write tests for new features
6. Update documentation as needed

### For Documentation Contributors
1. Use clear, concise language
2. Include examples where helpful
3. Keep documents up to date with code changes
4. Follow existing document structure
5. Add diagrams for complex concepts

## Getting Help

### For Users
- Review [Features Documentation](./features.md)
- Use the in-app feedback form
- Contact support team

### For Developers
- Review relevant technical docs
- Check [Troubleshooting Guide](./troubleshooting.md)
- Ask the development team

## Documentation Maintenance

### Responsibility
- **Product Documentation**: Product team
- **Technical Documentation**: Development team
- **Operations Documentation**: DevOps team

### Update Schedule
- **Continuous**: Bug fixes and corrections
- **With each release**: Feature documentation
- **Monthly**: Review and updates
- **Quarterly**: Major revisions

### How to Update Documentation

1. Edit the relevant markdown file
2. Follow existing format and structure
3. Update the date at bottom of file
4. Submit pull request with changes
5. Get review from document owner
6. Merge when approved

## Feedback

We value your feedback on this documentation!

**Found an error?** Please report it so we can fix it.

**Documentation unclear?** Let us know what needs clarification.

**Missing information?** Request additions through the feedback form.

**Have suggestions?** We welcome ideas for improvement.

---

## Quick Links

- [Main Application](/) (when deployed)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [GitHub Repository](#) (add your repo URL)

---

**Last Updated**: November 2024

**Version**: 1.2.0

**Maintained by**: BowlScore Development Team
