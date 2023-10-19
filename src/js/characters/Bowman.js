import Character from '../Character';

export default class Bowman extends Character {
  constructor(level) {
    super(level);
    this.level = level;
    this.type = 'bowman';
    this.attack = 25;
    this.defence = 25;
    this.movementRange = 2;
    this.attackRange = 2;

    this.attack *= this.setAttackByLevel(level);
  }
}
