// mock the API responses for functions like fetchStories
const { fetchStories } = require('../cloner-news.js');

describe('Story Fetching', () => {
  beforeEach(() => {
    fetch.resetMocks(); // Reset the fetch mock before each test
  });

  test('fetches and displays top stories', async () => {
    // Mock API response
    fetch.mockResponseOnce(JSON.stringify([1, 2, 3]));

    document.body.innerHTML = '<div id="posts"></div><button id="load-more"></button>';
    
    await fetchStories('topstories');
    
    expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/topstories.json');
    expect(document.getElementById('posts').children.length).toBeGreaterThan(0); // Assuming stories get added
  });
});
// Test the showPopup function that manipulates the DOM.
const { showPopup } = require('../cloner-news.js');

describe('Popup Functionality', () => {
  beforeEach(() => {
    // Set up the HTML structure for the test
    document.body.innerHTML = `
      <div id="popUp" style="display:none"></div>
      <div id="popUpMessage"></div>
      <button id="closePopupBtn"></button>
    `;
  });

  test('displays popup with message', () => {
    showPopup('Test message');
    
    expect(document.getElementById('popUpMessage').textContent).toBe('Test message');
    expect(document.getElementById('popUp').style.display).toBe('flex');
  });

  test('closes popup on button click', () => {
    showPopup('Test message');

    // Simulate button click
    document.getElementById('closePopupBtn').click();
    
    expect(document.getElementById('popUp').style.display).toBe('none');
  });
});
// Test for event listeners on the loadMoreButton
const { loadMorePosts } = require('../cloner-news');

describe('Load More Button', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="load-more"></button>';
    loadMorePosts = jest.fn(); // Mock loadMorePosts function
    document.getElementById('load-more').addEventListener('click', loadMorePosts);
  });

  test('clicking load more triggers loadMorePosts', () => {
    document.getElementById('load-more').click();
    expect(loadMorePosts).toHaveBeenCalled();
  });
});
