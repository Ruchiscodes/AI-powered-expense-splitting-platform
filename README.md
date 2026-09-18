# AI-Powered Expense-Splitting Platform

Full-stack expense-splitting application leveraging AI, modern web frameworks, authentication, and cloud hosting.

## Features
- **Convex Backend & Database APIs**: Real-time database for user and expense synchronization.
- **Clerk Authentication**: Secure auth with protected routes and server-side middleware.
- **Inngest Workflow Automation**:
  - Daily payment reminder cron job at 9:00 AM UTC.
  - Monthly AI insights digest on the 1st of every month.
- **Resend Email Integration**: Automated email notifications and digests.
- **AI-Powered Insights**: Automated spending optimization breakdown.
- **Vercel Cloud Deployment**: Production-ready configuration.

## Getting Started

1. Clone repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Start Convex backend:
   ```bash
   npx convex dev
   ```
