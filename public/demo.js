// global Favorites accessible everywhere;
let currentFavorites = [];



// Util Fetch to get Data
function fetchData(url, callback) {
    fetch(url).then(function(response) {
        if (response.ok) {
            return response.json()
        }
    }).then((resultJson) => {
        callback(null, resultJson);
    })
}

// Fetch Search Data
function fetchFavoritesAndMovieData(callback) {
    fetchFavorites((err, favorites) => {
        if (favorites.length) {
            currentFavorites = favorites;
        }


        let query = document.getElementById('demo-query').value;
        let url = "https://www.omdbapi.com/?plot=full&apikey=aad027a2&s=" + query;
        fetchData(url, (err, movieData) => {
            if (err) {
                console.log(err);
                return void callback(err);
            }
            let movieList = movieData.Search;
            let html = getHtmlForTable(movieList, currentFavorites);
            document.getElementById('tableResults').innerHTML = html
            // initializing rating functionality for semantic ui specifically
            $('.ui.rating').rating();
            callback();
        })
    })

}

// Attach listeners after the document has created the elements

function buildTableAndAttachListeners(callback) {
    fetchFavoritesAndMovieData((err) => {
        if (err) {
            console.log(err);
            return void callback(err);
        }
        let uiRatings = document.querySelectorAll('.ui.rating');
        uiRatings.forEach(function(uiRating) {
            uiRating.addEventListener('click', function(e) {

                e.preventDefault();
                const imdbID = e.target.parentNode.id;
                const movieTitle = e.target.parentNode.getAttribute('data-text');
                postFavorite({ movieTitle, imdbID });
            });
        });

        let selectableRows = document.querySelectorAll('.selectable');
        selectableRows.forEach(function(selectableRow) {
            selectableRow.addEventListener('click', function(e) {
                e.preventDefault();
                const movieId = e.target.id;
                makeModal(movieId)

            })
        })
        callback();
    });


}

// Create Table Row HTML

function getHtmlForTable(movieDataList, currentFavorites) {
    let formattedList = _.map(movieDataList, (movieData) => {
        let starRating = isAlreadyFavorited(movieData.imdbID, currentFavorites) ? 1 : 0 ;
        return `<tr>
                <td>
                    <div class="ui star rating" data-max-rating="1" data-rating="${starRating}" id="${movieData.imdbID}" data-text="${movieData.Title}">
                    </div></td>
                <td class="selectable">
                    <a class="selectable" id="${movieData.imdbID}">${movieData.Title}</a>
                </td>
                <td>${movieData.Type}</td>
                <td>${movieData.Year}</td>
                </tr>`
    })
    let htmlList = formattedList.join('');
    return htmlList;
}

// Create Modal Dynamically with Movie Data

function makeModal(imdbID) {
    let url = `https://www.omdbapi.com/?plot=full&apikey=aad027a2&i=${imdbID}`;
    let movieData = fetchData(url, (err, movieDetails) => {
        let starRating = isAlreadyFavorited(movieDetails.imdbID, currentFavorites) ? 1 : 0;
        let html = ` <div class="header">
        <div class="column">${movieDetails.Title}</div>
        <div class="column">Favorite:
            <div class="ui huge star rating" data-max-rating="1" data-rating="${starRating}">
        </div>
        </div>
            </div>
            <div class="image content">
                <div class="ui large image">
                    <img src="${movieDetails.Poster}">
                </div>
                <div class="description">
                    <p>${movieDetails.Plot}</p><br>
                    <small><strong>Director:</strong> ${movieDetails.Director}</small><br>
                    <small><strong>Awards:</strong> ${movieDetails.Awards}</small><br>
                    <small><strong>Runtime:</strong> ${movieDetails.Runtime}</small>
                </div>
            </div>
            </div>`
        document.getElementById('modalDetails').innerHTML = html;
        // initializing modal functionality for semantic ui specifically
        $('#modalDetails').modal('show');
        // initializing rating functionality for semantic ui specifically
        $('.ui.rating').rating();
    });


}

// Build and Display Modal with Favorites

function makeFavoritesModal() {
    fetchFavorites((err, favoritesData) => {
        let htmlTable = _.map(favoritesData, (fav) => {
            return `<tr>
            <td class="selectable">
                <a class="selectable" id="${fav.imdbID}">${fav.movieTitle}</a>
            </td>

            </tr>`;
        })
        document.getElementById('favoriteResults').innerHTML = htmlTable.join('');
        // initializing modal functionality for semantic ui specifically
        $('#favoritesModal').modal('show');
    });

}

function fetchFavorites(callback) {
    fetchData("/favorites", (err, favoritesData) => {
        if (err) {
            console.log(err);
            return void callback(err);
        }
        callback(null, favoritesData);
    })
}

function postFavorite(data) {
    if (!isAlreadyFavorited(data.imdbID, currentFavorites)) {
        fetch('favorites', {
            method: 'post',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        }).then((response) => {
            return response.json();
        }).catch((err) => {
            console.log(err);
            return;
        })


    }
}


function isAlreadyFavorited(imdbID, currentFavorites) {
    let isFavorited = _.map(currentFavorites, 'imdbID').includes(imdbID) ? true : false;
    return isFavorited;
}

const submitButton = document.querySelector('#showFavorites');
submitButton.addEventListener('click', function(e) {
    e.preventDefault();
    makeFavoritesModal();
});


const searchButton = document.getElementById('runSearch');
searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    buildTableAndAttachListeners((err) => {
        if (err) {
            console.log(err);
        }
    })
})
