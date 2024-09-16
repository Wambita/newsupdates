const postsContainer = document.getElementById('posts');
const loadMoreButton = document.getElementById('load-more');
const updatesContent = document.getElementById('updates-content');
const liveUpdates = document.getElementById('live-updates');
const postTypeNav = document.getElementById('post-type-nav');

const ITEMS_PER_PAGE = 10;
const UPDATE_INTERVAL = 5000; // 5 seconds
let currentPage = 0;
let allStories = [];
let currentStoryType = 'topstories';
let lastCheckTime = Date.now();
let newestStories = [];

// Function to show popup
function showPopup(message, duration = 40000) { // duration in milliseconds (40 seconds)
  const popUp = document.getElementById('popUp');
  const popUpMessage = document.getElementById('popUpMessage');
  
  // Set the message and make the popup visible
  popUpMessage.textContent = message;
  popUp.style.display = 'block';
  
  // Remove the fade-out class after the specified duration
  setTimeout(() => {
    popUp.classList.add('fade-out');
    
    // Hide the popup after the fade-out transition ends
    setTimeout(() => {
      popUp.style.display = 'none';
    }, 1000); // Match with the transition duration (1 second)
  }, duration); // Delay before starting fade-out (40 seconds)
}

// Function to fetch and display initial stories
async function fetchStories(storyType) {
  try {
    if (storyType === 'pollstories') {
      await fetchAndDisplayPoll();
    } else if (storyType === 'jobstories') {
      await fetchAndDisplayJobs();
    } else {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/${storyType}.json`);
      const data = await response.json();

      // Sort stories by timestamp (latest first)
      data.sort((a, b) => b.time - a.time);

      allStories = data;

      if (storyType === 'newstories') {
        newestStories = data;
      }

      currentPage = 0;
      postsContainer.innerHTML = '';
      loadMorePosts();
      loadMoreButton.style.display = storyType === 'pollstories' ? 'none' : 'block'; // Hide "Load More" button for polls
    }
    updateActiveNavItem(storyType);
  } catch (error) {
    console.error('Error fetching stories:', error);
  }
}

// Function to fetch and display the specific poll
async function fetchAndDisplayPoll() {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/item/126809.json');
    const pollData = await response.json();
    displayPoll(pollData);
  } catch (error) {
    console.error('Error fetching poll:', error);
  }
}

// Function to display the poll
function displayPoll(poll) {
  postsContainer.innerHTML = ''; // Clear existing content
  
  // Create a container for the poll
  const pollContainer = document.createElement('div');
  pollContainer.className = 'post'; // Use the same class as for other posts

  // Set the inner HTML with the poll details
  pollContainer.innerHTML = `
    <div class="poll-content">
      <h2 class="poll-title">${poll.title}</h2>
      <p class="post-meta">By: ${poll.by} | Posted: ${new Date(poll.time * 1000).toLocaleString()}</p>
      <div id="poll-options" class="poll-options"></div>
      <button id="load-comments-btn" class="load-comments">Load Comments</button>
      <div id="poll-comments" class="poll-comments"></div>
    </div>
  `;
  
  // Append the pollContainer to the postsContainer
  postsContainer.appendChild(pollContainer);

  // Fetch and display poll options
  fetchPollOptions(poll.parts);

  // Add event listener for loading comments
  const loadCommentsButton = document.getElementById('load-comments-btn');
  loadCommentsButton.addEventListener('click', () => fetchPollComments(poll.id));
}

// Function to fetch poll options
async function fetchPollOptions(optionIds) {
  const optionsContainer = document.getElementById('poll-options');
  optionsContainer.innerHTML = 'Loading poll options...';

  try {
    const options = await Promise.all(optionIds.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
    ));

    optionsContainer.innerHTML = '';
    options.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'poll-option';
      optionElement.innerHTML = `
        <p>${option.text}</p>
        <p>Votes: ${option.score}</p>
      `;
      optionsContainer.appendChild(optionElement);
    });
  } catch (error) {
    console.error('Error fetching poll options:', error);
    optionsContainer.innerHTML = 'Error loading poll options. Please try again.';
  }
}

// Function to fetch poll comments
async function fetchPollComments(pollId) {
  const commentsContainer = document.getElementById('poll-comments');
  commentsContainer.innerHTML = 'Loading comments...';
  
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${pollId}.json`);
    const poll = await response.json();
    const commentIds = poll.kids || [];

    if (commentIds.length === 0) {
      commentsContainer.innerHTML = 'No comments';
      return;
    }

    commentsContainer.innerHTML = '';
    // Fetch and sort comments
    const comments = await Promise.all(
      commentIds.map(async (commentId) => {
        const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
        return commentResponse.json();
      })
    );

    // Sort comments by timestamp (latest first)
    comments.sort((a, b) => b.time - a.time);

    // Display comments
    comments.forEach(comment => displayComment(comment, commentsContainer));
  } catch (error) {
    console.error('Error loading comments:', error);
    commentsContainer.innerHTML = 'Error loading comments. Please try again.';
  }
}

