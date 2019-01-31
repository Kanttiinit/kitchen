require('dotenv').config({ path: __dirname + '/.env' });

jest.mock('telegraf', () => ({
  default: class {
    constructor() {
      this.on = jest.fn((action, fn) => {
        this.on_callback = fn;
      });
      this.startPolling = jest.fn();
    }
  }
}));

jest.mock(
  'telegraf/telegram',
  () =>
    class {
      constructor() {
        this.sendMessage = jest.fn().mockResolvedValue();
      }
    }
);
