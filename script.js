const STORE= {
    meal_key: 1,
    yt_key: "AIzaSyCFnYmhhtGkOdkgU-xnlDxB4fbTcyam03w",
    headerImg: "https://via.placeholder.com/1920x1080?text=JSImage",
    previousSearches: [],
    browseList: [],
    term: "",
    termType: ""
}

function manageInput(){
    manageKeywordSearch();
    manageRecentSearch();
    manageBrowse();
}

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

            /*
            fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=How+to+Make+${string}&maxResults=6&key=${STORE.yt_key}`)
            .then(response => response.json())
            .then(responseJSON => appendVideo(responseJSON, string, index));
            */
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



$(manageInput);