const STORE= {
    meal_key: 1,
    yt_key: "AIzaSyCFnYmhhtGkOdkgU-xnlDxB4fbTcyam03w",
    headerImg: 0,
    recentList: [],
    browseList: [],
    fullMenu: []
}

function getCooking(){
    createMenu();
    setTimeout(function(){
        manageInterface();
    }, 5000)
    
}
//----------------BUILD MENU--------------------
function createMenu(){
    // Add categories to Browse list
    fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?c=list`)
    .then(response => response.json())
    .then(responseJSON => addToBrowseList(responseJSON));
    // Add Areas to Browse List
    fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?a=list`)
    .then(response => response.json())
    .then(responseJSON => addToBrowseList(responseJSON));
}
function addToBrowseList(arr){
    arr.meals.map(meal =>{
        // Browse list done
        STORE.browseList.push(meal);
    })
    //Begin constructing complete full menu based on browse list results
    searchForIDs(STORE.browseList);
}
function searchForIDs(arr){
    // iterate through browse list filtered for ONLY area, to return meal objects with ID values
    arr.map(filter =>{
        if(filter.strArea){
            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/filter.php?a=${filter.strArea}`)
            .then(response => response.json())
            .then(responseJSON => queueMenu(responseJSON));
        }
    });
}
function queueMenu(arr){
    // Get dish info based on query filtered by ID values
    arr.meals.map(meal =>{
        fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/lookup.php?i=${meal.idMeal}`)
        .then(response => response.json())
        .then(responseJSON => addToMenu(responseJSON))
    })
}
function addToMenu(arr){
    // Add dishes to menu based on each unique ID value
    STORE.fullMenu.push(arr.meals[0]);
}

function manageInterface(){
    console.log("STORE values:");
    console.log(STORE);
    loadHeaderImage()
    
    setInterval(function() {
        loadHeaderImage()
    }, 5000)

    manageSearch();
    recentView();
    browseView();
}

//----------------SEARCH MANAGERS--------------------
function manageSearch(){
    $('#searchForm').submit(e =>{
        e.preventDefault();

        $('#results').empty();

        let searchValue = e.target.foodName.value;

        if (!searchValue){
            displayRandomDish();
        } else {
            $('#foodName').val('');
            addToRecentList(searchValue);
            findMatchingResults(searchValue);
        }
    })
}

function recentView(){
    $('#recent').click(e =>{
        e.preventDefault();
        displayRecentList();
    })
}

function browseView(){
    $('#browse').click(e =>{
        e.preventDefault();
        displayBrowseList();
    })
}

function loadHeaderImage(){
    let randomIndex = Math.floor(Math.random() * STORE.fullMenu.length-1);
    // console.log(STORE.fullMenu[randomIndex].strMealThumb);
    $('#hero').css('background-image',`url(${STORE.fullMenu[randomIndex].strMealThumb})`)
}
//----------------DISPLAY MANAGERS--------------------
function addToRecentList(str){
    if(!STORE.recentList.includes(str)){
        STORE.recentList.push(str);
        STORE.recentList.sort();
    }
}
function displayRecentList(){
    
    if (STORE.recentList.length === 0){
        $('#results').empty().append(`
            <h4 id="unavailable">You have not made any recent search inquiries... Please enter a value into the search bar above, or select a category from our Browse menu!</h4>
        `);
    } else {
        $('#results').empty().append(`
            <h4>Recent Searches:</h4>
        `);
        STORE.recentList.map(entry =>{
            $('#results').append(`
                <li class="instant-search">${entry}</li>
            `)
        })
        handleInstantSearch();
    }
    
    $('.hidden').removeClass();
}
function displayBrowseList(){
    $('#results').empty().append(`
        <h4>Browse Categories:</h4>
    `);
    STORE.browseList.map(entry =>{
        if (entry.strArea){
            $('#results').append(`
                <li class="instant-search area">${entry.strArea}</li>
            `);
        } else if (entry.strCategory){
            $('#results').append(`
                <li class="instant-search category">${entry.strCategory}</li>
            `);
        }
    })
    handleInstantSearch();
    $('.hidden').removeClass();
}

function displayRandomDish(){
    const index = Math.floor(Math.random() * STORE.fullMenu.length);
    const sampleMeal = STORE.fullMenu[index];

    loadDishes(sample =[[sampleMeal]]);
}

