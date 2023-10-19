import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import Team from './Team';

import cursors from './cursors';
import themes from './themes';

import { charactersAI, charactersUser, spawnAI, spawnUser, typesAI, typesUser } from './const';
import { generateTeam } from './generators';
import { calcDamage, calcPosition, calcPriorities, calcVLength, getXY, roundNumberWithFix } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  init(state) {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    if (state) {
      this.gameState.setState(state);
    } else {
      const teamUser = new Team(generateTeam(charactersUser, 1, 2));
      const teamAI = new Team(generateTeam(charactersAI, 1, 2));
      this.addCharacters(teamUser, spawnUser);
      this.addCharacters(teamAI, spawnAI);
    }

    this.gamePlay.drawUi(themes[this.gameState.levelZone]);
    this.gamePlay.redrawPositions(this.gameState.characters);
  }

  addCharacters(team, spawn) {
    team.members.forEach((character) => {
      const position = calcPosition(spawn, this.gameState.characters);
      this.gameState.addCharacter(new PositionedCharacter(character, position));
    });
  }

  deselectAllCells() {
    this.gameState.characters.forEach((el) => this.gamePlay.deselectCell(el.position));
  }

  characterSelection(index) {
    const character = this.gameState.getCharacterByPosition(index);
    this.gameState.setSelectedCharacter(character, this.gamePlay.boardSize);
    this.gamePlay.selectCell(index);
  }

  cellSelection(index) {
    if (!this.gameState.selectedCharacter) {
      return;
    }

    const { movementCells, attackCells } = this.gameState.selectedCharacter;
    if (this.gameState.isEnemyCharacter(index) && attackCells.includes(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
    }
    if (this.gameState.isNotCharacter(index) && movementCells.includes(index)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    }
  }

  async attackLogic(index) {
    if (!this.gameState.selectedCharacter) {
      return;
    }

    const { subject, attackCells } = this.gameState.selectedCharacter;
    if (this.gameState.isEnemyCharacter(index) && attackCells.includes(index)) {
      const { character } = this.gameState.getCharacterByPosition(index);
      const damage = calcDamage(subject.character.attack, character.defence);
      const health = roundNumberWithFix(character.health - damage);

      health > 0 ? this.gameState.attackCharacter(index, health) : this.gameState.removeCharacter(index);
      this.gameState.clearSelectedCharacter();

      if (this.gameState.ifOnlyCharacters(typesUser)) {
        if (this.gameState.levelZone !== 4) {
          this.gameState.levelUpCharacters();
          this.gameState.levelUpZone();

          const addQuantityCharacters = this.gameState.levelZone - this.gameState.characters.length + 1;
          const teamUser = new Team(generateTeam(charactersUser, this.gameState.levelZone, addQuantityCharacters));
          const teamAI = new Team(generateTeam(charactersAI, this.gameState.levelZone, this.gameState.levelZone + 1));
          this.addCharacters(teamUser, spawnUser);
          this.addCharacters(teamAI, spawnAI);
          this.gameState.fixParametersCharacters();
        } else {
          this.gameState.setGameOverOn();
          alert('GAME WIN');
        }
      }

      if (this.gameState.ifOnlyCharacters(typesAI)) {
        this.gameState.setGameOverOn();
        alert('GAME OVER');
      }

      await this.gamePlay.showDamage(index, damage);
      this.gamePlay.gameOver || this.gamePlay.drawUi(themes[this.gameState.levelZone]);
    }
  }

  movementLogic(index) {
    if (!this.gameState.selectedCharacter) {
      return;
    }

    const { subject, movementCells } = this.gameState.selectedCharacter;
    if (this.gameState.isNotCharacter(index) && movementCells.includes(index)) {
      this.gameState.moveCharacter(index, subject.position);
      this.gameState.clearSelectedCharacter();
    }
  }

  aiLogic() {
    const aiChars = this.gameState.getCharactersByTypes(typesAI);
    const userChars = this.gameState.getCharactersByTypes(typesUser);

    if (!aiChars.length) {
      return;
    }

    const { ai, user } = calcPriorities(aiChars, userChars, this.gamePlay.boardSize);
    const userXY = getXY(user.position, this.gamePlay.boardSize);
    this.onCellClick(ai.position);

    if (!this.gameState.selectedCharacter) {
      return;
    }

    const { movementCells, attackCells } = this.gameState.selectedCharacter;
    const cell = movementCells.reduce(
      (a, c) => {
        if (!this.gameState.isNotCharacter(c)) {
          return a;
        }

        const cellXY = getXY(c, this.gamePlay.boardSize);
        const length = calcVLength(cellXY, userXY);
        a = a.length > length ? { length, position: c } : a;
        return a;
      },
      { length: 9999, position: 9999 }
    );

    if (attackCells.includes(user.position)) {
      this.onCellClick(user.position);
    } else {
      this.onCellClick(cell.position);
    }
  }

  async onCellClick(index) {
    // TODO: react to click
    if (this.gameState.gameOver) {
      return;
    }

    this.deselectAllCells();
    if (this.gameState.isFriendlyCharacter(index)) {
      return this.characterSelection(index);
    }

    await this.attackLogic(index);
    this.movementLogic(index);

    this.gamePlay.deselectCell(index);
    this.gamePlay.redrawPositions(this.gameState.characters);

    if (this.gameState.move) {
      this.gameState.selectedCharacter && GamePlay.showError('Некорректный ход!');
    } else {
      this.aiLogic();
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const character = this.gameState.getCharacterByPosition(index);
    if (character) {
      const { level, attack, defence, health } = character.character;
      const message = `\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`;
      this.gamePlay.showCellTooltip(message, index);
    }

    if (!this.gamePlay.boardEl) {
      return;
    }

    if (this.gameState.isFriendlyCharacter(index)) {
      this.gamePlay.setCursor(cursors.pointer);
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
    }

    this.cellSelection(index);
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (!this.gameState.selectedCharacter) {
      return;
    }

    const { subject } = this.gameState.selectedCharacter;
    subject.position !== index && this.gamePlay.deselectCell(index);
  }

  onNewGameClick() {
    this.gameState.clearAll();
    this.init();
  }

  onSaveGameClick() {
    this.stateService.save(this.gameState);
  }

  onLoadGameClick() {
    this.init(this.stateService.load());
  }
}
