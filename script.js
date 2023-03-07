//DOM grabbing Module
const DOM = (() => {
    return {
        //Human or AI
        selection: document.querySelectorAll(".selection"),
        //Make Selection
        makeSelection: (e) => {
            e.target.parentNode.querySelectorAll(".selection").forEach(child => {
                child.classList.remove("active");
            });
            e.target.classList.add("active");
            if(e.target.classList.contains("human")){
                if(e.target.classList.contains("one")) {
                    Controller.player1.type = "human";
                } else {
                    Controller.player2.type = "human";
                }
            } else if (e.target.classList.contains("one")) {
                Controller.player1.type = "ai";
            } else {
                Controller.player2.type = "ai";
            }
        },

        boardContainer: document.querySelector(".gameboard"),
        //To fetch current squares
        getSquares: function () {
            return this.boardContainer.querySelectorAll(".square");
        },

        createSquare: (html) => {
            const square = document.createElement("div");
            square.className = "square";
            square.innerHTML = html;
            return square;
        },

        squareInnerElement: (symbol) => {
            return `<span>${symbol}</span>`;
        },

        clearBoard: function () {
            DOM.getSquares().forEach(square => {
                this.boardContainer.removeChild(square);
            });
        },

        render: function (board) {
            this.clearBoard();
            board.forEach(square => {
                this.boardContainer.appendChild(DOM.createSquare(DOM.squareInnerElement(square.symbol)));
            });
        },

        setupWindow: document.querySelector(".setup"),
        startButton: document.querySelector(".startgame"),
        turnIndicator: document.querySelector(".turn"),
        winnerMessage: document.querySelector(".winner"),

        displayWinner: function(winner) {
            if(winner) {
                this.winnerMessage.textContent = `${winner} wins!`;
            } else {
                this.winnerMessage.textContent = `It's a tie!`;
            }

            const playAgainContainer = document.createElement("div");
            playAgainContainer.className = "playagaincontainer";
            const playAgainBtn = document.createElement("button");
            playAgainBtn.textContent = "Play Again";
            playAgainBtn.className = "playagain";
            playAgainContainer.appendChild(playAgainBtn);
            this.winnerMessage.appendChild(playAgainContainer);
            playAgainBtn.addEventListener("click", () => {
                location.reload();
                return false;
            });
        },
    };
})();
//End of DOM grabbing Module

// start Gameboard Module
const Gameboard = (() => {
    //each square is saved as an object with a symbol property, which can be an empty string, "X", or "O";
    const square = {
        symbol: "", 
    } ;

    //board saved as an array
    const board = [];

    //note that board is inaccessible to other modules but they can fetch it - CLOSURE;
    const getBoard = () => {
        return board;
    };
    //controlled board manipulation sent to the game controller;
    const newMarker = (symbol, index) => {
        board[index] = { symbol };
        DOM.render(board);
    };

    //game board load
    const init = () => {
        for(let count = 1; count <= 9; count++) {
            board.push(square);
        }
        DOM.render(getBoard());
    };

    //make it accessible to other Modules
    return {
        getBoard,
        init,
        newMarker,
    };
})()// End of Gameboard - IIFE

//Start Controller
const Controller = (() => {
    //type decided in start screen
    const player1 = {
        name: "Player 1",
        marker: "X",
        type: "",
    };

    const player2 = {
        name: "Player 2",
        marker: "O",
        type: "",
    };
    //Turn Counter
    let player1turn = true;
    //page Load selection screen
    const init = () => {
        DOM.selection.forEach(element => {
            element.addEventListener("click", DOM.makeSelection);
        }),
        DOM.startButton.addEventListener("click", () => {
            if(checkSelection()) {
                startGame();
            } else {
                alert("Please select a player type for each player");
            }
        });
    };

    //toggle turn
    playerToggle = () => {
        player1turn = !player1turn;
    };
    //To make sure the type of player is selected for each
    const checkSelection = () => {
        return Boolean(player1.type && player2.type);
    };

    const startGame = () => {
        DOM.setupWindow.getElementsByClassName.display = "none";
        Gameboard.init();
        takeTurn();
    };

    //check the board for every win condition
    const checkWinner = () => {
        const board = Gameboard.getBoard();
        const winConditions = [
            [0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
        ];
        //if any of the conditions are true, stop the game and display winner in browser console
        if(
            winConditions.some((array) => {
				let winCheck = [];
				array.forEach((box) => {
					if (board[box].symbol !== '') {
						winCheck.push(board[box]);
					}
				});
				if (winCheck.length == 3) {
					if (
						winCheck.every((square) => {
							return square.symbol == 'X';
						})
					) {
						DOM.displayWinner(player1.name);
						return true;
					} else if (
						winCheck.every((square) => {
							return square.symbol == 'O';
						})
					) {
						DOM.displayWinner(player2.name);
						return true;
					} else {
						return false;
					}
				}
			})
        ) {
            return true;
            //if the board has 9 symbols without a winner, its a tie!
        } else if(
            board.filter(square => {
                return square.symbol !== "";
            }).length == 9
        ) {
            DOM.displayWinner();
            return true;
        } else {
            return false;
        }
    };

    //AI section
    const computerPlay = (marker) => {
        let choices = Gameboard.getBoard().map((square, index) => {
            if(square.symbol !== "") {
                return false;
            } else {
                return index;
            }
        });
        choices = choices.filter(item => {
            return item !== false;
        });
        const selection = Math.floor(Math.random() * choices.length);
        Gameboard.newMarker(marker, choices[selection]);
        playerToggle();
        takeTurn();
    };

    const humanPlay = (marker) => {
        DOM.getSquares().forEach(square => {
            square.addEventListener("click", (e) => {
                if(e.currentTarget.textContent == "") {
                    const index = Array.from(e.currentTarget.parentNode.children).indexOf(e.currentTarget);
                    Gameboard.newMarker(marker, index);
                    playerToggle();
                    takeTurn();
                    return;
                }
            });
        });
    };

    //Controller flow, checks winner, swaps the player turn indicator
    const takeTurn = () => {
        if(!checkWinner()) {
            let player;
            if(player1turn) {
                player = player1;
            } else {
                player = player2;
            }
            DOM.turnIndicator.textContent = `${player.name}'s turn:`;
            if(player.type == "ai") {
                computerPlay(player.marker);
            } else {
                humanPlay(player.marker);
            }
        } else {
            console.log(`Winner Found, Stopping game!`);
        }
    };
    //LOAD GAME
    init();
    //export so the DOM module can set player types
    return {
        player1, 
        player2,
    };
})(); //End of CONTROLLER - IIFE