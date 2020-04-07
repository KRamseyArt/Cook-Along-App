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
    console.log(STORE);
    // setTimeout(function(){
    //     manageInterface();
    // }, 5000)
    //manageInterface();
    
    manageSearch();
    recentView();
    browseView();

    resChecker();
}
//----------------BUILD MENU--------------------
function createMenu(){
    // Add categories to Browse list
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
    const promises = arr.meals.map(meal =>{
        return fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/lookup.php?i=${meal.idMeal}`)
        .then(response => response.json())
        .then(responseJSON => addToMenu(responseJSON))
    })
    Promise.all(promises).then(data => {
        manageInterface();
    });
}
function addToMenu(arr){
    // Add dishes to menu based on each unique ID value
    STORE.fullMenu.push(arr.meals[0]);
    
}

function manageInterface(){
    loadHeaderImage()
    
    setInterval(function() {
        loadHeaderImage()
    }, 5000)

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
    let randomIndex = Math.floor(Math.random() * STORE.fullMenu.length);
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

    const checkStr = str.toLowerCase().split(' ').join('');

    const matchingResults = [];

    STORE.fullMenu.map(dish =>{
        const checkDishName = dish.strMeal.toLowerCase().split(' ').join('');
        const checkDishCategory = dish.strCategory.toLowerCase().split(' ').join('');
        const checkDishArea = dish.strArea.toLowerCase().split(' ').join('');
        const checkDishTags = dish.strTags ? dish.strTags.toLowerCase().split(',').join('') : null;

        const dishIngredients = getIngredients(dish);
        // console.log(dishIngredients);

        if (checkDishName.includes(checkStr) || checkDishName === checkStr){
            if(!matchingResults.includes(dish.idMeal)){
                console.log('matching dish name found!')
                matchingResults.push(dish.idMeal);
            }   
        } else if (checkDishCategory.includes(checkStr) || checkDishCategory === checkStr){
            if(!matchingResults.includes(dish.idMeal)){
                console.log('matching category found!')
                matchingResults.push(dish.idMeal);
            }
        } else if (checkDishArea.includes(checkStr) || checkDishArea === checkStr){
            if(!matchingResults.includes(dish.idMeal)){
                console.log('matching area found!')
                matchingResults.push(dish.idMeal);
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
            
        } else if (checkDishTags){
            if (checkDishTags.includes(checkStr)){
                if(!matchingResults.includes(dish.idMeal)){
                    matchingResults.push(dish.idMeal);
                }
            }
        }
    })

    displayMatchingResults(matchingResults);
}

function displayMatchingResults(arr){
    
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
        $('#ingredient-sect').remove();
        
        const dishToAddVids = $(this).closest('.dish');
        const dishID = $(dishToAddVids).attr('id');

        const thisDish = STORE.fullMenu.filter(function(obj){
            return obj.idMeal === dishID;
        });

        const ingredients = getIngredients(thisDish);
        console.log('ingredients = ');
        console.log(ingredients);

        dishToAddVids.append(`
        <section id="ingredient-sect">
            <h4 class="tooltip">Common Ingredients:
                <span class="tooltiptext">Each recipe is unique and may call for different ingredients, but these are a good starting point! Or click one to load a list of other dishes that use the same ingredient</span>
            </h4>
            <ul id="ingredients-list"></ul>
        </section>
        `)

        ingredients.map(ingredient =>{
            $('#ingredients-list').append(`
                <li class="instant-search">
                    ${ingredient}
                </li>
            `)
        })

        handleInstantSearch();

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
        console.log(videoTag);
        
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=How+to+Make+${videoTag}&maxResults=4&key=${STORE.yt_key}`)
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
}

function getIngredients(dish){
    const dishIngredients = [];

    let i = 1;

    while (i <= 20){
        if (dish[0]){
            const ingredient = dish[0]["strIngredient" + i];
        // console.log(ingredient);

            if (ingredient === ""){
                break;
            } else if (ingredient == undefined){
                break;
            } else {
                dishIngredients.push(ingredient);
            }
        } else {
            const ingredient = dish["strIngredient" + i];
        // console.log(ingredient);

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

function resChecker(){
    if($(window).width() >= 840){
        console.log('over 840');
    } else {
        console.log('under 840');
    }
}
//----------------INITIALIZE--------------------
$(getCooking);