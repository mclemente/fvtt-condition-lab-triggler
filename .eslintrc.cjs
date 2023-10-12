module.exports = {
	parserOptions: {
		ecmaVersion: 13,
		extraFileExtensions: [".cjs", ".mjs"],
		sourceType: "module",
	},

	env: {
		browser: true,
		es6: true,
		jquery: true,
	},

	extends: ["eslint:recommended", "@typhonjs-fvtt/eslint-config-foundry.js/0.8.0", "plugin:prettier/recommended"],

	plugins: [],

	rules: {
		"no-unused-vars": "warn",
		// Specify any specific ESLint rules.
		"prettier/prettier": [
			"error",
			{
				endOfLine: "auto",
			},
		],
	},

	globals: {
		globalThis: false,
	},

	overrides: [
		{
			files: ["./*.js", "./*.cjs", "./*.mjs"],
			env: {
				node: true,
			},
		},
	],
};
