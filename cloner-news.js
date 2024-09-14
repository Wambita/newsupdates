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
async function fetchStories() {
    
}