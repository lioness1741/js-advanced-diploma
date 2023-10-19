/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  const topLeft = 0;
  const topRight = boardSize - 1;
  const bottomLeft = boardSize ** 2 - boardSize;
  const bottomRight = boardSize ** 2 - 1;

  switch (index) {
    case topLeft:
      return 'top-left';
    case topRight:
      return 'top-right';
    case bottomLeft:
      return 'bottom-left';
    case bottomRight:
      return 'bottom-right';
    default:
      if (index > topLeft && index < topRight) {
        return 'top';
      }
      if (index > bottomLeft && index < bottomRight) {
        return 'bottom';
      }
      if (index % boardSize === 0) {
        return 'left';
      }
      if (index % boardSize === boardSize - 1) {
        return 'right';
      }
      return 'center';
  }
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function calcSpawn(cols, boardSize) {
  const spawn = [];
  for (let i = 0; i < boardSize; i++) {
    cols.forEach((col) => spawn.push(col + boardSize * i));
  }
  return spawn;
}

export function calcPosition(spawn, characters) {
  const randomIdx = Math.floor(Math.random() * (spawn.length - 1));
  const hasPosition = characters.some((character) => character.position === spawn[randomIdx]);
  return hasPosition ? calcPosition(spawn, characters) : spawn[randomIdx];
}

function getRow(position, boardSize) {
  const floor = Math.floor(position / boardSize);
  return [floor * boardSize, (floor + 1) * boardSize - 1];
}

function getCol(position, boardSize) {
  const floor = Math.floor(position / boardSize);
  return [position - floor * boardSize, position + (boardSize - 1 - floor) * boardSize];
}

export function calcMovement(selectedCharacter, boardSize) {
  const { character, position } = selectedCharacter;

  const [rowMin, rowMax] = getRow(position, boardSize);
  const left = Math.max(position - character.movementRange, rowMin);
  const right = Math.min(position + character.movementRange, rowMax);

  const cells = [];
  for (let i = left; i <= right; i++) {
    let temp;
    const [colMin, colMax] = getCol(i, boardSize);

    const rowIdx = Math.abs(position - i);
    if (rowIdx) {
      temp = [i];
      if (i - rowIdx * boardSize >= colMin) {
        temp.push(i - rowIdx * boardSize);
      }
      if (i + rowIdx * boardSize <= colMax) {
        temp.push(i + rowIdx * boardSize);
      }
    } else {
      temp = [];
      const top = Math.max(i - character.movementRange * boardSize, colMin);
      const bottom = Math.min(i + character.movementRange * boardSize, colMax);
      for (let j = top; j <= bottom; j += boardSize) {
        temp.push(j);
      }
    }
    cells.push(...temp);
  }
  return cells;
}

export function calcAttack(selectedCharacter, boardSize) {
  const { character, position } = selectedCharacter;

  const [rowMin, rowMax] = getRow(position, boardSize);
  const left = Math.max(position - character.attackRange, rowMin);
  const right = Math.min(position + character.attackRange, rowMax);

  const cells = [];
  for (let i = left; i <= right; i++) {
    const temp = [i];
    const [colMin, colMax] = getCol(i, boardSize);
    for (let j = 1; j <= character.attackRange; j++) {
      if (i - j * boardSize >= colMin) {
        temp.push(i - j * boardSize);
      }
      if (i + j * boardSize <= colMax) {
        temp.push(i + j * boardSize);
      }
    }
    cells.push(...temp);
  }
  return cells;
}

export function getXY(position, boardSize) {
  return { x: position % boardSize, y: Math.floor(position / boardSize) };
}

export function calcVLength(xy1, xy2) {
  return Math.sqrt((xy2.x - xy1.x) ** 2 + (xy2.y - xy1.y) ** 2);
}

export function calcPriorities(aiChars, userChars, boardSize) {
  let priorities = aiChars.reduce((a, c) => {
    userChars.forEach((u) => {
      const aiXY = getXY(c.position, boardSize);
      const userXY = getXY(u.position, boardSize);
      a.push({ ai: c, user: u, length: calcVLength(aiXY, userXY) });
    });
    return a;
  }, []);
  priorities = priorities.sort((a, b) => a.length - b.length);
  priorities = priorities.sort((a, b) => {
    const bSum = b.ai.character.attack + b.user.character.attack;
    const aSum = a.ai.character.attack + a.user.character.attack;
    return bSum - aSum;
  });

  return { ai: priorities[0].ai, user: priorities[0].user };
}

export function roundNumberWithFix(number, fractionDigits = 1) {
  return Math.round(number * 10 ** fractionDigits) / 10 ** fractionDigits;
}

export function calcDamage(attack, defence) {
  return roundNumberWithFix(Math.max(attack - defence, attack * 0.1));
}