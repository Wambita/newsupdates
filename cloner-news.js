
  const postsContainer = document.getElementById('posts');
  const loadMoreButton = document.getElementById('load-more');
  const updatesContent = document.getElementById('updates-content');
  const liveUpdates = document.getElementById('live-updates');
  const postTypeNav = document.getElementById('post-type-nav');
  
  let currentPage = 0;
  const postsPerPage = 30;
  let allStories = [];
  let currentStoryType = 'topstories';

  async function fetchStories(storyType) {
    try {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/${storyType}.json`);
      const data = await response.json();
      allStories = data;
      currentPage = 0;
      postsContainer.innerHTML = '';
      loadMoreButton.style.display = 'block';
      loadMorePosts();
      updateActiveNavItem(storyType);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  }

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

  async function loadMorePosts() {
    const start = currentPage * postsPerPage;
    const end = start + postsPerPage;
    const pageStories = allStories.slice(start, end);

    for (const storyId of pageStories) {
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
        const story = await response.json();
        displayPost(story);
      } catch (error) {
        console.error('Error fetching story:', error);
      }
    }

    currentPage++;
    if (currentPage * postsPerPage >= allStories.length) {
      loadMoreButton.style.display = 'none';
    }
  }

  function formatDate(timestamp) {
    // Converts the Unix timestamp to a readable date string
    return new Date(timestamp * 1000).toLocaleString();
  }
  
  function displayPost(post) {
    // Determine whether to use "point" or "points"
    const pointsLabel = post.score === 1 ? 'point' : 'points';
  
    const listItem = document.createElement('li');
    listItem.className = 'post';
  
    listItem.innerHTML = `
      <div class="post-content">
        <h2>${post.title}</h2>
        <p class="post-info">By: ${post.by} | Score: ${post.score} ${pointsLabel} | Posted: ${formatDate(post.time)}</p>
        ${post.url ? `<a href="${post.url}" target="_blank">Read more</a>` : ''}
        <button class="load-comments" data-id="${post.id}">Load Comments</button>
        <div class="comments-grid" id="comments-${post.id}" style="display: none;"></div>
      </div>
    `;
  
    postsContainer.appendChild(listItem);
  
    // Add event listener for the comments button
    const loadCommentsButton = listItem.querySelector('.load-comments');
    loadCommentsButton.addEventListener('click', () => loadComments(post.id));
  }
  
  
  

  async function loadComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    commentsContainer.innerHTML = 'Loading comments...';

    try {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${postId}.json`);
      const post = await response.json();
      const commentIds = post.kids || [];

      commentsContainer.innerHTML = '';

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

  function displayComment(comment, container) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
      <div class="comment-meta">By ${comment.by} | ${new Date(comment.time * 1000).toLocaleString()}</div>
      <div>${comment.text}</div>
    `;
    container.appendChild(commentElement);
  }

  async function fetchUpdates() {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/updates.json');
      const updates = await response.json();
      displayUpdates(updates);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  }

  function displayUpdates(updates) {
    updatesContent.innerHTML = `
      <p>New Items: <a href="#" class="new-items-link" data-items="${updates.items.join(',')}">${updates.items.length}</a></p>
      <p>Updated Profiles: ${updates.profiles.length}</p>
    `;

    const newItemsLink = updatesContent.querySelector('.new-items-link');
    newItemsLink.addEventListener('click', (e) => {
      e.preventDefault();
      const newItemIds = e.target.dataset.items.split(',');
      displayNewItems(newItemIds);
    });
  }

  async function displayNewItems(itemIds) {
    postsContainer.innerHTML = '';
    for (const itemId of itemIds) {
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json`);
        const item = await response.json();
        if (item.type === 'story' || item.type === 'job' || item.type === 'poll') {
          displayPost(item);
        }
      } catch (error) {
        console.error('Error fetching new item:', error);
      }
    }
    window.scrollTo(0, 0);
  }

  liveUpdates.addEventListener('click', fetchUpdates);

  postTypeNav.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A') {
      const storyType = e.target.dataset.type;
      currentStoryType = storyType;
      fetchStories(storyType);
    }
  });

  loadMoreButton.addEventListener('click', loadMorePosts);

  fetchStories(currentStoryType);
  setInterval(fetchUpdates, 5000);

  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (currentPage * postsPerPage < allStories.length) {
        loadMorePosts();
      }
    }
  });

