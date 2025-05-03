import logger, { LogLevel } from '../logger';

describe('Logger Service', () => {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;
  const originalConsoleDebug = console.debug;
  
  // Mock console methods
  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
  });
  
  // Restore original console methods
  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
    console.debug = originalConsoleDebug;
  });

  test('logger.error logs error messages', () => {
    const message = 'This is an error message';
    logger.error(message);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] This is an error message'),
      ''
    );
  });

  test('logger.warn logs warning messages', () => {
    const message = 'This is a warning message';
    logger.warn(message);
    
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN] This is a warning message'),
      ''
    );
  });

  test('logger.info logs info messages', () => {
    const message = 'This is an info message';
    logger.info(message);
    
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] This is an info message'),
      ''
    );
  });

  test('logger.debug logs debug messages', () => {
    const message = 'This is a debug message';
    logger.debug(message);
    
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] This is a debug message'),
      ''
    );
  });

  test('logger includes additional data', () => {
    const data = { userId: 123, action: 'login' };
    logger.error('User action', data);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] User action'),
      data
    );
  });

  test('logs include timestamps', () => {
    logger.info('Test message');
    
    // ISO timestamp format: YYYY-MM-DDTHH:mm:ss.sssZ
    const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
    
    expect(console.info).toHaveBeenCalledWith(
      expect.stringMatching(timestampRegex),
      ''
    );
  });

  test('logs are correctly formatted', () => {
    const message = 'Test log format';
    logger.error(message);
    
    const mockCall = (console.error as jest.Mock).mock.calls[0][0];
    const parts = mockCall.split(' ');
    
    // Format should be: "timestamp [LEVEL] message"
    expect(parts.length).toBeGreaterThanOrEqual(3);
    expect(parts[1]).toBe('[ERROR]');
    expect(parts.slice(2).join(' ')).toBe(message);
  });
}); 