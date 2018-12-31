var TOTAL_CARD_NUM = 483;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function CardPicker(numPlayers, cardsPerPlayer) {
    this.cardsPerPlayer = cardsPerPlayer

    this.playersLeft = numPlayers - 1
    this.cardsLeftCurrentPlayer = this.cardsPerPlayer

    this.seenCards = []
    this.usedCards = []
    this.currentCard

    this.getCard = function() {
        do {
            this.currentCard = getRandomCard()
        } while (this.seenCards.indexOf(this.currentCard) !== -1)

        this.seenCards.push(this.currentCard)
        return this.currentCard
    }
    this.getCardsLeft = function() {
        return this.cardsLeftCurrentPlayer
    }
    this.useCard = function() {
        this.usedCards.push(this.currentCard)
        this.cardsLeftCurrentPlayer --
    }
    this.isPlayerDone = function() {
        return this.cardsLeftCurrentPlayer == 0
    }
    this.areAllPlayersDone = function() {
        return this.playersLeft == 0 && this.isPlayerDone()
    }
    this.setupNextPlayer = function() {
        this.cardsLeftCurrentPlayer = this.cardsPerPlayer
        this.playersLeft --
    }
    this.pickedCards  = function() {
        return this.usedCards
    }
}

function getRandomCard() {
    return Math.ceil(Math.random() * TOTAL_CARD_NUM)
}

