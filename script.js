'use strict';

function formatGenreIds(ids) {
  let genreIds = ids.join(',');
  return genreIds;
}

const SETTINGS = {
  apiKey: 'api_key=7fe0e7135cfa5d0b08ad5d59229241f4',
  apiBaseUrl: 'https://api.themoviedb.org/3',
  language: 'language=en-US',
  removeAdult: 'include_adult=false'
};

const requestUrlBuilder = {
  mediaSearch: (searchTerm) => {
    const params = {
      query: searchTerm
    };
    const queryString = formatQueryParams(params);
    return `${SETTINGS.apiBaseUrl}/search/multi?${queryString}&${SETTINGS.apiKey}&${SETTINGS.language}&${SETTINGS.removeAdult}`;
  },
  tvGenreSearch: (genreIds) => {
    return `${SETTINGS.apiBaseUrl}/discover/tv?${SETTINGS.apiKey}&with_genres=${genreIds}`;
  },
  movieGenreSearch: (genreIds) => {
    return `${SETTINGS.apiBaseUrl}/discover/movie?${SETTINGS.apiKey}&with_genres=${genreIds}`;
  },
  topTvShowSearch: () => {
    return `${SETTINGS.apiBaseUrl}/tv/top_rated?${SETTINGS.apiKey}&${SETTINGS.language}`;
  },
  topMovieSearch: () => {
    return `${SETTINGS.apiBaseUrl}/movie/top_rated?${SETTINGS.apiKey}&${SETTINGS.language}`;
  }
};

let STORE = {};

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  return queryItems.join('&');
}

function handleApiFetch(url) {
  return fetch(url).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  });
}

function handleError(err) {
  $('#js-error-message').text(`Something went wrong: ${error.message}`);
}

function mediaSearch(searchTerm) {
  let url = requestUrlBuilder.mediaSearch(searchTerm);
  handleApiFetch(url)
    .then(responseJson => {
      STORE.search = responseJson;
      displayResults();
    })
    .catch(handleError);
}

function tvGenreSearch(genreIds) {
  let url = requestUrlBuilder.tvGenreSearch(genreIds);
  handleApiFetch(url)
    .then(responseJson => {
      STORE.tvGenres = responseJson;
      handleTvGenres();
    })
    .catch(handleError);
}

function movieGenreSearch(genreIds) {
  let url = requestUrlBuilder.movieGenreSearch(genreIds);
  handleApiFetch(url)
    .then(responseJson => {
      STORE.movieGenres = responseJson;
      handleMovieGenres();
    })
    .catch(handleError);
}

function topTvShowSearch() {
  let url = requestUrlBuilder.topTvShowSearch();
  handleApiFetch(url)
    .then(responseJson => {
      STORE.topTv = responseJson;
      displayTopTvShows();
    })
    .catch(handleError);
}

function topMovieSearch() {
  let url = requestUrlBuilder.topMovieSearch();
  handleApiFetch(url)
    .then(responseJson => {
      STORE.topMovies = responseJson;
      displayTopMovies();
    })
    .catch(handleError);
}

function displayResults() {
  $('.final-result').addClass('hidden');
  $('#TMDBCredit').addClass('hidden');
  $('#js-form').removeClass('homeView');
  $('#js-form').addClass('searchView');
  $('#topMovies').addClass('hidden');
  $('#topTvShows').addClass('hidden');
  $('#final-result-genres').empty();
  $('.genres').addClass('hidden');
  $('#topMovieResults').empty();
  $('#topTvShowResults').empty();
  $('.js-form-label').empty();
  $('.js-form-label').append(
    `<label class="js-form-label" for="search-term">Want to check out something else?</label>`);
  $('#search-results').empty();
  $('#js-error-message').empty();
  removePeople();
  if (STORE.search.results.length === 0) {
    $('#no-results').append(`No results found`);
  } else {
    $('#no-results').empty();
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
  }
  $('.results').removeClass('hidden');
  handleSelectedResult();
}

function handleSelectedResult() {
  $('.search-result').on('click', function() {
    let id = $(this).attr('id');
    $('.results').addClass('hidden');
    $('.final-result').removeClass('hidden');
    $('#final-result-genres').empty();
    $('.genres').removeClass('hidden');
    $('.final-result').empty();
    for (let i = 0; i < STORE.search.results.length; i++) {
      let response = STORE.search.results[i];
      if (id == response.id) {
        let genreIds = formatGenreIds(STORE.search.results[i].genre_ids);
        if (response.media_type === 'tv') {
          tvGenreSearch(genreIds);
        } else {
          movieGenreSearch(genreIds);
        }
        $('.final-result').append(
        `<h4 id="${response.id}">${handleTitle(response.media_type, response)}</h4>
        <img src='http://image.tmdb.org/t/p/w400/${response.poster_path}' alt='Movie/Show poster' class="posterImage">
        <p>${response.overview}</p>
        <ul>
          <li>The Movie DB Rating: ${response.vote_average}</li>
          <li>The Movie DB Reviews: ${response.vote_count}</li>
          <li>${formatReleaseType(response.media_type)}: ${handleReleaseDate(response.media_type, response)}</li>
        <ul>`
        );
      break;
      }
    }
  });
}

