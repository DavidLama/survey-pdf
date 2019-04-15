module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json"
    }
  },
  roots: ["tests"],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest"
  },
  moduleNameMapper: {
    "\\.(scss|html)$": "<rootDir>/tests/empty-module.js"
  },
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(ts|tsx)?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
