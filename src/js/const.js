import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

import { calcSpawn } from './utils';

export const BOARD_SIZE = 8;

export const charactersUser = [Bowman, Swordsman, Magician];
export const charactersAI = [Vampire, Undead, Daemon];

export const typesUser = ['bowman', 'swordsman', 'magician'];
export const typesAI = ['vampire', 'undead', 'daemon'];

export const spawnUser = calcSpawn([0, 1], BOARD_SIZE);
export const spawnAI = calcSpawn([6, 7], BOARD_SIZE)