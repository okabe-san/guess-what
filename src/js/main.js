$(document).ready(function () {
  $('#restart').hide();
  $('.year').on('submit', function(e) {
    e.preventDefault();
    if ($('#year').val()) {
      getPage($('#year').val())
      .then(function(pageNum) {
        return getMovieTitle(pageNum);
      })
      .then(function (movieTitle) {
        return getMoveGenre(movieTitle);
      })
      .then(function (title) {
        showText(title, 0);
      });
    }
  });
  $('.answer').on('submit', function (e) {
    e.preventDefault();
    checkAnswer();
  });
});

function getPage(year) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url:'http://www.omdbapi.com/?s=all&type=movie&y=' + year, // URL year
      method: 'get'
    })
    .done(function(data){
      var pageN = Math.ceil((Math.random() * data.totalResults) / 10); // randomly pick page number
      var pageNum = year + '&page=' + pageN;
      resolve(pageNum);
    })
    .fail(function(err) {
      reject(err);
    });
  });
}

function getMovieTitle(pageNum) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: 'http://www.omdbapi.com/?s=all&type=movie&y=' + pageNum, // URL page
      method: 'get'
    })
    .done(function(title) {
      movieTitle = title.Search[Math.floor(Math.random() * title.Search.length)].Title;
      // randomly pick movie title
      movieTitleHidden = movieTitle.replace(/[a-z]/g, '_');
      $('#replace').hide();
      $('#replace').html(movieTitleHidden); // append movie title to dom
      movieTitleArr = movieTitleHidden.split(''); // for replacing movie title
      newUrl = movieTitle + '&y=' + $('#year').val();
      resolve(movieTitle, newUrl);
    })
    .fail(function(err) {
      reject(err);
    });
  });
}

var counter = 0;
function countRequest() {
  return counter += 1;
}

function getMoveGenre(movieTitle) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url:'http://www.omdbapi.com/?t=' + newUrl, // URL title
      method: 'get'
    }).done(function(movie) {
      resolve(movie);
      if (movie.Genre !== 'Adult') {
        checkPass(movie);
        checkPoster(movie);
        resolve(movieTitle);
      } else {
          getPage($('#year').val())
          .then(function (pageNum) {
            return getMovieTitle(pageNum);
          })
          .then(function (movieTitle) {
            return getMoveGenre(movieTitle);
          });
        }
    });
  });
}

function checkPass(movie) {
  $('#replace').show(); // show movie title
  $('#genre').append('<h4>' + movie.Genre + '</h4>');
  $('#hint').append('<h4>' + movie.Actors + '</h4>');
  $('#hint2').append('<h4>' + movie.Director + '</h4>');
  console.log(movieTitle);
}

function checkPoster(movie) {
  if (movie.Poster !== 'N/A') {
    var time = movieTitle.length * 2500;
    $('<img src="' + movie.Poster + '"/>').appendTo('#cover').hide().fadeIn(time);
  }
}

function showText(text, index) {
  //console.log(text);
  text = movieTitle.split('');
  var target = movieTitleArr.indexOf('_');
  movieTitleArr[target] = text[target];
  $('#replace').html(movieTitleArr.join(''));
  setTimeout(function () {
    showText(movieTitle, index);}, 5000); // set interval
}

function replace(movieTitle) {
  var elem = document.getElementById('replace');
  elem.textContent = movieTitle;
}

/* answer check and score count */
var score = 0;
var count = 0;
function checkAnswer() {
  if (movieTitle === $('#answer').val()) {
    countQuestion();
    scoreCount();
    refreshDiv();
    // change quize numbers at here
    if (count === 2) {
      message('Well done!');
      finalScoreScreen(); // geme is done. go to final score screen.
    } else {
      message('You got it!');
      getPage($('#year').val())
      .then(function(pageNum) {
        return getMovieTitle(pageNum);
      })
      .then(function (movieTitle) {
        return getMoveGenre(movieTitle);
      })
      .then(function (title) {
        showText(title, 0);
      });
    }
  } else {
    message('Wrong anser... Try again.');
  }
}

/* messages for the answer */
function message(messageText) {
  $('#message').empty();
  $('#message').html('<h1>' + messageText + '<h1>');
  $('#message').fadeOut(10000);
}

function refreshDiv() {
  $('#replace, #genre, #score, #hint, #hint2, #cover').empty();
  $('#answer').val('');
  $('#score').append(score);
}

function scoreCount(num) {
  var elem = document.getElementById('replace').textContent;
  var textCount = (elem.replace(/_/g, '')).length;
  return score += Math.floor(((movieTitle.length - textCount) / movieTitle.length) * 100);
}

function countQuestion() {
  return count += 1;
}

function finalScoreScreen() {
  $('#scoreFinal, #scoreFinalMessage').empty();
  $('#scoreFinal').html('<h2>Your Final Score Is: <br>' + '<h1>' + score + '</h1></h2><br><h2>Would you like to paly again?<br><h1>' );
  $('#restart').show();
  finalMessage();
}

function finalMessage() {
  if (score < 0) {
    $('#scoreFinalMessage').html('<h1>NOOOOO!!!<br>Super low score...</h1>');
  } else {
    $('#scoreFinalMessage').html('<h1>Amazing!!! You are the champ.</h1>');
  }
}

function restartGame() {
  $('.restart').on('submit', function(e) {
    e.preventDefault();
    location.reload();
  });
}
