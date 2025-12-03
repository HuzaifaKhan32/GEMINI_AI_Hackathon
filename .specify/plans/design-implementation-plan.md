# Design Implementation Plan

This plan details the process for converting the static design mockups from `/design/stitch_ai_robotics_book_homepage/` into a functional Docusaurus website.

## 1. Design Analysis

Based on the `code.html` files, the following design elements have been identified:

### Color Scheme:
- **Primary Color (Homepage):** `#4A00E0` (a vibrant purple)
- **Primary Color (Chapter Page):** `#3B82F6` (a standard blue)
- **Background (Dark):** `#0D1B2A` (Homepage), `#111121` (Chapter)
- **Background (Light):** `#F0F2F5` (Homepage), `#f6f6f8` (Chapter)
- **Text (Dark):** `#0D1B2A` / `rgb(13, 27, 42)`
- **Text (Light):** `#F0F2F5` / `rgb(240, 242, 245)`
- **Accent/Borders:** Various shades of gray/slate, e.g., `border-gray-200/20`.

*Decision: We will unify the color scheme. The blue-based scheme from the chapter and chatbot pages (`primary: #3B82F6`, `background-dark: #111121`) appears more modern and is more consistent across the detailed views. This will be the primary color scheme for the Docusaurus site.*

### Typography:
- **Display Font:** 'Space Grotesk'
- **Icons:** Material Symbols Outlined

### Layout Structure:
- **Homepage:** Centered, single-column layout with a prominent hero section and a grid-based chapter list.
- **Chapter Page:** Three-column layout:
    - Left Sidebar: Main navigation (list of chapters).
    - Center Column: Main chapter content (prose, code, images).
    - Right Sidebar: "On This Page" navigation (table of contents for the current page).
- **Header:** Contains logo, title, search bar, and theme/GitHub buttons.
- **Footer:** Simple, with links and copyright notice.

### Spacing & Components:
- **Rounding:** Consistent use of `rounded-lg` and `rounded-xl`.
- **Cards:** Chapter cards on the homepage have a hover effect.
- **Buttons:** Clear primary and secondary button styles.

## 2. Docusaurus Conversion Plan

Docusaurus will be themed to match the analyzed design.

### Steps:
1.  **Initialize Docusaurus:** Set up a new Docusaurus "classic" project.
2.  **Configure `docusaurus.config.js`:**
    -   Set up the navbar to include the site title, a link to the GitHub repo, and a dark mode toggle.
    -   Configure the footer with the required links (Privacy, Contact, etc.).
    -   Define the sidebar for the book chapters (`sidebars.js`).
3.  **Custom Styling (`src/css/custom.css`):**
    -   Define CSS variables for the chosen color palette.
    -   Override Docusaurus default styles to match the font ('Space Grotesk'), colors, and component styles (buttons, cards, etc.).
    -   Use the `--ifm-` variables provided by Docusaurus to ensure consistency.
4.  **Create Custom React Components:** Convert static HTML elements into reusable React components.

## 3. Required React Components (`src/components/`)

-   **`HomepageHeader.js`:** The hero section for the main `index.js` page, including the title, subtitle, and "Start Reading" button.
-   **`ChapterGrid.js`:** A component to display the grid of chapter cards on the homepage. Each card will link to the corresponding chapter document.
-   **`CustomFooter.js`:** A custom footer component to match the design, replacing the Docusaurus default.
-   **`FloatingChatbotButton.js`:** The floating action button for the RAG chatbot.
-   **`ChatbotPanel.js`:** The main panel/UI for the chatbot interaction.

## 4. Styling Approach

-   A global stylesheet (`src/css/custom.css`) will be used to set the overall theme (colors, fonts, base styles).
-   Docusaurus's Infima CSS framework will be leveraged and customized.
-   Where necessary, CSS Modules will be used for component-specific styles to avoid class name collisions, particularly for the custom chatbot components.
