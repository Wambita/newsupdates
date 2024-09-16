const { fetchStories } = require('../yourScript');

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
