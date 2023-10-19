import { spawnUser, typesAI, typesUser } from './const';
import { calcAttack, calcMovement, calcPosition, roundNumberWithFix } from './utils';

export default class GameState {
  constructor() {
    this.levelZone = 1;
    this.characters = [];
    this.selectedCharacter = null;
    this.move = true;
    this.gameOver = false;
  }

  clearAll() {
    this.levelZone = 1;
    this.characters = [];
    this.selectedCharacter = null;
    this.move = true;
    this.gameOver = false;
  }

  clearSelectedCharacter() {
    this.selectedCharacter = null;
  }

  setState(state) {
    this.levelZone = state.levelZone;
    this.characters = state.characters;
    this.selectedCharacter = null;
    this.move = state.move;
    this.gameOver = state.gameOver;
  }

  setGameOverOn() {
    this.gameOver = true;
  }

  setSelectedCharacter(subject, boardSize) {
    this.selectedCharacter = {
      subject,
      movementCells: calcMovement(subject, boardSize),
      attackCells: calcAttack(subject, boardSize),
    };
  }

  addCharacter(character) {
    this.characters.push(character);
  }

  removeCharacter(position) {
    this.characters = this.characters.filter((el) => el.position !== position);
    this.move = !this.move;
  }

  moveCharacter(position, oldPosition) {
    this.characters = this.characters.map((el) => {
      if (el.position === oldPosition) {
        el.position = position;
      }
      return el;
    });
    this.move = !this.move;
  }

  attackCharacter(position, health) {
    this.characters = this.characters.map((el) => {
      if (el.position === position) {
        el.character.health = health;
      }
      return el;
    });
    this.move = !this.move;
  }

  getCharacterByPosition(position) {
    return this.characters.find((character) => character.position === position);
  }

  getCharactersByTypes(types) {
    return this.characters.filter((character) => types.includes(character.character.type));
  }

  isFriendlyCharacter(position) {
    const character = this.getCharacterByPosition(position);
    const types = this.move ? typesUser : typesAI;
    return character ? types.includes(character.character.type) : false;
  }

  isEnemyCharacter(position) {
    const character = this.getCharacterByPosition(position);
    const types = this.move ? typesAI : typesUser;
    return character ? types.includes(character.character.type) : false;
  }

  isNotCharacter(position) {
    return !(this.isFriendlyCharacter(position) || this.isEnemyCharacter(position));
  }

  ifOnlyCharacters(types) {
    return this.characters.every((el) => types.includes(el.character.type));
  }

  levelUpCharacters() {
    this.characters = this.characters.map((el, _, characters) => {
      const { health, attack } = el.character;
      el.position = calcPosition(spawnUser, characters);
      el.character.attack = Math.max(attack, (attack * (80 + health)) / 100);
      el.character.health = Math.min(health + 80, 100);
      el.character.level++;
      return el;
    });
    this.move = !this.move;
  }

  levelUpZone() {
    this.levelZone = Math.min(++this.levelZone, 4);
  }

  fixParametersCharacters() {
    this.characters = this.characters.map((el) => {
      const { attack, health } = el.character;
      el.character.attack = roundNumberWithFix(attack);
      el.character.health = roundNumberWithFix(health);
      return el;
    });
  }
}