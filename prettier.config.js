/**
 * Prettier configuration
 * @type {import('prettier').Config}
 */
const config = {
  semi: false,
  tabWidth: 2,
  singleQuote: true,
  endOfLine: "auto",
  trailingComma: "none",
  arrowParens: "always",
  plugins: ["prettier-plugin-tailwindcss"],
};

module.exports = config;
