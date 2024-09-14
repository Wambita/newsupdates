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

//display updates
function displayUpdates() {
    updatesContent.innerHTML = `
    <p>New Items: ${updates.items.length}</p>
    <p>Updated profiles: ${updates.profiles.length}</p> `
}