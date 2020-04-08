const STORE= {
    // retains key data for future use
    meal_key: 1,
    yt_key: "AIzaSyCFnYmhhtGkOdkgU-xnlDxB4fbTcyam03w",
    headerImg: 0,
    recentList: [],
    browseList: [],
    fullMenu: []
}

function getCooking(){
    createMenu();
    
    manageSearch();
    recentView();
    browseView();
}
//----------------BUILD MENU--------------------
function createMenu(){
    // Create Browse list by pulling all entries from APIs Area and Category lists
    fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?c=list`)
    .then(response => response.json())
    .then(responseJSON => {
        addToBrowseList(responseJSON);
        return fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?a=list`);
    })
        
    // Add Areas to Browse List
    .then(response => response.json())
    .then(responseJSON => {
        addToBrowseList(responseJSON);
    })
}
function addToBrowseList(arr){
    arr.meals.map(meal =>{
        // Browse list done
        STORE.browseList.push(meal);
    })
    //Use Browse list entries as foundation for finding all meal data
    searchForIDs(STORE.browseList);
}
function searchForIDs(arr){
    // iterate through browse list filtered for ONLY area, to return meal objects with ID values
    arr.map(filter =>{
        // filter Browse List for only Objects with Area categories, to ensure not to populate duplicate dish objects
        // Returns objects with strMeal, strMealThumb, and idMeal properties
        if(filter.strArea){
            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/filter.php?a=${filter.strArea}`)
            .then(response => response.json())
            .then(responseJSON => queueMenu(responseJSON));
        }
    });
}
function queueMenu(arr){
    // Search for complete dish data by idMeal value, and populate full menu with objects containing complete meal data
    const promises = arr.meals.map(meal =>{
        return fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/lookup.php?i=${meal.idMeal}`)
        .then(response => response.json())
        .then(responseJSON => addToMenu(responseJSON))
    })
    Promise.all(promises).then(data => {
        // Once complete menu is populated, enable main interface functionality
        manageInterface();
    });
}
function addToMenu(arr){
    // Add complete dish to stored fullMenu array
    STORE.fullMenu.push(arr.meals[0]);
    
}

function manageInterface(){
    // allows new header image to populate every 5 seconds
    loadHeaderImage()
    
    setInterval(function() {
        loadHeaderImage()
    }, 5000)
}

//----------------SEARCH MANAGERS--------------------
function manageSearch(){
    // handles all search functionality
    $('#searchForm').submit(e =>{
        e.preventDefault();

        $('#results').empty();

        let searchValue = e.target.foodName.value;

        if (!searchValue){
            displayRandomDish();
        } else {
            addToRecentList(searchValue);
            findMatchingResults(searchValue);
            $('#foodName').val('');
        }
    })
}

function recentView(){
    // Display stored Recent List values when 'recent' button clicked
    $('#recent').click(e =>{
        e.preventDefault();
        displayRecentList();
    })
}

function browseView(){
    //Display full stored Browse Menu completed at page load
    $('#browse').click(e =>{
        e.preventDefault();
        displayBrowseList();
    })
}

