const STORE= {
    api_key: 1,
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

        const dishName = e.target.foodName.value;
        STORE.previousSearches.push(dishName);

        fetch(`https://www.themealdb.com/api/json/v1/${STORE.api_key}/search.php?s=${dishName}`)
        .then(response => response.json())
        .then(responseJSON => displaySearchResults(responseJSON));
    });
}
function manageRecent(){
    $('#recent').click(e =>{
        e.preventDefault();

        if(STORE.previousSearches.length > 0){
            $('#results').empty();

            STORE.previousSearches.map(searchTerm =>{
                $('#results').append(`
                <li>${searchTerm}</li>
                `);
            })
        } else {
            console.log("no previous search terms")
        }
    })
}

function manageBrowse(){
    $('#browse').click(e =>{
        e.preventDefault();

        fetch(`https://www.themealdb.com/api/json/v1/${STORE.api_key}/categories.php`)
        .then(response => response.json())
        .then(responseJSON => displayBrowseResults(responseJSON));
    })
}

function displaySearchResults(arr){
    console.log(arr);

    $('#results').empty();

    if(arr.meals){
        arr.meals.map(meal =>{
            console.log(meal.strMealThumb);
            $('#results').append(`
                <li>
                    <img src="${meal.strMealThumb}" alt="Image of ${meal.strMeal}"/>
                </li>
            `)
        });
    } else {
        console.log("sorry, there are no options to display")
    }

    $('.hidden').removeClass('hidden');
}
function displayBrowseResults(arr){
    console.log(arr);

    $('#results').empty();

    arr.categories.map(str =>{
        $('#results').append(`
            <li>
                ${str.strCategory}
            </li>
        `)
    })

    $('.hidden').removeClass('hidden');
}

$(manageInput);