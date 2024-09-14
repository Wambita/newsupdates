// Select elements
const postsContainer = document.getElementById('posts');
const loadMoreButton = document.getElementById('load-more');
const updatesContent = document.getElementById('updates-content');
const liveUpdates = document.getElementById('live-updates');

let currentPage = 0; // Page number for top stories
const postsPerPage = 10; // Number of posts per page
let allStories = []; // Array to store all fetched stories
let currentStoryType = 'topstories'; // Current story type (topstories, jobs, polls)
let isLoading = false; // Prevent multiple requests at the same time

// Fetch and display initial stories
async function fetchStories(storyType) {
  try {
    // Fetch top stories, jobs, or polls based on storyType
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/${storyType}.json`);
    const data = await response.json(); // Parse JSON response
    allStories = data; // Store story IDs
    currentPage = 1; // Reset page number
    postsContainer.innerHTML = ''; // Clear previous posts
    loadMoreButton.style.display = 'block'; // Show "Load More" button
    loadMorePosts(); // Load first page of posts
  } catch (error) {
    console.error('Error fetching stories:', error);
  }
}

// Load more posts on scroll or button click
async function loadMorePosts() {
  if (isLoading) return; // Prevent multiple requests
  isLoading = true;

  const start = currentPage * postsPerPage; // Start index
  const end = start + postsPerPage; // End index
  const pageStories = allStories.slice(start, end); // Get current page stories

  for (const storyId of pageStories) {
    try {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
      const story = await response.json();
      displayPost(story); // Display story, job, or poll
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  }

  currentPage++; // Increment page number
  if (currentPage * postsPerPage >= allStories.length) {
    loadMoreButton.style.display = 'none'; // Hide "Load More" button if all posts are loaded
  }
  isLoading = false;
}

// Display stories, jobs, or polls
function displayPost(post) {
  const listItem = document.createElement('li');
  listItem.className = 'post';

  // Check if the post is a story, job, or poll
  let postType = 'Story';
  if (post.type === 'job') {
    postType = 'Job';
  } else if (post.type === 'poll') {
    postType = 'Poll';
  }

  listItem.innerHTML = `
    <div>
      <a href="${post.url || '#'}" class="post-title" target="_blank">${post.title || 'No title'}</a>
      <p class="post-meta">${postType} by ${post.by} | ${post.score || 0} points | ${new Date(post.time * 1000).toLocaleString()}</p>
    </div>
    ${postType === 'Poll' ? displayPoll(post) : ''}
    <button class="load-comments" data-id="${post.id}">Load Comments</button>
    <div class="comments-grid" id="comments-${post.id}"></div>
  `;

  postsContainer.appendChild(listItem);

  // Add event listener to load comments button
  const loadCommentsButton = listItem.querySelector('.load-comments');
  loadCommentsButton.addEventListener('click', () => loadComments(post.id));
}

// Display poll details if the post is a poll
function displayPoll(post) {
  return `<div class="poll-details">Poll Options: ${post.parts ? post.parts.length : 0}</div>`;
}

// Load comments for a specific post
async function loadComments(postId) {
  const commentsContainer = document.getElementById(`comments-${postId}`);
  commentsContainer.innerHTML = 'Loading comments...';

  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${postId}.json`);
    const post = await response.json();
    const commentIds = post.kids || []; // Get comment IDs

    commentsContainer.innerHTML = ''; // Clear comments container

    // Fetch and display up to 6 comments
    for (const commentId of commentIds.slice(0, 6)) {
      try {
        const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
        const comment = await commentResponse.json();
        displayComment(comment, commentsContainer);
      } catch (error) {
        console.error('Error fetching comment:', error);
      }
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    commentsContainer.innerHTML = 'Error loading comments. Please try again.';
  }
}

// Display individual comments
function displayComment(comment, container) {
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';
  commentElement.innerHTML = `
    <div class="comment-meta">By ${comment.by} | ${new Date(comment.time * 1000).toLocaleString()}</div>
    <div>${comment.text || ''}</div>
  `;
  container.appendChild(commentElement);
}

// Implement infinite scroll
window.addEventListener('scroll', () => {
  // Check if user scrolled near bottom of page
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    if (currentPage * postsPerPage < allStories.length) {
      loadMorePosts(); // Load more posts if available
    }
  }
});

// Fetch initial stories
fetchStories(currentStoryType);
