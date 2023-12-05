// Cache frequently used elements
const playerNameInput = document.getElementById('player-name');
const cardsContainer = document.getElementById('bingo-cards');
const drawnNumbersTable = document.getElementById('drawn-numbers');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const gerarButton = document.getElementById('gerar-cartela');

function generateCard() {
    const playerName = playerNameInput.value;
    if (!playerName) {
        alert('Por favor, insira seu nome para gerar uma cartela.');
        return;
    }

    const card = generateRandomCard();
    displayCard(playerName, card);
    playerNameInput.value = '';
}

function generateRandomCard() {
    const card = {
        'B': generateUniqueRandomNumbers(1, 15, 5),
        'I': generateUniqueRandomNumbers(16, 30, 5),
        'N': generateUniqueRandomNumbers(31, 45, 4),
        'G': generateUniqueRandomNumbers(46, 60, 5),
        'O': generateUniqueRandomNumbers(61, 75, 5)
    };

    const middleIndex = Math.floor(card['N'].length / 2);
    card['N'].splice(middleIndex, 0, 'X');

    return card;
}

function generateUniqueRandomNumbers(start, end, count) {
    const numbers = new Set();
    while (numbers.size < count) {
        const randomNumber = Math.floor(Math.random() * (end - start + 1)) + start;
        numbers.add(randomNumber);
    }
    return Array.from(numbers);
}

function displayCard(playerName, card) {
    const cardTable = document.createElement('table');
    cardTable.classList.add('bingo-card');

    const columns = ['B', 'I', 'N', 'G', 'O'];

    const headerRow = document.createElement('tr');
    for (const column of columns) {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    }
    cardTable.appendChild(headerRow);

    for (let i = 0; i < 5; i++) {
        const row = document.createElement('tr');
        for (const column of columns) {
            const td = document.createElement('td');
            td.textContent = card[column][i];
            row.appendChild(td);
        }
        cardTable.appendChild(row);
    }

    const playerNameRow = document.createElement('tr');
    const playerNameCell = document.createElement('td');
    playerNameCell.classList.add('playerName');
    playerNameCell.setAttribute('colspan', '6');
    playerNameCell.textContent = playerName;
    playerNameRow.appendChild(playerNameCell);
    cardTable.appendChild(playerNameRow);

    cardsContainer.appendChild(cardTable);
}

let bingoCards = [];
let gameInProgress = true;

function startGame() {
    gameInProgress = true;
    const cards = document.querySelectorAll('.bingo-card');
    if (cards.length < 2) {
        alert('É necessário gerar pelo menos duas cartelas para iniciar o jogo.');
        return;
    }

    restartButton.style.display = 'inline-block';
    startButton.style.display = 'none';
    gerarButton.style.display = 'none';
    bingoCards = cards;

    const drawnNumbers = generateUniqueRandomNumbers(1, 75, 75);

    const drawNextNumber = () => {
        if (!gameInProgress) {
            return;
        }

        const drawnNumber = drawnNumbers.pop();
        if (drawnNumber) {
            updateDrawnNumbersList(drawnNumber);
            markNumberInCards(drawnNumber);
            checkWinner();

            if (drawnNumbers.length > 0) {
                requestAnimationFrame(drawNextNumber);
            } else {
                gameInProgress = false;
            }
        }
    };

    drawNextNumber();
}

function markNumberInCards(number) {
    for (const card of bingoCards) {
        const tdElements = card.querySelectorAll('table td:not(.playerName)');
        tdElements.forEach(td => {
            if (td.textContent === number.toString()) {
                td.classList.add('marked');
            }
        });
    }
}

function checkWinner() {
    for (const card of bingoCards) {
        const playerNameElement = card.querySelector('table tr:last-child td.playerName');
        if (playerNameElement) {
            const playerName = playerNameElement.textContent;
            const markedCells = card.querySelectorAll('.marked').length;
            if (markedCells === 24) {
                displayWinner(playerName);
                gameInProgress = false;
                break;
            }
        }
    }
}

function displayWinner(playerName) {
    restartButton.style.display = 'inline-block';

    const winnerDisplay = document.createElement('h2');
    winnerDisplay.id = 'winner-display';
    winnerDisplay.textContent = `O(a) jogador(a) ${playerName} venceu!`;
    document.body.appendChild(winnerDisplay);

    blinkWinnerDisplay(winnerDisplay);
}

function blinkWinnerDisplay(winnerDisplay) {
    let isGreenBackground = true;
    let startTime = null;

    function blink(timestamp) {
        if (!startTime) {
            startTime = timestamp;
        }

        const elapsed = timestamp - startTime;

        if (elapsed > 500) {
            isGreenBackground = !isGreenBackground;
            winnerDisplay.style.color = isGreenBackground ? 'white' : '#4CAF50';
            winnerDisplay.style.backgroundColor = isGreenBackground ? '#4CAF50' : 'white';
            startTime = timestamp;
        }

        if (gameInProgress) {
            requestAnimationFrame(blink);
        }
    }

    requestAnimationFrame(blink);
}


function updateDrawnNumbersList(number) {
    const lastRow = drawnNumbersTable.rows[drawnNumbersTable.rows.length - 1];

    if (!lastRow || lastRow.cells.length >= 20) {
        const newRow = drawnNumbersTable.insertRow();
        const newCell = newRow.insertCell();
        newCell.textContent = number;
    } else {
        const newCell = lastRow.insertCell();
        newCell.textContent = number;
    }
}


function restartGame() {
    restartButton.style.display = 'none';

    const winnerDisplay = document.querySelector('h2');
    if (winnerDisplay) {
        winnerDisplay.remove();
    }

    startButton.style.display = 'inline-block';
    resetGame();
}

function resetGame() {
    cardsContainer.innerHTML = '';
    drawnNumbersTable.innerHTML = '';

    const gerarButton = document.getElementById('gerar-cartela');
    gerarButton.style.display = 'inline-block';

    gameInProgress = false;
    bingoCards = [];
}