function findMatchingResults(str){
    $('#results').append(`
        <h4>Showing results for "${str}":</h4>
    `);

    const checkStr = str.toLowerCase().split(' ').join('+');

    const matchingResults = [];

    // console.log(`Searching ${checkStr}:`)

    STORE.fullMenu.map(dish =>{
        const checkDishName = dish.strMeal.toLowerCase().split(' ').join('');
        const checkDishCategory = dish.strCategory.toLowerCase().split(' ').join('');
        const checkDishArea = dish.strArea.toLowerCase().split(' ').join('');

        if (checkDishName.includes(checkStr)){
            if(!matchingResults.includes(dish.idMeal)){
                // console.log(`Found unique Name with ${checkStr} - add to list: ${dish.idMeal} - ${dish.strMeal}`);
                matchingResults.push(dish.idMeal);
            }   
        } else if (checkDishCategory.includes(checkStr)){
            if(!matchingResults.includes(dish.idMeal)){
                // console.log(`Found unique Category with ${checkStr} - add to list: ${dish.idMeal} - ${dish.strMeal}`);
                matchingResults.push(dish.idMeal);
            }
        } else if (checkDishArea.includes(checkStr)){
            if(!matchingResults.includes(dish.idMeal)){
                // console.log(`Found unique Area with ${checkStr} - add to list: ${dish.idMeal} - ${dish.strMeal}`);
                matchingResults.push(dish.idMeal);
            }
        }
    })

    displayMatchingResults(matchingResults);
}

function displayMatchingResults(arr){
    // console.log(`display matching results of:`);
    // console.log(arr);
    
    let relevantDishes = [];

    arr.map(id =>{
        // console.log(id);
        const dishWithMatchingID = STORE.fullMenu.filter(function(obj){
            return obj.idMeal === id;
        })
        // console.log(dishWithMatchingID);
        relevantDishes.push(dishWithMatchingID);
    })
    
    loadDishes(relevantDishes, relevantDishes.length);
}

function loadDishes(dishes, count = 0){
    // console.log('Relevant Dishes: ');
    // console.log(dishes);

    if (dishes.length === 0){
        $('#results').append(`
        <li id="unavailable">
            Sorry, we don't have any recipes for that search term. Please try again!
        </li>
        `);
    } else {
        dishes.map(dish =>{
            // console.log(dish[0]);
            $('#results').append(`
            <li class="dish" id="${dish[0].idMeal}">
                <h3 class="dish-name">${dish[0].strMeal.toUpperCase()}</h3>
                <section class="dish-info">
                    <img src="${dish[0].strMealThumb}" alt="Image of ${dish[0].strMeal}" class="dish-img"/>
                    <section class="dish-links">
                    <h4>Search Similar:</h4>
                        <ul class="dish-tags">
                            <li class="instant-search category">${dish[0].strCategory}</li>
                            <li class="instant-search area">${dish[0].strArea}</li>
                        </ul>
                        <button class="view-btn">Prep Videos</button>
                    </section>
                </section>
            </li>
        `);
        })
    }
    

    if (count === 0){
        $('.dish').after(`
        <li id="unavailable">
            If you don't enter a specific search term, you'll get a random recipe!
        </li>
        `);
    }
        
    handleInstantSearch();
    handleVideoLoad();
    $('.hidden').removeClass();
}

function handleInstantSearch(){
    $('.instant-search').click(function(){
        const searchVal = $(this).text();

        $('#foodName').val(searchVal);
        $('#searchForm').submit();
    })
}

