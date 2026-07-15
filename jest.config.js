const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
};

// next/jest concatenates transformIgnorePatterns rather than overriding it,
// so its default blanket "/node_modules/" entry survives even if we add our
// own pattern — jose (pure ESM as of v6) would still get skipped and fail
// with "Unexpected token 'export'". Resolve next/jest's config first, then
// replace the array outright so only our jose-allowing pattern remains.
module.exports = async () => {
  const resolved = await createJestConfig(customJestConfig)();
  return {
    ...resolved,
    transformIgnorePatterns: ["/node_modules/(?!(jose)/)"],
  };
};
