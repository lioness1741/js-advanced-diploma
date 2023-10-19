import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import { characterGenerator, generateTeam } from '../generators';

test('Правильные характеристики созданного персонажа 1-го уровня', () => {
  const charactersUser = [Bowman];
  const input = characterGenerator(charactersUser, 1);

  expect(input.next().value).toEqual(new Bowman(1));
});

test('Генератор characterGenerator выдаёт бесконечно новые персонажи из списка', () => {
  const charactersUser = [Bowman, Swordsman, Magician];
  const input = characterGenerator(charactersUser, 1).next().value;

  expect(charactersUser.some((el) => el.name.toLowerCase() === input.type)).toBe(true);
});

test('Правильное количество и уровни созданных персонажей', () => {
  const charactersUser = [Bowman, Swordsman, Magician];
  const input = generateTeam(charactersUser, 3, 2);

  expect(input.length).toBe(2);
  expect(input.every((el) => el.level <= 3)).toBe(true);
});