function Game(deck, numRounds, team1Name, team2Name) {
	this.deck = deck
	this.bluePile = []
	this.redPile = []
	this.blueName = team1Name;
	this.redName = team2Name;
	this.undoInfo = null
	this.currentCard = -1
	this.bluePoints = 0
	this.redPoints = 0
	this.currentRound = 1
	this.numRounds = numRounds
	this.cardsJustGotten = 0
	this.cardsInPileAtStartOfTurn
	//currentTurn = 1 corresponds to blue, -1 corresponds to red
	this.currentTurn
	this.init = function() {
		this.deck = shuffleArray(this.deck)

		if(Math.random() < 0.5)
			this.currentTurn = -1
		else
			this.currentTurn = 1
	}
	this.getNextTeam = function() {
		if(this.currentTurn == 1)
			return this.blueName
		else
			return this.redName
	}
	this.getGameStatus = function() {
		if(this.redPoints > this.bluePoints)
			return this.redName + " is winning!"
		else if(this.bluePoints > this.redPoints)
			return this.blueName + "is winning!"
		else
			return "The game is tied!"
	}
	this.getFinalGameStatus = function() {
		if(this.redPoints > this.bluePoints)
			return this.redName + " won!"
		else if(this.bluePoints > this.redPoints)
			return this.blueName + " won!"
		else
			return "It's a tie!"
	}
	this.getCardValue = function(card) {
        // pixel = getPixel(cardToImg(card), 0, 0)
        // alert(pixel)
		return 1;
	}
	//Whenever a card is passed, it is added to the passed pile
	this.pass = function() {
		if(this.currentCard == -1)
			return false
		this.deck.push(this.currentCard)
		this.undoInfo = [this.currentCard]
		return true
	}
	//When a card is gussed, it is added to the pile for the corresponding team
	this.correct = function() {
		if(this.currentCard == -1)
			return false
		if(this.currentTurn == 1) {
			this.bluePile.push(this.currentCard)
			this.undoInfo = [this.currentCard]
		}
		else {
			this.redPile.push(this.currentCard)
			this.undoInfo = [this.currentCard]
		}
		return true
	}
	this.nextCard = function() {
		//If the deck is empty, then the passed pile becomes the deck. If there is no passed pile, the round is over
		if(this.deck.length == 0) {
            return -1
        }
		this.currentCard = this.deck.shift()
		if(this.undoInfo != null)
			this.undoInfo.push(this.currentCard)
		return this.currentCard
	}
	//The undo button allows you to undo the last action taken. If you click undo, clicking undo again will do nothing
	//undoInfo is an array with two values. The first value is the value of the card that was put into the wrong pile.
	//The second value is the value of the card that came after the misclicked card
	//Clicking undo restores the first value as currentCard and puts the second value on top of the deck
	this.undo = function() {
		if(this.undoInfo == null)
			return false
		this.deck.push(this.undoInfo[1])
		this.currentCard = this.undoInfo[0]
		this.undoInfo = null;
		return true;
	}
	//At the start of the turn, the number of cards in the current teams pile is noted so that the change can be calculated at the end of the turn
	this.startTurn = function() {
        this.deck = shuffleArray(this.deck)
		if(this.currentTurn == 1)
			this.cardsInPileAtStartOfTurn = this.bluePile.length
		else
			this.cardsInPileAtStartOfTurn = this.redPile.length
	}
	this.endTurn = function() {
		if(this.currentCard == -1)
			return false
		//The number of cards guessed and passed are noted so they can be reported
		if(this.currentTurn == 1)
			this.cardsJustGotten = this.bluePile.length - this.cardsInPileAtStartOfTurn
		else
			this.cardsJustGotten = this.redPile.length - this.cardsInPileAtStartOfTurn

		this.deck.unshift(this.currentCard)
		this.undoInfo = null
		this.currentCard = -1
		this.currentTurn = this.currentTurn * -1;
		return true
	}
	//Point totals are calculated at the end of the round
	//The deck is restored by combining the blue and red piles
	this.nextRound = function() {
		this.currentRound += 1
		for(var i = 0; i < this.redPile.length; i++)
			this.redPoints += this.getCardValue(this.redPile[i])
		for(var i = 0; i < this.bluePile.length; i++)
			this.bluePoints += this.getCardValue(this.bluePile[i])

		this.deck = shuffleArray(this.redPile.concat(this.bluePile))
		this.redPile = []
		this.bluePile = []
		if(this.redPoints > this.bluePoints)
			this.currentTurn = 1
		else if(this.bluePoints > this.redPoints)
			this.currentTurn = -1
		else
			this.currentTurn = (Math.random() < 0.5) ? 1 : -1
	}
	this.storeState = function(currentPhase) {
		localStorage.setItem("deck", this.deck.toString());
		localStorage.setItem("bluePile", this.bluePile.toString());
		localStorage.setItem("redPile", this.redPile.toString());
		localStorage.setItem("blueName", this.blueName);
		localStorage.setItem("redName", this.redName);
		localStorage.setItem("bluePoints", this.bluePoints.toString());
		localStorage.setItem("redPoints", this.redPoints.toString());
		localStorage.setItem("currentRound", this.currentRound.toString());
		localStorage.setItem("currentTurn", this.currentTurn.toString());
		localStorage.setItem("cardsJustGotten", this.cardsJustGotten.toString());
		localStorage.setItem("currentPhase", currentPhase);
	}
	this.restoreState = function() {
		this.deck = localStorage.getItem("deck").split(",");
		this.bluePile = localStorage.getItem("bluePile").split(",");
		this.redPile = localStorage.getItem("redPile").split(",");
		this.blueName = localStorage.getItem("blueName");
		this.redName = localStorage.getItem("redName");
		this.bluePoints = parseInt(localStorage.getItem("bluePoints"));
		this.redPoints = parseInt(localStorage.getItem("redPoints"));
		this.currentRound = parseInt(localStorage.getItem("currentRound"));
		this.currentTurn = parseInt(localStorage.getItem("currentTurn"));
		this.cardsJustGotten = parseInt(localStorage.getItem("cardsJustGotten"));
	}
	this.clearState = function() {
		localStorage.removeItem("deck");
		localStorage.removeItem("bluePile");
		localStorage.removeItem("redPile");
		localStorage.removeItem("blueName");
		localStorage.removeItem("redName");
		localStorage.removeItem("bluePoints");
		localStorage.removeItem("redPoints");
		localStorage.removeItem("currentRound");
		localStorage.removeItem("currentTurn");
		localStorage.removeItem("cardsJustGotten");
		localStorage.removeItem("currentPhase");
	}
}

function getPixel(url, x, y) {
    var img = new Image();
    img.src = url;
    img.setAttribute('crossOrigin', '')
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    return context.getImageData(x, y, 1, 1).data;
}
