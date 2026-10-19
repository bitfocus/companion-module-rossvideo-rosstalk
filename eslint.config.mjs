import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const baseConfig = await generateEslintConfig({
	enableTypescript: true,
})

export default [
	...baseConfig,
	{
		files: ['src/**/*.test.ts'],
		rules: {
			'n/no-unpublished-import': 'off',
		},
	},
]
