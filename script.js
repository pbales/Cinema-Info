'use strict';

let STORE = {};

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  return queryItems.join('&');
}

function searchApi(searchTerm, apiKey) {
  const params = {
    query: searchTerm
  };
  const queryString = formatQueryParams(params);
  const requestUrl = `https://api.themoviedb.org/3/search/multi?${queryString}&api_key=${apiKey}&language=en-US&include_adult=false`;
  fetch(requestUrl)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      STORE.search = responseJson;
      displayResults();
      console.log(responseJson);
    })
    .catch(error => {
      $('#js-error-message').text(`Something went wrong: ${error.message}`);
    });
  
}

function displayResults() {
  $('.final-result').addClass('hidden');
  $('#js-form').removeClass('homeView');
  $('#js-form').addClass('searchView');
  $('.js-form-label').empty();
  $('.js-form-label').append(
    `<label class="js-form-label" for="search-term">Want to check out something else?</label>`);
  $('#search-results').empty();
  $('#js-error-message').empty();
  removePeople();
  for (let i = 0; i < STORE.search.results.length; i++) {
    let response = STORE.search.results[i];
    $('#search-results').append(
    `<li class="search-result" id="${response.id}"><h3>${handleTitle(response.media_type, response)}</h3>
    <img src='http://image.tmdb.org/t/p/w300/${response.poster_path}' alt='Movie/Show poster' class="searchPosterImage">
    <p>Media Type: ${formatMediaType(response.media_type)}</p>
    <p>${truncateOverview(response.overview, 125)}</p>
    </li>`
    );
  }
  $('.results').removeClass('hidden');
  handleSelectedResult();
}

function handleSelectedResult() {
  $('.search-result').on('click', function(evt) {
    let id = $(this).attr('id');
    $('.results').addClass('hidden');
    $('.final-result').removeClass('hidden');
    $('.final-result').empty();
    for (let i = 0; i < STORE.search.results.length; i++) {
      let response = STORE.search.results[i];
      if (id == response.id) {
          $('.final-result').append(
          `<h4>${handleTitle(response.media_type, response)}</h4>
          <img src='http://image.tmdb.org/t/p/w400/${response.poster_path}' alt='Movie/Show poster' class="posterImage">
          <p>${response.overview}</p>
          <ul>
            <li>TMDB Rating: ${response.vote_average}</li>
            <li>TMDB Reviews: ${response.vote_count}</li>
            <li>${formatReleaseType(response.media_type)}: ${handleReleaseDate(response.media_type, response)}</li>
          <ul>`
        );
      break;
      }
    }
  });
}

function removePeople() {
  STORE.search.results = STORE.search.results.filter(r => r.media_type !== 'person');
}

function handleTitle(mediaType, response) {
  if (mediaType === 'tv') {
    return response.original_name;
  } else {
    return response.original_title;
  }
}

function handleReleaseDate(mediaType, response) {
  if (mediaType === 'tv') {
    return response.first_air_date
  } else {
    return response.release_date
  }
}

function formatMediaType(mediaType) {
  if (mediaType === 'tv') {
    return 'TV Show';
  } else {
    return 'Movie';
  }
}

function formatReleaseType(mediaType) {
  if (mediaType === 'tv') {
    return 'First Air Date'
  } else {
    return 'Release Date'
  }
}

function truncateOverview(str, len) {
  let truncated = '';
  if (str && str.length) {
    truncated = str.slice(0, len); 
    if (str.length > len) truncated += '...'; 
  }
  return truncated;
}

function reloadApp() {
    $('h1').on('click', function(evt) {
      location.reload();
    });
}

function handleForm() {
  $('#js-form').submit(evt => {
    evt.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const apiKey = '7fe0e7135cfa5d0b08ad5d59229241f4';
    searchApi(searchTerm, apiKey);
  });
  reloadApp();
}

$(handleForm);