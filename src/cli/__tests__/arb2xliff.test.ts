import fs from 'fs';
import path from 'path';
import tempDirectory from 'temp-dir';
import mockDateNow from '../../../tests/mockDateNow';
mockDateNow();

const onlySourceXliff = fs.readFileSync('src/cli/__tests__/only_source.xliff').toString();

describe('arb2xliff cli tool', () => {
    let exitSpy: jest.SpyInstance;
    let stdoutSpy: jest.SpyInstance;
    let logSpy: jest.SpyInstance;
    let helpSpy: jest.SpyInstance;

    beforeAll(() => {
        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('process.exit() was called');
        });
        stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
        logSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    beforeEach(() => {
        // Make require() call work in all tests
        jest.resetModules();

        exitSpy.mockClear();
        stdoutSpy.mockClear();
        logSpy.mockClear();

        const { Command } = require('commander');
        helpSpy = jest.spyOn(Command.prototype, 'outputHelp').mockImplementation();
    });


    test('missing args', () => {
        process.argv = ['node', 'arb2xliff.js'];
        expect(() => require('../arb2xliff')).toThrow('process.exit() was called');
        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(helpSpy).toHaveBeenCalled();
    });

    test('missing --sourcefile arg', () => {
        process.argv = [
            'node', 'arb2xliff.js',
            '--targetfile', 'foo',
        ];
        expect(() => require('../arb2xliff')).toThrow('process.exit() was called');
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(logSpy).toHaveBeenCalledWith("error: option '--sourcefile <filename>' is required");
        expect(helpSpy).not.toHaveBeenCalled();
    });

    test('with --sourcefile arg to stdout', () => {
        process.argv = [
            'node', 'arb2xliff.js',
             '--sourcefile', 'src/cli/__tests__/source.arb',
        ];
        expect(() => require('../arb2xliff')).not.toThrow();
        expect(exitSpy).not.toHaveBeenCalled();
        expect(stdoutSpy).toHaveBeenCalledWith(onlySourceXliff);
        expect(logSpy).not.toHaveBeenCalled();
        expect(helpSpy).not.toHaveBeenCalled();
    });

    test('with --sourcefile arg to file', () => {
        const outPath = path.join(tempDirectory, 'output.xliff');
        process.argv = [
            'node', 'arb2xliff.js',
            '--sourcefile', 'src/cli/__tests__/source.arb',
            '--out', outPath,
        ];
        expect(() => require('../arb2xliff')).not.toThrow();

        expect(exitSpy).not.toHaveBeenCalled();
        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
        expect(helpSpy).not.toHaveBeenCalled();
        expect(fs.readFileSync(outPath).toString()).toBe(onlySourceXliff);
    });

    test('with --sourcefile and --targetfile args', () => {
        process.argv = [
            'node', 'arb2xliff.js',
            '--sourcefile', 'src/cli/__tests__/source.arb',
            '--targetfile', 'src/cli/__tests__/target_de_DE.arb',
        ];
        expect(() => require('../arb2xliff')).not.toThrow();

        expect(exitSpy).not.toHaveBeenCalled();
        expect(stdoutSpy).toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
        expect(helpSpy).not.toHaveBeenCalled();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
});
