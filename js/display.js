var defaultHtml = '<h1>Welcome to Monikers!</h1> <div> <p class="numCards">Choose how many cards you would like to use: </p> <input class="numCards" type="number" id="numCardsInput" value="40"/> </div> <div> <p class="numCards">Team 1 Name: </p> <input class="numCards" type="text" id="team1Input"/> </div> <div> <p class="numCards">Team 2 Name: </p> <input class="numCards" type="text" id="team2Input"/> </div> <button type="button" onClick="startTurn()" id="startButton"><p>Start Round</p></button>'
var aboutToStartTurnHtml = "<p>%roundname%</p><p>Choose someone from %nextteam%</p><p>Cards Gussed: %guessedCount%</p><p>Cards Left In Deck: %deckCount%</p>"
var roundOverHtml = "<p>Round %roundnum% is over!</p><p>%winningmsg%</p><p>%team1%: %1teampoints%</p><p>%team2%: %2teampoints%</p><br><p>%roundname%</p><p>Cards in Deck: %deckCount%</p><p>Choose someone from %nextteam%</p>"
var aboutToStartGameHtml = "<p>%roundname%</p><p>Cards in Deck: %deckCount%</p><p>Choose someone from %nextteam%</p>"
var gameOverHtml = "<p>Game Over!</p><p>%winningmsg%</p><p>%team1%: %1teampoints%</p><p>%team2%: %2teampoints%</p>"
var button = '<button type="button" onClick="startTurn()" id="startButton"><p>Start Round</p></button>'
var roundNames = ["Round 1: No Restrictions", "Round 2: One Word", "Round 3: Only Gestures"];

var game;
var cardPicker;
var timer;
var timeWhenTurnEnded;

$('document').ready(function(){
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
	if(iOSSafari) {
		$("#container").height("85vh")
	}

    localStorage.clear()
    getParametersInputForCardPicker()

	// //If a game is stored in localStorage, it gets restored
	// if(localStorage.getItem("deck") != null) {
	// 	game = new Game(parseInt(localStorage.getItem("cardNum")), 3, localStorage.getItem("blueName"), localStorage.getItem("redName"));
	// 	game.restoreState();
	// 	if(localStorage.getItem("currentPhase") == "newround")
	// 		roundOver(true);
	// 	else if(localStorage.getItem("currentPhase") == "newgame")
	// 		gameAboutToStart();
	// 	else
	// 		turnAboutToStart();
	// } else {
    //     getParametersInputForCardPicker();
    // }
});

function newGame(team1Name, team2Name) {
	game = new Game(cardPicker.pickedCards(), 3, team1Name, team2Name);
	game.init();
}

//Gets called when the correct button is pressed
function correct() {
	if(game.correct()) {
		var next = game.nextCard();
		if(next == -1) {
			roundOver();
		}
		else {
			document.getElementById("card").src = cardToImg(next);
		}
	}
}

//Gets called when the pass button is pressed
function pass() {
	if(game.pass()) {
		var next = game.nextCard();
		if(next == -1)
			roundOver();
		else
			document.getElementById("card").src = cardToImg(next);
	}
}

//Gets called when the undo button is pressed
function undo() {
	if(game.undo())
		document.getElementById("card").src = cardToImg(game.currentCard);
}

function cardSelectionPhaseButtonClicked() {
    var numPlayers = $("#numPlayersInput").val();
    var cardsPerPlayer = $("#cardsPerPlayer").val();
    if (numPlayers === "" || cardsPerPlayer === "") {
        alert("Missing at least one input");
        return
    }

    startCardSelectionPhase(numPlayers, cardsPerPlayer);
}

function updateCardPickerScreen() {
    $("#cardsLeftHeader").text("Cards left: " + cardPicker.getCardsLeft())
    $("#card").attr('src', cardToImg(cardPicker.getCard()))
}

function showCardPickerScreen() {
    $("#cardPicker").show()
    $("#cardPicker").height("75%");
    updateCardPickerScreen()
}

function cardPickerYes() {
    cardPicker.useCard()
    handleCardPickPostAction()
}
function cardPickerNo() {
    handleCardPickPostAction()
}

function handleCardPickPostAction() {
    if (cardPicker.areAllPlayersDone()) {
        $("#cardPicker").hide()
        startTeamSelection()
        return
    } else if (cardPicker.isPlayerDone()) {
        $("#card").css('filter', 'blur(10px)')
        setTimeout(() => {
            alert("Next Player!")
            cardPicker.setupNextPlayer()
            $("#card").css('filter', '')
            updateCardPickerScreen()
        }, 0)
    } else {
        updateCardPickerScreen()
    }
}

function startCardSelectionPhase(numPlayers, cardsPerPlayer) {
    cardPicker = new CardPicker(numPlayers, cardsPerPlayer)
    $("#mainPage").hide()
    showCardPickerScreen()
}

