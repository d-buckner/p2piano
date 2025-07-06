import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock window object
const mockWindow = {
  location: { search: '' },
  LOG_LEVEL: undefined,
};

vi.stubGlobal('window', mockWindow);
vi.stubGlobal('location', mockWindow.location);

describe('Logger', () => {
  beforeEach(() => {
    // Clear modules to get fresh Logger instance
    vi.resetModules();
    mockWindow.location.search = '';
    mockWindow.LOG_LEVEL = undefined;
  });

  it('should respect DEBUG level from window.LOG_LEVEL', async () => {
    mockWindow.LOG_LEVEL = 'debug';
    const Logger = (await import('./Logger')).default;
    
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    
    Logger.DEBUG('test');
    Logger.INFO('test');
    
    expect(debugSpy).toHaveBeenCalledWith('test');
    expect(infoSpy).toHaveBeenCalledWith('test');
    
    debugSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('should respect INFO level from URL parameter', async () => {
    mockWindow.location.search = '?log=info';
    const Logger = (await import('./Logger')).default;
    
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    
    Logger.DEBUG('test');
    Logger.INFO('test');
    
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith('test');
    
    debugSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('should respect NONE level to disable all logging', async () => {
    mockWindow.LOG_LEVEL = 'none';
    const Logger = (await import('./Logger')).default;
    
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    Logger.ERROR('test');
    
    expect(errorSpy).not.toHaveBeenCalled();
    
    errorSpy.mockRestore();
  });

  it('should prioritize URL parameter over window.LOG_LEVEL', async () => {
    mockWindow.LOG_LEVEL = 'debug';
    mockWindow.location.search = '?log=error';
    const Logger = (await import('./Logger')).default;
    
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    Logger.DEBUG('test');
    Logger.ERROR('test');
    
    expect(debugSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('test');
    
    debugSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
