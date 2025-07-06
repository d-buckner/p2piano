import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';


describe('Logger', () => {
  beforeEach(() => {
    // Clear modules to get fresh Logger instance
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock window object
    vi.stubGlobal('window', {
      location: { search: '' },
      LOG_LEVEL: undefined,
    });
    vi.stubGlobal('location', { search: '' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should respect DEBUG level from window.LOG_LEVEL', async () => {
    vi.stubGlobal('window', {
      location: { search: '' },
      LOG_LEVEL: 'debug',
    });
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
    vi.stubGlobal('location', { search: '?log=info' });
    vi.stubGlobal('window', {
      location: { search: '?log=info' },
      LOG_LEVEL: undefined,
    });
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
    vi.stubGlobal('window', {
      location: { search: '' },
      LOG_LEVEL: 'none',
    });
    const Logger = (await import('./Logger')).default;
    
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    Logger.ERROR('test');
    
    expect(errorSpy).not.toHaveBeenCalled();
    
    errorSpy.mockRestore();
  });

  it('should prioritize URL parameter over window.LOG_LEVEL', async () => {
    vi.stubGlobal('location', { search: '?log=error' });
    vi.stubGlobal('window', {
      location: { search: '?log=error' },
      LOG_LEVEL: 'debug',
    });
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
