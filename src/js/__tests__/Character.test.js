import Character from '../Character';
import Bowman from '../characters/Bowman';

test('Ошибка при создании объекта класса Character', () => {
  expect(() => new Character(1)).toThrow('Невозможно создать персонажа!');
});

test('Удачное создание унаследованных объектов класса Character', () => {
  expect(() => new Bowman(1)).not.toThrow();
});