function teamSelectionButtonClicked() {
    var team1 = $("#team1Input").val()
    var team2 = $("#team2Input").val()

    if (team1 == "" || team2 == "") {
        alert("At least one input is missing")
    } else if(team1 == team2) {
        alert("Team names are identical!")
    }
    if(team1 != team2) {
        $("#teamSelection").hide()
        newGame(team1, team2)
        gameAboutToStart();
        startTurn()
    }
}

//When this is called, it is either because the turn is being started or because the settings have been entered and the game is about to start
function startTurn() {
    //If 2000 milliseconds has not passed since the turn ended, the next turn cannot be started
    if(new Date().getTime() - timeWhenTurnEnded < 2000)
        return;

    $("#cardContainer").empty();
    $("#cardContainer").html('<img id="card" src="' + cardToImg(game.nextCard()) + '"/>');
    $("#cardContainer").prepend('<div id="timer"></div>');
    $("#cardContainer").height("75%");
    $("#cardContainer").show()
    $("#buttonContainer").show();
    var height = 5;
    timer = $("#timer").countdown360({
        radius      : 28,
        seconds     : 60,
        strokeWidth : 15,
        fillStyle   : '#0276FD',
        strokeStyle : '#003F87',
        fontSize    : 25,
        label: ["", ""],
        fontColor   : '#FFFFFF',
        autostart: false,
        smooth: true,
        onComplete: function(){turnAboutToStart()}
    })
    game.startTurn();
    timer.start();
}

function gameAboutToStart() {
	var container = $("#cardContainer");
	container.empty();
	timeWhenTurnEnded = new Date().getTime();
	var html = aboutToStartGameHtml;
	html = html.replace("%roundname%", roundNames[0]);
	html = html.replace("%deckCount%", game.deck.length.toString());
	html = html.replace("%nextteam%", game.getNextTeam());
	container.html(html);
	container.append(button);
	container.height("95%");
    container.show()
	game.storeState("newgame");
}

//This sets up the screen that happens before the start of each turn. This is when the device is passed to the next person.
function turnAboutToStart() {
	$("#buttonContainer").hide();
	game.endTurn();
	timeWhenTurnEnded = new Date().getTime();
	var container = $("#cardContainer");
	container.empty();
	var html = aboutToStartTurnHtml;
	html = html.replace("%roundname%", roundNames[game.currentRound - 1]);
	html = html.replace("%deckCount%", game.deck.length.toString());
	html = html.replace("%nextteam%", game.getNextTeam());
	html = html.replace("%guessedCount%", game.cardsJustGotten.toString());
	container.html(html);
	container.append(button);
	container.height("95%");
	game.storeState("newturn");
}

//Restoring is false usually, however if the screen is being restored from a refresh/disconnect then timer/game is not manipulated.
function roundOver(restoring = false) {
	$("#buttonContainer").hide();
	timeWhenTurnEnded = new Date().getTime();
	if(!restoring) {
		game.endTurn();
		timer.stop();
	}
	if(!restoring && game.currentRound == 3) {
		gameOver();
	}
	else {
		if(!restoring)
			game.nextRound();
		var container = $("#cardContainer");
		container.empty();
		var html = roundOverHtml;
		html = html.replace("%roundnum%", (game.currentRound - 1).toString());
		html = html.replace("%winningmsg%", game.getGameStatus());
		html = html.replace("%team1%", game.blueName);
		html = html.replace("%1teampoints%", game.bluePoints.toString());
		html = html.replace("%team2%", game.redName);
		html = html.replace("%2teampoints%", game.redPoints.toString());
		html = html.replace("%roundname%", roundNames[game.currentRound - 1]);
		html = html.replace("%deckCount%", game.deck.length.toString());
		html = html.replace("%nextteam%", game.getNextTeam());
		container.html(html);
		container.append(button);
		container.height("95%");
		game.storeState("newround");
	}
}

function gameOver() {
	game.nextRound();
	var container = $("#cardContainer");
	container.empty();
	var html = gameOverHtml;
	html = html.replace("%winningmsg%", game.getFinalGameStatus());
	html = html.replace("%team1%", game.blueName);
	html = html.replace("%1teampoints%", game.bluePoints.toString());
	html = html.replace("%team2%", game.redName);
	html = html.replace("%2teampoints%", game.redPoints.toString());
	container.html(html);
	container.height("95%");
	game.clearState();
}

function cardToImg(card) {
	return "res/card" + card + ".png"
}

function pause() {
	timer.stop()
	var elapsed = timer.getElapsedTime()
	alert("The game is paused.")
	timer.start()
	timer.extendTimer(-1 * elapsed)
}

function startTeamSelection() {
    // $("#buttonContainer").hide()
    $("#teamSelection").show()
}

function getParametersInputForCardPicker() {
    $("#mainPage").show()
}

