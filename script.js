const STORE= {
    meal_key: 1,
    yt_key: "AIzaSyCFnYmhhtGkOdkgU-xnlDxB4fbTcyam03w",
    headerImg: "https://via.placeholder.com/1920x1080?text=JSImage",
    previousSearches: []
}

function manageInput(){
    manageSearch();
    manageRecent();
    manageBrowse();

}


function manageSearch(){
    $('#recipeForm').submit(e =>{
        e.preventDefault();

        if (!e.target.foodName.value){
            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/random.php`)
            .then(response => response.json())
            .then(responseJSON => displayRandomResult(responseJSON));
        } else {
            let dishName = e.target.foodName.value;
            dishName = dishName.trim().split(' ').join('+');
            // console.log(dishName);

            if (!STORE.previousSearches.includes(dishName)){
                STORE.previousSearches.push(dishName);
            }

            fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/search.php?s=${dishName}`)// filter by name
            .then(response => response.json())
            .then(responseJSON => displaySearchResults(responseJSON));
        }
    });
}

function displayRandomResult(arr){
    console.log(arr);
    $('#results').empty();

    let string = "";
    let index = 0;

    arr.meals.map(meal =>{
        
        string = meal.strMeal.split(' ').join('+');

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
                    <button id="view-btn${index}">...View Videos</button>
                </section>
            </section>
        </li>
        <li id="unavailable">
            If you don't enter a specific search term, you'll get a random recipe!
        </li>
        `)
    });
    handleInstantSearch();
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=How+to+Make+${string}&maxResults=6&key=${STORE.yt_key}`)
            .then(response => response.json())
            .then(responseJSON => appendVideo(responseJSON, string, index));

    $('.hidden').removeClass();
}

function manageRecent(){
    $('#recent').click(e =>{
        e.preventDefault();
        $('#results').empty();

        if(STORE.previousSearches.length > 0){
            

            STORE.previousSearches.map(searchstring =>{
                $('#results').append(`
                <li class="instant-search">
                    ${searchstring}
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

function handleInstantSearch(){
    $('.instant-search').click(function(){
        let instantValue = $(this).text();
        console.log(instantValue);
        
        $('#foodName').val(`${instantValue}`);
        $('#search').click();
    })
}

function manageBrowse(){
    $('#browse').click(e =>{
        e.preventDefault();

        $('#results').empty();

        fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?c=list`)
        .then(response => response.json())
        .then(responseJSON => displayBrowseCategoryResults(responseJSON));

        fetch(`https://www.themealdb.com/api/json/v1/${STORE.meal_key}/list.php?a=list`)
        .then(response => response.json())
        .then(responseJSON => displayBrowseAreaResults(responseJSON));
    })
}

function displaySearchResults(arr){
    $('#results').empty();
    $('#foodName').val('');
    
    let index = 0;
    console.log(arr);

    if (arr.meals){
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
                            <button id="view-btn${index}">...View Videos</button>
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

    $('.hidden').removeClass('hidden');
}

function appendVideo(obj){
    console.log(obj.error.message);
    
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

function displayBrowseCategoryResults(arr){
    arr.meals.map(filter =>{
        $('#results').append(`
        <li class="instant-search">
            ${filter.strCategory}
        </li>
        `)
    });
}
function displayBrowseAreaResults(arr){
    arr.meals.map(filter =>{
        $('#results').append(`
        <li class="instant-search">
            ${filter.strArea}
        </li>
        `)
    })
    $('.hidden').removeClass('hidden');
    handleInstantSearch();
}

$(manageInput);