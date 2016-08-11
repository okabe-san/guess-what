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
      url:'http://www.omdbapi.com/?s=all&type=movie&y=' + year,
      method: 'get'
    })
    .done(function(data){
      var pageN = Math.ceil((Math.random() * data.totalResults) / 10); // randomly pick page number
      // console.log(pageN);
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
      url: 'http://www.omdbapi.com/?s=all&type=movie&y=' + pageNum,
      method: 'get'
    })
    .done(function(title) {
      // console.log(pageNum);
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

function getMoveGenre(movieTitle) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url:'http://www.omdbapi.com/?t=' + newUrl,
      method: 'get'
    }).done(function(movie) {
      resolve(movie);
      if ((movie.Genre !== 'Adult') && (movie.Country === 'USA') && (movie.Poster !== 'N/A')) {
        checkPass(movie);
        resolve(movieTitle);
        console.log(movie);
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
  console.log(movieTitle);
  var time = movieTitle.length * 2500;
  $('<img src="' + movie.Poster + '"/>').appendTo('#cover').hide().fadeIn(time);
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
  // console.log(elem);
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
      alert ('Well done!!!');
      finalScoreScreen();
      // window.location.replace('./score.html'); // move to final score page
    } else {
      alert ('You Got It!');
      // console.log(count);
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
    alert ('Sorry... Wrong Answer');
  }
}

function refreshDiv() {
  $('#replace, #genre, #score, #hint, #cover').empty();
  $('#answer').val('');
  $('#score').append(score);
}

function scoreCount(num) {
  var elem = document.getElementById('replace').textContent;
  var textCount = (elem.replace(/_/g, '')).length;
  return score += Math.floor(((movieTitle.length - textCount) / movieTitle.length) * 100);
  // console.log(score);
}

function countQuestion() {
  return count += 1;
}

function finalScoreScreen() {
  $('#scoreFinal, #scoreImage').empty();
  $('#scoreFinal').html('<h2>Your Final Score Is: <br>' + '<h1>' + score + '</h1></h2><br><h2>Would you like to paly again?<br><h1>' );
  $('#restart').show();
  gifAnimation();
}

function gifAnimation() {
  if (score < 50) {
    $('#scoreImage').html('<h2>I don\'t know what are you thinking... Study a couple weeks then comeback please.</h2>');
    $('<img src="image1.gif"/>').appendTo('#scoreImage').hide().fadeIn(1000);
  } if (score >= 50 && score < 200) {
    $('#scoreImage').html('<h2>Not too bad but you can do better! Study harder please.</h2>');
    $('<img src="image1.gif"/>').appendTo('#scoreImage').hide().fadeIn(1000);
  }
}

function restartGame() {
  $('.restart').on('submit', function(e) {
    e.preventDefault();
    location.reload();
  });
}