function genreMediaType(mediaType) {
  if (mediaType === 'tv') {
    handleTvGenres();
  } else {
    handleMovieGenres();
  }
}

function handleTvGenres() {
  for (let i = 0; i < STORE.tvGenres.results.length; i++) {
    let response = STORE.tvGenres.results[i];
    let id = $('.final-result h4').attr('id');
    if (id == response.id) {
      continue;
    } else {
      $('#final-result-genres').append(
        `<li class="genre-result" id="${response.id}">
          <h5 class="genre-title">${response.name}</h5>
          <img src='http://image.tmdb.org/t/p/w300/${response.poster_path}' alt='Movie/Show poster' class="genrePosterImage">
          <p>${truncateOverview(response.overview, 50)}</p>
        </li>`
      );
    }
  }
  handleSelectedTvGenre();
}

function handleSelectedTvGenre() {
  $('.genre-result').on('click', function() {
    $('.final-result').empty();
    $('#final-result-genres').empty();
    let id = $(this).attr('id');
    for (let i = 0; i < STORE.tvGenres.results.length; i++) {
      let response = STORE.tvGenres.results[i];
      if (id == response.id) {
        let genreIds = formatGenreIds(STORE.tvGenres.results[i].genre_ids);
        tvGenreSearch(genreIds);
        $('.final-result').append(
        `<h4 id="${response.id}">${response.name}</h4>
        <img src='http://image.tmdb.org/t/p/w400/${response.poster_path}' alt='Movie/Show poster' class="posterImage">
        <p>${response.overview}</p>
        <ul>
          <li>The Movie DB Rating: ${response.vote_average}</li>
          <li>The Movie DB Reviews: ${response.vote_count}</li>
          <li>Relesae Date: ${response.first_air_date}</li>
        <ul>`
        );
      break;
      }
    }
  });
}

function handleMovieGenres() {
  for (let i = 0; i < STORE.movieGenres.results.length; i++) {
    let response = STORE.movieGenres.results[i];
    let id = $('.final-result h4').attr('id');
    if (id == response.id) {
      continue;
    } else {
      $('#final-result-genres').append(
        `<li class="genre-result" id="${response.id}">
          <h5 class="genre-title">${response.title}</h5>
          <img src='http://image.tmdb.org/t/p/w300/${response.poster_path}' alt='Movie/Show poster' class="genrePosterImage">
          <p>${truncateOverview(response.overview, 50)}</p>
        </li>`
      );
    }
  }
  handleSelectedMovieGenre();
}

function handleSelectedMovieGenre() {
  $('.genre-result').on('click', function() {
    $('.final-result').empty();
    $('#final-result-genres').empty();
    let id = $(this).attr('id');
    for (let i = 0; i < STORE.movieGenres.results.length; i++) {
      let response = STORE.movieGenres.results[i];
      if (id == response.id) {
        let genreIds = formatGenreIds(STORE.movieGenres.results[i].genre_ids);
        movieGenreSearch(genreIds);
        $('.final-result').append(
        `<h4 id="${response.id}">${response.title}</h4>
        <img src='http://image.tmdb.org/t/p/w400/${response.poster_path}' alt='Movie/Show poster' class="posterImage">
        <p>${response.overview}</p>
        <ul>
          <li>The Movie DB Rating: ${response.vote_average}</li>
          <li>The Movie DB Reviews: ${response.vote_count}</li>
          <li>Relesae Date: ${response.release_date}</li>
        <ul>`
        );
      break;
      }
    }
  });
}

function handleTopTvShows() {
  $('#topTvShowsLi').on('click', function(evt) {
    $('#js-form').removeClass('homeView');
    $('#js-form').addClass('searchView');
    $('#topTvShows').removeClass('hidden');
    $('#topMovies').addClass('hidden');
    $('.results').addClass('hidden');
    $('.final-result').addClass('hidden');
    $('.genres').addClass('hidden');
    $('.js-form-label').empty();
    $('.js-form-label').append(
    `<label class="js-form-label" for="search-term">Want to check out something else?</label>`);
    topTvShowSearch();
  });
}

