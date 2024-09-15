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
function showPopup(message) {
    const popUp = document.getElementById('popUp');
    const popUpMessage = document.getElementById('popUpMessage');
    popUpMessage.textContent = message;
    popUp.style.display = 'flex';

    document.getElementById('closePopupBtn').addEventListener('click', () => {
        popUp.style.display = 'none';
    });
}

// Function to fetch and display initial stories
async function fetchStories(storyType) {
    try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/${storyType}.json`);
        const data = await response.json();
        allStories = data;
        if (storyType === 'newstories') {
            newestStories = data;
        }
        currentPage = 0;
        postsContainer.innerHTML = '';
        loadMorePosts();
        updateActiveNavItem(storyType);
    } catch (error) {
        console.error('Error fetching stories:', error);
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
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
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
async function checkForNewPosts() {
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