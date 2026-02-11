# threads-of-shayari-v2

A modern, feature-rich social platform for sharing thoughts, poetry, and moments. Built with the latest web technologies to ensure performance, scalability, and a seamless user experience.

## 🌟 Overview

Threads of Shayari is a community-driven platform where users can share text and image posts, engage with content through reactions and comments, and connect with others. It features a clean, responsive UI and a robust backend.

---

## 📖 User Stories (For Clients)

### 🚀 Onboarding & Access

- **Instant Access**: "As a new user, I can sign up and immediately access the platform without waiting for manual approval."
- **Secure Login**: "As a user, I can securely log in to my account to access my personalized feed."

### 📝 Content Creation

- **Share Thoughts**: "As a user, I can create text posts to share my poetry, thoughts, or updates."
- **Share Moments**: "As a user, I can upload images to make my posts more engaging."
- **Manage Content**: "As a user, I can delete my own posts if I change my mind."

### 🤝 Engagement

- **Express Emotions**: "As a user, I can react to posts using a variety of emojis (Like, Love, Haha, Wow, Sad, Angry) to express how I feel."
- **Audio Comments**: "As a user, I can add audio presets (sound effects/music) to my comments to make them more expressive and fun."
- **Join Conversations**: "As a user, I can comment on posts to discuss topics with other community members."
- **Share Snapshots**: "As a user, I can generate beautiful image cards of posts to share on Instagram, WhatsApp, and other platforms."

### 👤 Profile

- **Identity**: "As a user, I have a profile that displays my posts and details, helping others recognize me."

---

## 🛠️ Technical Overview (For Developers)

This project is built using a modern full-stack TypeScript architecture, prioritizing type safety, performance, and developer experience.

### 🏗️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start/latest) (React 19 + Vite) - Server-Side Rendering (SSR) and Server Functions.
- **Language**: TypeScript - End-to-end type safety.
- **Database**: PostgreSQL (Neon Serverless) - Scalable relational database.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Lightweight and type-safe database access.
- **Authentication**: [Better Auth](https://www.better-auth.com/) - Secure, customizable authentication with Drizzle adapter.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) - Async state management with caching and optimistic updates.
- **Forms**: React Hook Form + Zod - Robust form handling and validation.
- **Media**: Cloudinary - Optimized image storage and delivery.
- **Notifications**: Firebase Cloud Messaging (FCM) - Push notifications.

### 🏛️ Architecture Highlights

- **Server Functions**: API logic is co-located with components using TanStack Start's server functions, reducing boilerplate and ensuring type safety across the network boundary.
- **Optimistic UI**: Reactions and other interactions update instantly on the UI while syncing with the server in the background, providing a snappy feel.
- **File-Based Routing**: Uses TanStack Router for type-safe, filesystem-based routing.
- **Component Architecture**: Modular components utilizing `shadcn/ui` patterns for consistency and accessibility.

### 📂 Key Directories

- `src/routes`: Application routes (File-system based).
- `src/data/db`: Database schema and connection logic.
- `src/data/functions`: Server-side business logic and API endpoints.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, schemas, and configurations.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL Database
- Cloudinary Account
- Firebase Project (for notifications)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd threads-of-shayari-v2
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    # or
    bun install
    ```

3.  **Environment Setup**:
    Create a `.env` file and configure your credentials:

    ```env
    DATABASE_URL=...
    BETTER_AUTH_SECRET=...
    CLOUDINARY_CLOUD_NAME=...
    # ... other variables
    ```

4.  **Database Migration**:

    ```bash
    npm run db:push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.
