import fs from 'fs';
import path from 'path';
import tempDirectory from 'temp-dir';

mockDateNow();

const sourceArb = fs.readFileSync('src/cli/__tests__/source.arb').toString();
const targetArb = fs.readFileSync('src/cli/__tests__/target_output.arb').toString();

describe('xliff2arb cli tool', () => {
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
        process.argv = ['node', 'xliff2arb.js'];
        expect(() => require('../xliff2arb')).toThrow('process.exit() was called');
        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(helpSpy).toHaveBeenCalled();
    });

    test('missing --file arg', () => {
        process.argv = [
            'node', 'xliff2arb.js',
            '--sourceout', 'foo',
        ];
        expect(() => require('../xliff2arb')).toThrow('process.exit() was called');
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(logSpy).toHaveBeenCalledWith("error: option '--file <filename>' is required");
        expect(helpSpy).not.toHaveBeenCalled();
    });

    test('with --file arg to stdout', () => {
        process.argv = [
            'node', 'xliff2arb.js',
             '--file', 'src/cli/__tests__/only_source.xliff',
        ];
        expect(() => require('../xliff2arb')).not.toThrow();
        expect(exitSpy).not.toHaveBeenCalled();
        expect(stdoutSpy).toHaveBeenCalledWith(sourceArb);
        expect(logSpy).not.toHaveBeenCalled();
        expect(helpSpy).not.toHaveBeenCalled();
    });

    test('with --file arg to file', () => {
        const sourceOutPath = path.join(tempDirectory, 'output.arb');
        process.argv = [
            'node', 'xliff2arb.js',
            '--file', 'src/cli/__tests__/only_source.xliff',
            '--sourceout', sourceOutPath,
        ];
        expect(() => require('../xliff2arb')).not.toThrow();

        expect(exitSpy).not.toHaveBeenCalled();
        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
        expect(helpSpy).not.toHaveBeenCalled();
        expect(fs.readFileSync(sourceOutPath).toString()).toBe(sourceArb);
    });

    test('with --sourceout and --targetout args', () => {
        const sourceOutPath = path.join(tempDirectory, 'output_source.arb');
        const targetOutPath = path.join(tempDirectory, 'output_target.arb');
        process.argv = [
            'node', 'xliff2arb.js',
            '--file', 'src/cli/__tests__/with_target.xliff',
            '--sourceout', sourceOutPath,
            '--targetout', targetOutPath,
        ];
        expect(() => require('../xliff2arb')).not.toThrow();

        expect(exitSpy).not.toHaveBeenCalled();
        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
        expect(helpSpy).not.toHaveBeenCalled();
        expect(fs.readFileSync(sourceOutPath).toString()).toBe(sourceArb);
        expect(fs.readFileSync(targetOutPath).toString()).toBe(targetArb);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
});
