const themeDir = __dirname + "/../../";

module.exports = {
  purge: {
    enabled: process.env.HUGO_ENVIRONMENT === "production",
    content: [
      themeDir + "layouts/**/*.html",
      themeDir + "content/**/*.html",
      "layouts/**/*.html",
      "config.toml",
      "content/**/*.html",
      "assets/js/search.js",
      "exampleSite/layouts/**/*.html",
      "exampleSite/config.toml",
      "exampleSite/content/**/*.html",
    ],
  },
  darkMode: "class",
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: [
            {
              'code::before': {
                content: '""',
              },
              'code::after': {
                content: '""',
              },
            }
          ]
        },
        dark: {
          css: [
            {
              color: theme("colors.zinc.600"),
              '[class~="lead"]': {
                color: theme("colors.gray.300"),
              },
              a: {
                color: theme("colors.yellow.50"),
              },
              strong: {
                color: theme("colors.lime.400"),
              },
              "ol > li::before": {
                color: theme("colors.zinc.800"),
              },
              "ul > li::before": {
                backgroundColor: theme("colors.zinc.900"),
              },
              hr: {
                borderColor: theme("colors.gray.200"),
              },
              blockquote: {
                color: theme("colors.gray.200"),
                borderLeftColor: theme("colors.lime.800"),
              },
              h1: {
                color: theme("colors.yellow.300"),
              },
              h2: {
                color: theme("colors.yellow.400"),
              },
              h3: {
                color: theme("colors.lime.500"),
              },
              h4: {
                color: theme("colors.lime.50"),
              },
              "figure figcaption": {
                color: theme("colors.yellow.200"),
              },
              code: {
                color: theme("colors.emerald.300"),
              },
              "a code": {
                color: theme("colors.lime.50"),
              },
              'code::before': {
                content: '""',
              },
              'code::after': {
                content: '""',
              },
              pre: {
                color: theme("colors.yellow.400"),
                backgroundColor: theme("colors.zinc.800"),
              },
              thead: {
                color: theme("colors.white"),
                borderBottomColor: theme("colors.yellow.400"),
              },
              "tbody tr": {
                borderBottomColor: theme("colors.zinc.800"),
              },
            },
          ],
        },
      }),
    },
  },
  variants: {
    extend: {
      typography: ["dark"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
