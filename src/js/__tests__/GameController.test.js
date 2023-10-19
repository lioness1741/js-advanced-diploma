import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import PositionedCharacter from '../PositionedCharacter';
import { calcAttack, calcMovement } from '../utils';

const gamePlay = new GamePlay();
const gameStateServise = new GameStateService(localStorage);
const gameController = new GameController(gamePlay, gameStateServise);
gameController.gamePlay.showCellTooltip = jest.fn();

const bowman = new PositionedCharacter(new Bowman(1), 25);
const swordsman = new PositionedCharacter(new Swordsman(1), 35);
const magician = new PositionedCharacter(new Magician(1), 40);
[bowman, swordsman, magician].forEach((character) => gameController.gameState.addCharacter(character));

test('Проверка корректности вывода характеристик персонажа', () => {
  const character = gameController.gameState.getCharacterByPosition(25);
  const { level, attack, defence, health } = character.character;

  const message = `\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`;
  gameController.onCellEnter(25);

  expect(gameController.gamePlay.showCellTooltip).toHaveBeenCalledWith(message, 25);
});

test('Проверка особенности движения каждого класса персонажей', () => {
  const character = gameController.gameState.getCharacterByPosition(25);
  const movementArr = calcMovement(character, gamePlay.boardSize);

  for (const index of movementArr) {
    expect(gameController.onCellEnter(index));
  }
});

test.each([
  [25, 27],
  [35, 49],
  [40, 41],
])('Проверка особенности передвижения персонажей', (input, target) => {
  const character = gameController.gameState.getCharacterByPosition(input);
  gameController.gameState.setSelectedCharacter(character, gameController.gamePlay.boardSize);

  const received =
    gameController.gameState.selectedCharacter.movementCells.includes(target) &&
    gameController.gameState.isNotCharacter(target);
  expect(received).toBeTruthy();
});

test.each([
  [25, 27],
  [35, 36],
  [40, 45],
])('Проверка особенности атаки персонажей', (input, target) => {
  const character = gameController.gameState.getCharacterByPosition(input);
  gameController.gameState.setSelectedCharacter(character, gameController.gamePlay.boardSize);

  const received =
    gameController.gameState.selectedCharacter.attackCells.includes(target) &&
    gameController.gameState.isEnemyCharacter(target);
  expect(received).toBeFalsy();
});
