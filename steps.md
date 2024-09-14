
### Key Implementation Steps:

- **HTML Structure**:
  - Create the basic structure in `index.html`.
  - Add `<base>` tag for external links to Hacker News.
  - Include:
    - Header with title and description.
    - Search bar with input field and button.
    - Section to display the fetched news articles (`newsContainer`).

- **CSS for Styling** (`styles.css`):
  - Use `:root` variables to define primary colors for easy theme changes.
  - Define layout and style for the body, header, container, and search bar.
  - Implement grid layout for the `newsContainer` to create responsive design.
  - Style individual `news-card` elements with padding, borders, and links for article display.

- **JavaScript for Functionality** (`scripts.js`):
  - Select input, button, and news container elements via `getElementById`.
  - Add a click event listener to the search button to capture the search query.
  - Use **Hacker News API** to fetch results based on the search query.
  - Dynamically inject fetched articles into `newsContainer` by creating `div` elements.
  - Display article title, author, and points in each card, linking the title to the article's URL.

- **Connecting Files**:
  - In `index.html`, link `styles.css` for styling.
  - Link `scripts.js` for JavaScript functionality at the bottom of the HTML body.
- **Creating Unit Tests** - develop unit tests for testing the functions
- **Documentation** - Creating the README Files
- **Deployment** - Ensuring the project is clean no commented code.

### Notes:
- **API Endpoint**: HackerNews API `https://hn.algolia.com/api/v1/search?query=`
- **Responsiveness**: Grid layout in CSS allows cards to adjust based on screen size.
- **Dynamic Content**: JavaScript appends each fetched article as a new card in the news container.