function handleVideoLoad(){
    $('.view-btn').click(function() {
        $('#video-list').remove();
        
        const dishToAddVids = $(this).closest('.dish');
        dishToAddVids.append(`
            <section id="video-list">
                <h4>Related Videos:</h4>
                <ul id="related-vids">
                </ul>
            </section>
        `)

        let videoTag = dishToAddVids.find('.dish-name').text();
        videoTag = videoTag.split(' ').join('+');
        console.log(videoTag);
        
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=How+to+Make+${videoTag}&maxResults=2&key=${STORE.yt_key}`)
        .then(response => response.json())
        .then(responseJSON => appendVideo(responseJSON));
        
    })
    function appendVideo(arr){
        console.log(arr);
        arr.items.map(video =>{
            console.log(video)
            console.log(video.id.videoId)
            $(`#related-vids`).append(`
            <li class="video">
                <iframe 
                    src="https://www.youtube.com/embed/${video.id.videoId}"
                    frameborder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture">
                </iframe>
            </li>
            `)
        })
    }
    
    /*
    fetch(`https://www.googleapis.com/youtube/v3?key=${STORE.yt_key}`)
    .then(response => response.json())
    .then(responseJSON => console.log(responseJSON))
    */
}
//----------------INITIALIZE--------------------
$(getCooking);
/* OLD CODE
// -----------------------------------------SEARCH TYPE MANAGERS-------------------------------------//
// on form input submission, check for searchbar value and make search accordingly
function manageKeywordSearch(){
    $('#recipeForm').submit(e =>{
        e.preventDefault();

        if (!e.target.foodName.value){
            // if no value present in search bar, query a random dish
            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/random.php`)
            .then(response => response.json())
            .then(responseJSON => displayRandomResult(responseJSON));
        } else {
            // store the trimmed/split/joined version of input value, and assign it's type 'keyword'
            let dishName = e.target.foodName.value;
            dishName = dishName.trim().split(' ').join('+');

            STORE.term = dishName;
            STORE.termType = "keyword";

            beginSearch();
        }
    });
}
// on recent button click, load an array of recent search terms
function manageRecentSearch(){
    $('#recent').click(e =>{
        e.preventDefault();
        $('#results').empty();

        if(STORE.previousSearches.length > 0){
            
            STORE.previousSearches.map(str =>{
                $('#results').append(`
                <li class="instant-search" data-type="${str.termType}" data-value="${str.term}">
                    ${str.term}
                </li>
                `);
            })

            handleInstantSearch();
        } else {
            $('#results').append(`
                <li id="unavailable">
                    Sorry, there are no previous searches to display... Try entering a search term, or browsing.
                </li>
            `)

            $('.hidden').removeClass();
        }
    })
}
// on browse, load a list of all category and region tag options
function manageBrowse(){
    fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?c=list`)
        .then(response => response.json())
        .then(responseJSON => addBrowseResults(responseJSON));

        fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?a=list`)
        .then(response => response.json())
        .then(responseJSON => addBrowseResults(responseJSON));
    
    $('#browse').click(e =>{
        e.preventDefault();

        $('#results').empty();
        displayBrowseResults();
    })
}
// -----------------------------------------DISPLAY MANAGERS-------------------------------------//
// if no value entered in search bar upon submission, display a random dish option
function displayRandomResult(arr){
    console.log(arr);
    $('#results').empty();

    arr.meals.map(meal =>{
        $('#results').append(`
        <li class="dish">
            <h3 class="dish-name">${meal.strMeal.toUpperCase()}</h3>
            <section class="dish-info">
                <img src="${meal.strMealThumb}" alt="Image of ${meal.strMeal}" class="dish-img"/>
                <section class="dish-links">
                    <ul class="dish-tags">
                        <li class="instant-search">${meal.strCategory}</li>
                        <li class="instant-search">${meal.strArea}</li>
                    </ul>
                    <button id="view-btn">...View Videos</button>
                </section>
            </section>
        </li>
        <li id="unavailable">
            If you don't enter a specific search term, you'll get a random recipe!
        </li>
        `)
    });
    handleInstantSearch();
    
    $('.hidden').removeClass();
}
// check type of arr entered and display meals based on results
function displaySearchResults(arr){
    $('#results').empty();
    
    let index = 0;

    console.log(arr);
    arr.meals.map(meal=>{
        // console.log(`ID: ${meal.idMeal}- ${meal.strMeal}`);
        const fullDishDetails = getMealByID(meal.idMeal);
    })

    if (arr.meals){
        arr.meals.map(meal =>{
            let tags = "";

            if (meal.strCategory){
                tags += `<li class="instant-search" data-type="category" data-value="${meal.strCategory}">${meal.strCategory}</li>`;
            }
            if (meal.strArea){
                tags += `<li class="instant-search" data-type="area" data-value="${meal.strArea}">${meal.strArea}</li>`;
            }
            
            $('#results').append(`
                <li class="dish">
                    <h3 class="dish-name">${meal.strMeal.toUpperCase()}</h3>
                    <section class="dish-info">
                        <img src="${meal.strMealThumb}" alt="Image of ${meal.strMeal}" class="dish-img"/>
                        <section class="dish-links">
                            <ul class="dish-tags">
                                ${tags}
                            </ul>
                            <button class="view-btn">...View Videos</button>
                        </section>
                    </section>
                </li>
            `)
            handleInstantSearch();

            const string = meal.strMeal.split(' ').join('+');

            // console.log(index);
            index++;
        });
    } else {
        $('#results').append(`
                <li id="unavailable">
                    Sorry, there are no options to display... Try another search term.
                </li>
            `)
    }
    // clear search bar value for next entry
    $('#foodName').val('');

    $('.hidden').removeClass('hidden');
}
// display browse results based on category & region
function addBrowseResults(arr){
    // console.log(arr);

    if (arr.meals[0].strCategory){
        arr.meals.map(filter =>{
            STORE.browseList.push(filter);
        });
    } else if (arr.meals[0].strArea) {
        arr.meals.map(filter =>{
            STORE.browseList.push(filter);
        })
    }
    $('.hidden').removeClass('hidden');
    handleInstantSearch();
}
function displayBrowseResults(){
    STORE.browseList.map(item => {
        // console.log(item);
        if (item.strCategory){
            $('#results').append(`
                <li class="instant-search" data-type="area" data-value="${item.strCategory}">
                    ${item.strCategory}
                </li>
            `)
        } else if (item.strArea){
            $('#results').append(`
                <li class="instant-search" data-type="area" data-value="${item.strArea}">
                    ${item.strArea}
                </li>
            `)
        }
    })
    handleInstantSearch();
}
function displayBrowseCategoryResults(arr){
    arr.meals.map(filter =>{
        $('#results').append(`
        <li class="instant-search" data-type="category" data-value="${filter.strCategory}">
            ${filter.strCategory}
        </li>
        `)
    });
}
function displayBrowseAreaResults(arr){
    arr.meals.map(filter =>{
        $('#results').append(`
        <li class="instant-search" data-type="area" data-value="${filter.strArea}">
            ${filter.strArea}
        </li>
        `)
    })
    $('.hidden').removeClass('hidden');
    
}
// -----------------------------------------DISPLAY HELPER FUNCTIONS-------------------------------------//
function beginSearch(){
        // console.log(dishName);
        let dishName = STORE.term;

        if (!STORE.previousSearches.find(d => d.term == dishName)){
            STORE.previousSearches.push({
                term: dishName,
                termType: STORE.termType
            });
        }

        if (STORE.termType == "keyword"){
            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/search.php?s=${dishName}`)// filter by name
            .then(response => response.json())
            .then(responseJSON => displaySearchResults(responseJSON));
        } else if(STORE.termType =="category"){
            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/filter.php?c=${dishName}`)
            .then(response => response.json())
            .then(responseJSON => displaySearchResults(responseJSON));
        } else if (STORE.termType == "area"){
            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/filter.php?a=${dishName}`)
            .then(response => response.json())
            .then(responseJSON => displaySearchResults(responseJSON));
        }
}

function getMealByID(id){
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(response => response.json())
    .then(responseJSON => {return responseJSON});
}

function handleInstantSearch(){
    $('.instant-search').click(function(){
        let instantValue = $(this).text().trim().split(" ").join(" ");
        console.log(`Search Term: ${instantValue}`);

        // STORE.term = instantValue;
        STORE.termType = $(this).data("type");
        STORE.term = $(this).data("value");

        console.log(`Search term: ${STORE.term} - Search Type: ${STORE.termType}`);
        
        beginSearch();
    })
}

function appendVideo(obj){
    // console.log(obj.error.message);
    
    $('.dish-links button').click(function(){
        $('#related-vids').remove();
        $('.dish-links button').closest('.dish').append(`
        <section id="video-list">
            <h3>Related Videos:</h3>
        </section>`)

        let vidArray = [
            'MQlz8nY7gkw',
            '5yx6BWlEVcY',
            'ZzaUGhhnlQ8'
        ];

        vidArray.map(videoID =>{
            console.log(videoID);
            $(`#video-list`).append(`
                <iframe class="ytplayer" type="text/html" width="300" height="150"
                src="https://www.youtube.com/embed/${videoID}"
                frameborder="0"></iframe>
            `)
        })
    })
}






function displaySearchResults(arr){
    $('#results').empty();
    
    let index = 0;

    console.log(arr);
    arr.meals.map(meal=>{
        // console.log(`ID: ${meal.idMeal}- ${meal.strMeal}`);
        const fullDishDetails = getMealByID(meal.idMeal);
    })
    
    if (arr.meals){
        arr.meals.map(meal =>{
            let tags = "";

            if (meal.strCategory){
                tags += `<li class="instant-search" data-type="category" data-value="${meal.strCategory}">${meal.strCategory}</li>`;
            }
            if (meal.strArea){
                tags += `<li class="instant-search" data-type="area" data-value="${meal.strArea}">${meal.strArea}</li>`;
            }
            
            $('#results').append(`
                <li class="dish">
                    <h3 class="dish-name">${meal.strMeal.toUpperCase()}</h3>
                    <section class="dish-info">
                        <img src="${meal.strMealThumb}" alt="Image of ${meal.strMeal}" class="dish-img"/>
                        <section class="dish-links">
                            <ul class="dish-tags">
                                ${tags}
                            </ul>
                            <button class="view-btn">...View Videos</button>
                        </section>
                    </section>
                </li>
            `)
            handleInstantSearch();

            const string = meal.strMeal.split(' ').join('+');
            



            fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=How+to+Make+${string}&maxResults=6&key=${STORE.yt_key}`)
            .then(response => response.json())
            .then(responseJSON => appendVideo(responseJSON, string, index));
            



            // console.log(index);
            index++;
        });
    } else {
        $('#results').append(`
                <li id="unavailable">
                    Sorry, there are no options to display... Try another search term.
                </li>
            `)
    }
    // clear search bar value for next entry
    $('#foodName').val('');

    $('.hidden').removeClass('hidden');
}
*/