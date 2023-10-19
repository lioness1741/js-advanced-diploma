import { calcTileType } from '../utils';

test.each([
  [0, 'top-left'],
  [7, 'top-right'],
  [56, 'bottom-left'],
  [63, 'bottom-right'],
  [1, 'top'],
  [58, 'bottom'],
  [8, 'left'],
  [15, 'right'],
  [10, 'center'],
])('Проверка функции calcTileType', (input, result) => {
  const received = calcTileType(input, 8);

  expect(received).toBe(result);
});