// Function to fetch and display jobs
async function fetchAndDisplayJobs() {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json');
    const jobStories = await response.json();

    // Sort jobs by timestamp (latest first)
    jobStories.sort((a, b) => b.time - a.time);

    allStories = jobStories;
    currentPage = 0;
    postsContainer.innerHTML = '';
    loadMorePosts();
    loadMoreButton.style.display = 'block'; // Ensure "Load More" button is visible for jobs
  } catch (error) {
    console.error('Error fetching job stories:', error);
  }
}

// Function to update the active navigation item
function updateActiveNavItem(type) {
  const navItems = postTypeNav.querySelectorAll('a');
  navItems.forEach(item => {
    if (item.dataset.type === type) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Function to load more posts in chunks
async function loadMorePosts() {
  if (currentStoryType === 'pollstories') return; // Do nothing if current type is pollstories

  const start = currentPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageStories = allStories.slice(start, end);

  for (const storyId of pageStories) {
    try {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
      const story = await response.json();

      if (currentStoryType === 'topstories' && story.type === 'story' ||
          currentStoryType === 'newstories' && story.type === 'story' ||
          currentStoryType === 'jobstories' && story.type === 'job') {
        displayPost(story);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  }

  currentPage++;

  if (currentPage * ITEMS_PER_PAGE >= allStories.length) {
    loadMoreButton.style.display = 'none';
  } else {
    loadMoreButton.style.display = 'block';
  }
}

// Function to display a single post
function displayPost(post) {
  const listItem = document.createElement('li');
  listItem.className = 'post';
  listItem.innerHTML = `
    <div>
      <a href="${post.url}" class="post-title" target="_blank">${post.title}</a>
      <p class="post-meta">By: ${post.by} | Score: ${post.score} points | Posted: ${new Date(post.time * 1000).toLocaleString()}</p>
      ${post.url ? `<a href="${post.url}" target="_blank" class="read-more">Read more</a>` : ''}
    </div>
    <button class="load-comments" data-id="${post.id}">Load Comments</button>
    <div class="comments-grid" id="comments-${post.id}"></div>
  `;

  postsContainer.appendChild(listItem);

  const loadCommentsButton = listItem.querySelector('.load-comments');
  loadCommentsButton.addEventListener('click', () => loadComments(post.id));
}

// Function to load comments for a post
async function loadComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    commentsContainer.innerHTML = 'Loading comments...';
    
    try {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${postId}.json`);
      const post = await response.json();
      const commentIds = post.kids || [];
  
      if (commentIds.length === 0) {
        commentsContainer.innerHTML = 'No comments';
        return;
      }
  
      commentsContainer.innerHTML = '';
      // Fetch and sort comments
      const comments = await Promise.all(
        commentIds.map(async (commentId) => {
          const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
          return commentResponse.json();
        })
      );
  
      // Sort comments by timestamp (latest first)
      comments.sort((a, b) => b.time - a.time);
  
      // Display comments
      comments.slice(0, 6).forEach(comment => displayComment(comment, commentsContainer));
    } catch (error) {
      console.error('Error loading comments:', error);
      commentsContainer.innerHTML = 'Error loading comments. Please try again.';
    }
  }

// Function to display a single comment
function displayComment(comment, container) {
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';
  commentElement.innerHTML = `
    <div class="comment-meta">By ${comment.by} | ${new Date(comment.time * 1000).toLocaleString()}</div>
    <div>${comment.text}</div>
  `;
  container.appendChild(commentElement);
}

// Function to check for new posts
let isThrottled = false; // Throttling flag
const THROTTLE_INTERVAL = 5000; // Throttle requests for 5 seconds

// Function to check for new posts with throttling
async function checkForNewPosts() {
  // If already throttled, return early
  if (isThrottled) {
    return;
  }

  // Set the throttling flag
  isThrottled = true;

  // Continue with the rest of the function
  if (currentStoryType === 'newstories') {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');
      const latestStories = await response.json();
      const newStories = latestStories.filter(id => !newestStories.includes(id));

      if (newStories.length > 0) {
        showPopup(`${newStories.length} new post${newStories.length > 1 ? 's' : ''} available. Click "Newest" to view ${newStories.length > 1 ? 'them' : 'it'}.`);
        newestStories = latestStories;
      }
    } catch (error) {
      console.error('Error checking for new posts:', error);
    }
  }

  // Release the throttling flag after the interval
  setTimeout(() => {
    isThrottled = false;
  }, THROTTLE_INTERVAL);
}


// Event listeners
liveUpdates.addEventListener('click', checkForNewPosts);
postTypeNav.addEventListener('click', (e) => {
  e.preventDefault();
  if (e.target.tagName === 'A') {
    const storyType = e.target.dataset.type;
    currentStoryType = storyType;
    fetchStories(storyType);
  }
});
loadMoreButton.addEventListener('click', loadMorePosts);

// Fetch initial stories
fetchStories(currentStoryType);

// Set interval for checking new posts
setInterval(checkForNewPosts, UPDATE_INTERVAL);

// Debounced scroll event listener
let debounceTimeout;
function onScroll() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (currentPage * ITEMS_PER_PAGE < allStories.length) {
        loadMorePosts();
      }
    }
  }, 100);
}
window.addEventListener('scroll', onScroll);
