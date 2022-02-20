import './styles/index.scss';
import rsschoolLogoSrc from './img/rs_school-og.png';
import clickSound from './audio/click.wav';

console.log('Предполагаемая оценка: 60/70');

window.onload = () => {
  const rsschoolLogo = document.querySelector('.rs-school-logo');
  rsschoolLogo.setAttribute('src', rsschoolLogoSrc);

  // Game itself

  let currentPlayer, gridConfig, turns;

  const rootNode = document.querySelector('#root');
  const gridTemplate = document.querySelector('#grid-template');
  const resetButton = document.querySelector('#reset-button');
  const winnerTitle = document.querySelector('#winner-title');

  resetButton.addEventListener('click', (e) => resetGame(e));

  resetGame();
  updateScores();

  function renderGrid(config, template, win = false) {
    rootNode.innerHTML = '';
    const templateClone = template.content.cloneNode(true);
    rootNode.append(templateClone);

    const spaces = Object.values(rootNode.children[0].children);

    spaces.forEach((space, i) => {
      space.addEventListener('click', (e) => onGridSpaceClickHandler(e, currentPlayer));

      if (config[i]) {
        space.innerHTML = config[i] === 'X' ? 'X' : 'O';
        space.setAttribute('disabled', 'disabled');
      }
    });

    win &&
      spaces.forEach((space) => {
        space.setAttribute('disabled', 'disabled');
      });

    !win && (winnerTitle.innerText = `It's ${currentPlayer} turn`);
  }

  function onGridSpaceClickHandler(e, playerSign) {
    gridConfig[e.target.dataset.pos] = playerSign;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    !checkWin(gridConfig) && !checkDraw() && renderGrid(gridConfig, gridTemplate);
    checkWin(gridConfig) && onWin(currentPlayer === 'X' ? 'O' : 'X');
    checkDraw() && !checkWin(gridConfig) && onDraw();

    turns++;
    const click = new Audio(clickSound);
    click.volume = 0.2;
    click.play();
  }

  function resetGame() {
    gridConfig = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    currentPlayer = 'X';
    turns = 1;

    renderGrid(gridConfig, gridTemplate);
  }

  function checkWin(gridConfig) {
    if (checkDiagonals(gridConfig) || checkLines(gridConfig)) return true;
    else return false;
  }

  function checkDraw() {
    return turns === 9;
  }

  function checkLines(gridConfig) {
    for (let i = 0; i < 3; i++) {
      const vLineSum = Array.from(new Array(3)).reduce((acc, el, j) => (acc += gridConfig[i + j * 3]), '');
      const hLineSum = Array.from(new Array(3)).reduce((acc, el, j) => (acc += gridConfig[j + i * 3]), '');

      if (hLineSum === 'XXX' || vLineSum === 'XXX') return 'X';
      if (hLineSum === 'OOO' || vLineSum === 'OOO') return 'O';
    }
  }

  function checkDiagonals(gridConfig) {
    const leftDiagSum = Array.from(new Array(3)).reduce((acc, el, i) => (acc += gridConfig[i * 4]), '');
    const rightDiagSum = Array.from(new Array(3)).reduce((acc, el, i) => (acc += gridConfig[2 + i * 2]), '');

    if (rightDiagSum === 'XXX' || leftDiagSum === 'XXX') return 'X';
    if (rightDiagSum === 'OOO' || leftDiagSum === 'OOO') return 'O';
  }

  function onWin(winner) {
    winnerTitle.innerText = `Winner is ${winner}, after ${turns} turns`;
    renderGrid(gridConfig, gridTemplate, true);
    addToScores(`${winner} wins`);

    setTimeout(function () {
      updateScores();
      resetGame();
    }, 1500);
  }

  function onDraw() {
    winnerTitle.innerText = 'Draw';
    renderGrid(gridConfig, gridTemplate, true);
    addToScores('Draw');

    setTimeout(function () {
      updateScores();
      resetGame();
    }, 1500);
  }

  function addToScores(newWinner) {
    let scores = JSON.parse(localStorage.getItem('scores'));
    scores && scores.length > 9 && scores.pop();
    scores && scores.unshift(newWinner);
    !scores && (scores = [newWinner]);
    localStorage.setItem('scores', JSON.stringify(scores));
  }

  function updateScores() {
    let newScoresTable = JSON.parse(localStorage.getItem('scores'));
    console.log(newScoresTable);
    newScoresTable && (newScoresTable = newScoresTable.map((el, i) => `${i + 1}. ${el}`).join('\n'));
    document.querySelector('#scores').innerText = newScoresTable;
  }
};
