# Habit Tracker App

A mobile-first web application for tracking daily progress on user-defined habits with visual calendar feedback.

## Features

- Create and manage multiple habits to track
- Mark habits as completed or missed for each day
- View progress on an interactive calendar with checkmarks (✓) and X marks (✗)
- Track streaks of consecutive days completed
- See monthly completion statistics
- Data is persisted in a PostgreSQL database

## Technology Stack

- **Frontend**: React with TypeScript, TailwindCSS, ShadcnUI components
- **Backend**: Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful JSON API

## Getting Started

### Prerequisites

- Node.js v20 or higher
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone <your-repository-url>
   cd habit-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   ```

4. Push the database schema:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Create a new habit by entering a name and optional reminder time
2. Mark habits as completed or missed each day
3. View your progress on the calendar
4. Track your streaks and monthly statistics
5. Add multiple habits to track different goals

## License

This project is licensed under the MIT License - see the LICENSE file for details.