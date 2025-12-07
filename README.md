# Shiksha

**Shiksha** is an engineering-focused platform spun off from GenAI4Code. It provides developers with advanced engineering guides, research insights, and an AI-powered chatbot assistant.

## Project Status
This project was initialized by spinning off the Engineering and Research sections of GenAI4Code.
- **Removed**: News, Products, Insights, and the original marketing Homepage.
- **Added**: A new Engineering-focused Homepage and a Chatbot interface (`/chat`).
- **Retained**: The premium design system and UI components.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Navigate to the website directory:
   ```bash
   cd website
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features
- **Engineering Guides**: Deep dives into system design and implementation.
- **Research**: Access to cutting-edge AI research papers and findings.
- **Shiksha Chat**: An AI assistant to help with coding and architecture questions.

## Directory Structure
- `website/`: Next.js frontend application.
  - `src/app/engineering`: Engineering content.
  - `src/app/research`: Research content.
  - `src/app/chat`: Chatbot interface.
- `Roofiles_genai4code/`: Backend services and documentation (inherited).

## Next Steps
- Connect the Chat UI to a real backend/LLM service.
- Expand the content in the Engineering and Research sections.
- Finalize the database schema if specific Shiksha features require persistence.
