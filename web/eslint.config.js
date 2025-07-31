import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import baseConfig from "../eslint.config.js";

export default tseslint.config(...baseConfig, {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
    },
    extends: [
        reactHooks.configs["recommended-latest"],
        reactRefresh.configs.vite,
    ],
    plugins: {
        "react-refresh": reactRefresh,
    },
    rules: {
        // React-specific rules
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",

        // Override base rules for React components
        "no-console": "off", // Allow console in frontend for debugging
    },
});
