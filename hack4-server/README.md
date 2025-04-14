# VISIO Chat Bot Backend

A NestJS-based backend server for the VISIO chat bot application that provides intelligent responses to user queries.

## Project Overview

This project serves as the backend for a conversational AI chatbot with the following features:

- AI-powered question answering using OpenAI's embeddings
- FAQ database with semantic search capabilities
- Hierarchical organization of knowledge (categories, subcategories)
- Document management system
- Chat history tracking and analysis
- User question similarity detection
- Automated embedding generation for new content
- Admin user management

## Tech Stack

- NestJS framework
- TypeORM for database interactions
- PostgreSQL database
- OpenAI API integration
- Scheduled tasks (Cron jobs)

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 13+
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see `.env.example`)
4. Start the development server: `npm run start:dev`