function displayTopTvShows() {
  $('#topMovieResults').addClass('hidden');
  $('#TMDBCredit').addClass('hidden');
  $('#topMovieResults').empty();
  $('#topTvShowResults').empty();
  $('#topTvShowResults').removeClass('hidden');
  $('.top-results').removeClass('hidden');
  for (let i = 0; i < STORE.topTv.results.length; i++) {
    let response = STORE.topTv.results[i];
    if (response.original_language === 'en') {
      $('#topTvShowResults').append(
      `<li class="search-result" id="${response.id}"><h3>${response.name}</h3>
      <img src='http://image.tmdb.org/t/p/w300/${response.poster_path}' alt='Movie/Show poster' class="searchPosterImage">
      <p>Rating: ${response.vote_average}/10</p>
      <p>${truncateOverview(response.overview, 125)}</p>
      </li>`
      );
    }
  }
  handleSelectedTopTvShow()
}

function handleSelectedTopTvShow() {
  $('.search-result').on('click', function() {
    let id = $(this).attr('id');
    $('.top-results').addClass('hidden');
    $('.final-result').removeClass('hidden');
    $('#final-result-genres').empty();
    $('.genres').removeClass('hidden');
    $('.final-result').empty();
    for (let i = 0; i < STORE.topTv.results.length; i++) {
      let response = STORE.topTv.results[i];
      if (id == response.id) {
        let genreIds = formatGenreIds(STORE.topTv.results[i].genre_ids);
        tvGenreSearch(genreIds);
        $('.final-result').append(
        `<h4 id="${response.id}">${response.name}</h4>
        <img src='http://image.tmdb.org/t/p/w400/${response.poster_path}' alt='Movie/Show poster' class="posterImage">
        <p>${response.overview}</p>
        <ul>
          <li>The Movie DB Rating: ${response.vote_average}</li>
          <li>The Movie DB Reviews: ${response.vote_count}</li>
          <li>First Air Date: ${response.first_air_date}</li>
        <ul>`
      );
      break;
      }
    }
  });
}

function handleTopMovies() {
  $('#topMoviesLi').on('click', function(evt) {
    $('#js-form').removeClass('homeView');
    $('#js-form').addClass('searchView');
    $('#topMovies').removeClass('hidden');
    $('#topTvShows').addClass('hidden');
    $('.results').addClass('hidden');
    $('.final-result').addClass('hidden');
    $('.genres').addClass('hidden');
    $('.js-form-label').empty();
    $('.js-form-label').append(
    `<label class="js-form-label" for="search-term">Want to check out something else?</label>`);
    topMovieSearch();
  });
}

function displayTopMovies() {
  $('#topTvShowResults').addClass('hidden');
  $('#TMDBCredit').addClass('hidden');
  $('#topTvShowResults').empty();
  $('#topMovieResults').empty();
  $('#topMovieResults').removeClass('hidden');
  $('.top-results').removeClass('hidden');
  for (let i = 0; i < STORE.topMovies.results.length; i++) {
    let response = STORE.topMovies.results[i];
    if (response.original_language === 'en') {
      $('#topMovieResults').append(
      `<li class="search-result" id="${response.id}"><h3>${response.title}</h3>
      <img src='http://image.tmdb.org/t/p/w300/${response.poster_path}' alt='Movie/Show poster' class="searchPosterImage">
      <p>Rating: ${response.vote_average}/10</p>
      <p>${truncateOverview(response.overview, 125)}</p>
      </li>`
      ); 
    }   
  }
  handleSelectedTopMovie();
}

function handleSelectedTopMovie() {
  $('.search-result').on('click', function() {
    let id = $(this).attr('id');
    $('.top-results').addClass('hidden');
    $('.final-result').removeClass('hidden');
    $('#final-result-genres').empty();
    $('.genres').removeClass('hidden');
    $('.final-result').empty();
    for (let i = 0; i < STORE.topMovies.results.length; i++) {
      let response = STORE.topMovies.results[i];
      if (id == response.id) {
        let genreIds = formatGenreIds(STORE.topMovies.results[i].genre_ids);
        movieGenreSearch(genreIds);
        $('.final-result').append(
        `<h4 id="${response.id}">${response.title}</h4>
        <img src='http://image.tmdb.org/t/p/w400/${response.poster_path}' alt='Movie/Show poster' class="posterImage">
        <p>${response.overview}</p>
        <ul>
          <li>The Movie DB Rating: ${response.vote_average}</li>
          <li>The Movie DB Reviews: ${response.vote_count}</li>
          <li>Release Date: ${response.release_date}</li>
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
    return response.name;
  } else {
    return response.title;
  }
}

function handleReleaseDate(mediaType, response) {
  if (mediaType === 'tv') {
    return response.first_air_date
  } else {
    return response.release_date
  }
}

function formatReleaseType(mediaType) {
  if (mediaType === 'tv') {
    return 'First Air Date'
  } else {
    return 'Release Date'
  }
}

function formatMediaType(mediaType) {
  if (mediaType === 'tv') {
    return 'TV Show';
  } else {
    return 'Movie';
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
    mediaSearch(searchTerm);
  });
  handleTopTvShows();
  handleTopMovies();
  reloadApp();
}

$(handleForm);