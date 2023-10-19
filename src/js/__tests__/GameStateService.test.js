import GameStateService from '../GameStateService';
import mockStorage from '../mocks/storage.json';

const stateService = new GameStateService(global.localStorage);

describe('Инициализация страницы', () => {
  it('Удачная выгрузка локального хранилища', async () => {
    stateService.save(mockStorage);
    const state = await stateService.load();
    expect(state).toEqual(mockStorage);
  });

  it('Ошибка при выгрузке локального хранилища', () => {
    stateService.save(undefined);
    expect(() => stateService.load()).toThrow('Invalid state');
  });
});
