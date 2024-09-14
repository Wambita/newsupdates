//select elements for 
const postsContainer = document.getElementById('posts')
const loadMoreButton = document.getElementById('load-more')
const updatesContent = document.getElementById('updates-content')
const liveUpdates = document.getElementById('live-updates')

let currentPage = 0 // page number for top stories
const postsPerPage = 20 
let allStories = [] // array to store all fetched stories
let currentStoryType = 'topstories' // current story type (topstories, updates, live-updates)

// fetch and display top stories
async function fetchStories(storyType) {
    try{
        //fetch top stories
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/${storyType}.json`)
        const data = await response.json() //parse JSON response
        allStories = data //store story ids in the array
        currentPage = 1 //reset page number to 1
        postsContainer.innerHTML = '' //clear posts container before appending new ones
        loadMoreButton.style.display = 'block' //show load more button
        loadMorePosts() //load first page of posts
    } catch(error) {
        console.error('Error fetching stories:', error)
    }
}

//load posts
async function loadMorePosts() {
    const start = currentPage * postsPerPage //start index for posts
    const end = start + postsPerPage //index for end of posts
    const pageStories = allStories.slice(start, end) //get stories for the current page

    for(const storyId of pageStories) {
        try{
            //fetch story details by id
            const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
            const story = await response.json() //parse JSON response
            displayPost(story) //display post on the page
        } catch(error) {
            console.error('Error fetching story:', error)
        }
        currentPage++ //increment page number
        //hide load more button when all posts are loaded
        if(currentPage * postsPerPage >= allStories.length) {
            loadMoreButton.style.display = 'none'
        }
    }
}

//display posts
function displayPost(post){
    const listItem = document.createElement('li') //create a list item for the post
    listItem.className = 'post' //classname for styling
    listItem.innerHTML = `
    <div>
 <a href="${post.url}" class="post-title" target="_blank">${post.title}</a>
    <p class="post-meta"> By ${post.by} | ${post.score} points | ${new Date(post.time * 1000).toLocaleString()}</p>
    </div>
    <button class="load-comments" data-id="${post.id}">Load Comments</button>
   <div class="comments-grid" id="comments-${post.id}"></div>
    `
    postsContainer.appendChild(listItem) //append post to the posts container
    //add event listener to load comments button
    const loadCommentsButton = listItem.querySelector('.load-comments')
    loadCommentsButton.addEventListener('click', () => loadComments(post.id))
} 

 // load comments for a specific post
 async function loadComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`); // Get the container for comments
    commentsContainer.innerHTML = 'Loading comments...'; // Show loading text

    try {
      // Fetch the post to get the comment IDs
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${postId}.json`);
      const post = await response.json(); // Parse JSON data
      const commentIds = post.kids || []; // Get the comment IDs

      commentsContainer.innerHTML = ''; // Clear the comments container

      // Fetch and display each comment (up to 6)
      for (const commentId of commentIds.slice(0, 6)) {
        try {
          const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
          const comment = await commentResponse.json(); // Parse JSON data
          displayComment(comment, commentsContainer); // Display the comment
        } catch (error) {
          console.error('Error fetching comment:', error); // Log errors if any
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error); // Log errors if any
      commentsContainer.innerHTML = 'Error loading comments. Please try again.'; // Show error message
    }
  }

  // display a comment
  function displayComment(comment, container) {
    const commentElement = document.createElement('div'); // Create a new div for the comment
    commentElement.className = 'comment'; // Assign a class name for styling
    commentElement.innerHTML = `
      <div class="comment-meta">By ${comment.by} | ${new Date(comment.time * 1000).toLocaleString()}</div>
      <div>${comment.text}</div>
    `;
    container.appendChild(commentElement); // Append the comment to the container
  }


  //fetch live updates
  async function fetchUpdates() {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/updates.json'); // Fetch updates
      const updates = await response.json(); // Parse JSON data
      displayUpdates(updates); // Display the updates
    } catch (error) {
      console.error('Error fetching updates:', error); // Log errors if any
    }
  }

  //display updates
  function displayUpdates(updates) {
    updatesContent.innerHTML = `
    <p>New Items: ${updates.items.length}</p>
    <p>Updated profiles: ${updates.profiles.length}</p> `
}


// Event listener for live updates button
liveUpdates.addEventListener('click', async () => {
    const updates = await fetchUpdates(); // Fetch updates
    if (updates && updates.items.length > 0) {
      const latestItemId = updates.items[0]; // Get the latest item ID
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${latestItemId}.json`);
        const latestItem = await response.json(); // Parse JSON data
        displayPost(latestItem); // Display the latest post
        window.scrollTo(0, 0); // Scroll to the top of the page
      } catch (error) {
        console.error('Error fetching latest item:', error); // Log errors if any
      }
    }
  });

  // Event listener for load more button
  loadMoreButton.addEventListener('click', loadMorePosts);

  // Fetch initial stories and start the interval for updates
  fetchStories(currentStoryType);
  setInterval(fetchUpdates, 5000); // Fetch updates every 5 seconds

  // Implement infinite scroll
  window.addEventListener('scroll', () => {
    // Check if the user has scrolled near the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (currentPage * postsPerPage < allStories.length) {
        loadMorePosts(); // Load more posts if available
      }
    }
  });