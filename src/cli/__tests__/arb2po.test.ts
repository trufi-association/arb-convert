/* eslint-disable global-require */
import fs from 'fs';
import path from 'path';
import tempDirectory from 'temp-dir';

mockDateNow();

const onlySourcePo = fs.readFileSync('src/cli/__tests__/only_source.po').toString();
const withTargetPo = fs.readFileSync('src/cli/__tests__/with_target.po').toString();
const withMismatchTargetPo = fs.readFileSync('src/cli/__tests__/with_mismatch_target.po').toString();

describe('arb2po cli tool', () => {
  let exitSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;
  let helpSpy: jest.SpyInstance;

  beforeAll(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit() was called');
    });
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
  });

  beforeEach(() => {
    // Make require() call work in all tests
    jest.resetModules();

    exitSpy.mockClear();
    stdoutSpy.mockClear();

    const { Command } = require('commander');
    helpSpy = jest.spyOn(Command.prototype, 'outputHelp').mockImplementation();
  });

  test('missing args', () => {
    process.argv = ['node', 'arb2po.js'];
    expect(() => require('../arb2po')).toThrow('process.exit() was called');
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(helpSpy).toHaveBeenCalled();
  });

  test('missing --sourcefile arg', () => {
    process.argv = [
      'node', 'arb2po.js',
      '--targetfile', 'foo',
    ];
    expect(() => require('../arb2po')).toThrow('process.exit() was called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(stdoutSpy).toHaveBeenCalledWith("error: option '--sourcefile <filename>' is required");
    expect(helpSpy).not.toHaveBeenCalled();
  });

  test('with --sourcefile arg to stdout', () => {
    process.argv = [
      'node', 'arb2po.js',
      '--sourcefile', 'src/cli/__tests__/source.arb',
    ];
    expect(() => require('../arb2po')).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith(onlySourcePo);
    expect(helpSpy).not.toHaveBeenCalled();
  });

  test('with --sourcefile arg to file', () => {
    const outPath = path.join(tempDirectory, 'output.po');
    process.argv = [
      'node', 'arb2po.js',
      '--sourcefile', 'src/cli/__tests__/source.arb',
      '--out', outPath,
    ];
    expect(() => require('../arb2po')).not.toThrow();

    expect(exitSpy).not.toHaveBeenCalled();
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(helpSpy).not.toHaveBeenCalled();
    expect(fs.readFileSync(outPath).toString()).toBe(onlySourcePo);
  });

  test('with --sourcefile and --targetfile args', () => {
    process.argv = [
      'node', 'arb2po.js',
      '--sourcefile', 'src/cli/__tests__/source.arb',
      '--targetfile', 'src/cli/__tests__/target_de_DE.arb',
    ];
    expect(() => require('../arb2po')).not.toThrow();

    expect(exitSpy).not.toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith(withTargetPo);
    expect(helpSpy).not.toHaveBeenCalled();
  });

  test('with --sourcefile and --targetfile args and mismatch of keys', () => {
    process.argv = [
      'node', 'arb2po.js',
      '--sourcefile', 'src/cli/__tests__/source.arb',
      '--targetfile', 'src/cli/__tests__/target_mismatch_de_DE.arb',
    ];
    expect(() => require('../arb2po')).not.toThrow();

    expect(exitSpy).not.toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith(withMismatchTargetPo);
    expect(helpSpy).not.toHaveBeenCalled();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