function loadHeaderImage(){
    // Get image from a randomly selected dish object in the stored fullMenu array
    let randomIndex = Math.floor(Math.random() * STORE.fullMenu.length);
    $('#hero').css('background-image',`url(${STORE.fullMenu[randomIndex].strMealThumb})`)
}
//----------------DISPLAY MANAGERS--------------------
function addToRecentList(str){
    // when a search term is input, add to the stored RecentList array
    if(!STORE.recentList.includes(str)){
        STORE.recentList.push(str);
        STORE.recentList.sort();
    }
}
function displayRecentList(){
    // Show user recently searched terms
    $('#results').empty();

    if (STORE.recentList.length === 0){
        $('#results').append(`
            <h4 id="subheader">You have not made any recent search inquiries... Please enter a value into the search bar above, or select a category from our Browse menu!</h4>
        `);
    } else {
        $('#results').append(`
            <h4 id="subheader">Recent Searches:</h4>
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
    //Show user complete Browse List
    $('#results').empty().append(`
        <h4 id="subheader">Browse Categories:</h4>
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
    // when no search input, display a randomly selected dish from the full menu
    const index = Math.floor(Math.random() * STORE.fullMenu.length);
    const sampleMeal = STORE.fullMenu[index];

    loadDishes(sample =[[sampleMeal]]);
}

function findMatchingResults(str){
    // standardize user input and search full menu for any  occurances of the given input in each dish's name, category, area, tags, and ingredients
    $('#results').append(`
        <h4 id="subheader">Showing results for "${str}":</h4>
    `);

    const checkStr = str.toLowerCase().split(' ').join('');

    const matchingResults = [];

    STORE.fullMenu.map(dish =>{
        const checkDishName = dish.strMeal.toLowerCase().split(' ').join('');
        const checkDishCategory = dish.strCategory.toLowerCase().split(' ').join('');
        const checkDishArea = dish.strArea.toLowerCase().split(' ').join('');
        const checkDishTags = dish.strTags ? dish.strTags.toLowerCase().split(',').join('') : null;

        const dishIngredients = getIngredients(dish);

        if (checkDishName.includes(checkStr) || checkDishName === checkStr){
            if(!matchingResults.includes(dish.idMeal)){
                matchingResults.push(dish.idMeal);
            }   
        } else if (checkDishCategory.includes(checkStr) || checkDishCategory === checkStr){
            if(!matchingResults.includes(dish.idMeal)){
                matchingResults.push(dish.idMeal);
            }
        } else if (checkDishArea.includes(checkStr) || checkDishArea === checkStr){
            if(!matchingResults.includes(dish.idMeal)){
                matchingResults.push(dish.idMeal);
            }
        } else if (checkDishTags){
            if (checkDishTags.includes(checkStr) || checkDishTags === checkStr){
                if(!matchingResults.includes(dish.idMeal)){
                    matchingResults.push(dish.idMeal);
                }
            }
        } else if (dishIngredients.length > 0){
            dishIngredients.map(ingredient =>{
                if(ingredient.toLowerCase().split(' ').join('').includes(dish.checkStr) || ingredient.toLowerCase().split(' ').join('') === checkStr){
                    if(!matchingResults.includes(dish.idMeal)){
                        console.log('matching ingredient found!')
                        matchingResults.push(dish.idMeal);
                    }
                }
            })
        } 
    })

    displayMatchingResults(matchingResults);
}

function displayMatchingResults(arr){
    // iterate through list of IDs gathered to find dishes with matching IDs in the full menu, and display those dishes
    let relevantDishes = [];

    arr.map(id =>{
        const dishWithMatchingID = STORE.fullMenu.filter(function(obj){
            return obj.idMeal === id;
        })
        relevantDishes.push(dishWithMatchingID);
    })
    
    loadDishes(relevantDishes, relevantDishes.length);
}

function loadDishes(dishes, count = 0){
    // display results of searching the full menu for specific IDs
    if (dishes.length === 0){
        $('#results').append(`
        <li>
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
                    <h4>Related Tags:</h4>
                        <ul class="dish-tags">
                            <li class="instant-search category">${dish[0].strCategory}</li>
                            <li class="instant-search area">${dish[0].strArea}</li>
                        </ul>
                        <button class="view-btn">View Prep</button>
                    </section>
                </section>
            </li>
        `);
        })
    }

    if (count === 0){
        $('.dish').before(`
        <li id="subheader">
            If you don't enter a specific search term, you'll get a random recipe!
        </li>
        `);
    }
    
    handleInstantSearch();
    handleVideoLoad();
    $('.hidden').removeClass();
}

function handleInstantSearch(){
    // when clicking on a category,area, ingredient, or recent search term, use that specific text to automatically search
    $('.instant-search').click(function(){
        const searchVal = $(this).text();

        $('#foodName').val(searchVal);
        $('#searchForm').submit();
    })
}

function handleVideoLoad(){
    // when view prep button is clicked, display a list of ingredients and related videos for that particular dish
    $('.view-btn').click(function() {
        $('#video-list').remove();
        $('#ingredient-sect').remove();

        const dishToAddVids = $(this).closest('.dish');

        const dishID = $(dishToAddVids).attr('id');

        const thisDish = STORE.fullMenu.filter(function(obj){
            return obj.idMeal === dishID;
        });

        const ingredients = getIngredients(thisDish);

        // adds a mouse-over tooltip to provide hints on ingredients
        dishToAddVids.append(`
        <section id="ingredient-sect">
            <h4 class="tooltip">Common Ingredients:
                <span class="tooltiptext">Each recipe is unique and may call for different ingredients, but these are a good starting point! Or click one to load a list of other dishes that use the same ingredient</span>
            </h4>
            <ul id="ingredients-list"></ul>
        </section>
        `)
        // populates all dish's ingredients
        ingredients.map(ingredient =>{
            $('#ingredients-list').append(`
                <li class="instant-search">
                    ${ingredient}
                </li>
            `)
        })

        handleInstantSearch();
        
        // adds a mouse-over tooltip to provide hints on videos
        dishToAddVids.append(`
            <section id="video-list">
                <h4 class="tooltip">Related Videos:
                    <span class="tooltiptext">Each video will display slightly different recipe and instructions based on the chef's specifications</span>
                </h4>
                <ul id="related-vids">
                </ul>
            </section>
        `)

        let videoTag = dishToAddVids.find('.dish-name').text();
        videoTag = videoTag.split(' ').join('+');
        
        // search for specific video about 'how to make' the selected dish's name
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=How+to+Make+${videoTag}&maxResults=4&key=${STORE.yt_key}`)
        .then(response => response.json())
        .then(responseJSON => appendVideo(responseJSON));
    })
}

function appendVideo(arr){
    // display video content
    arr.items.map(video =>{
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

function getIngredients(dish){
    // iterate through all 20 possible indices of ingredients, and return list of ingredients in a given dish
    const dishIngredients = [];

    let i = 1;

    while (i <= 20){
        if (dish[0]){
            const ingredient = dish[0]["strIngredient" + i];

            if (ingredient === ""){
                break;
            } else if (ingredient == undefined){
                break;
            } else {
                dishIngredients.push(ingredient);
            }
        } else {
            const ingredient = dish["strIngredient" + i];

            if (ingredient === ""){
                break;
            } else if (ingredient == undefined){
                break;
            } else {
                dishIngredients.push(ingredient);
            }
        }
        i++;
    }
    return dishIngredients;
}
//----------------INITIALIZE--------------------
$(getCooking);