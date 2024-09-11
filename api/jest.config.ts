export default {
    roots: ['<rootDir>/src/tests'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    verbose: true,
    moduleDirectories: ['node_modules', '<rootDir>/src'],
};
