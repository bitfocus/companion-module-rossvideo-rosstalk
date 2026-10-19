import {
	FixupNumericOrVariablesValueToExpressions,
	type CompanionStaticUpgradeResult,
	type CompanionStaticUpgradeScript,
	type ExpressionOrValue,
	type JsonValue,
} from '@companion-module/base'
import { DEFAULT_PORT, type ModuleConfig } from './config.js'

type UpgradeResult = CompanionStaticUpgradeResult<ModuleConfig, undefined>

function emptyResult(): UpgradeResult {
	return { updatedConfig: null, updatedSecrets: null, updatedActions: [], updatedFeedbacks: [] }
}

const legacyUpgrade: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const result = emptyResult()

	for (const action of props.actions) {
		const mle = action.options.mle
		if (action.actionId !== 'transKey' || !mle || mle.isExpression) continue
		if (typeof mle.value === 'string' || typeof mle.value === 'number') {
			mle.value = `ME:${mle.value}`
			result.updatedActions.push(action)
		}
	}

	return result
}

const NUMERIC_ACTION_OPTIONS: Record<string, string[]> = {
	gpi: ['gpi'],
	cc: ['bank', 'cc'],
	transKey: ['key'],
	SEQI: ['takeID', 'Layer'],
	SEQO: ['takeID'],
	MVBOX: ['mvID', 'boxID'],
	TIMER: ['timerID'],
}

/** Text inputs which only ever held numbers became number fields */
export const numericFieldsUpgrade: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const result = emptyResult()

	for (const action of props.actions) {
		const keys = NUMERIC_ACTION_OPTIONS[action.actionId]
		if (!keys) continue

		for (const key of keys) {
			action.options[key] = FixupNumericOrVariablesValueToExpressions(action.options[key])
		}
		result.updatedActions.push(action)
	}

	if (props.config) {
		const port: unknown = props.config.port
		if (typeof port !== 'number') {
			result.updatedConfig = { ...props.config, port: Number(port) || DEFAULT_PORT }
		}
	}

	return result
}

const VARIABLE_TEXT_TO_DROPDOWN_OPTIONS: Record<string, string[]> = {
	xpt: ['vidDest', 'vidSource'],
	MVBOX: ['vidSource'],
	cut: ['mle'],
	autotrans: ['mle'],
	transKey: ['mle'],
}

/** Dropdowns don't parse variables, so values which used them become expressions */
export function fixupVariablesToExpression(
	value: ExpressionOrValue<JsonValue | undefined> | undefined,
): ExpressionOrValue<JsonValue | undefined> | undefined {
	// A value with a variable can never be numeric, so the helper won't turn it into a number
	if (!value || value.isExpression || typeof value.value !== 'string' || !value.value.includes('$(')) return value
	return FixupNumericOrVariablesValueToExpressions(value)
}

export const textToDropdownsUpgrade: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const result = emptyResult()

	for (const action of props.actions) {
		const keys = VARIABLE_TEXT_TO_DROPDOWN_OPTIONS[action.actionId]
		if (!keys) continue

		for (const key of keys) {
			action.options[key] = fixupVariablesToExpression(action.options[key])
		}
		// MVBOX was sent without the MultiViewer type, which the switcher requires
		if (action.actionId === 'MVBOX' && !action.options.mvType) {
			action.options.mvType = { isExpression: false, value: 'VP' }
		}
		result.updatedActions.push(action)
	}

	return result
}

/**
 * Acuity keyer commands take a bare ME number (KEYAUTO 1:4), but the legacy upgrade prefixed every keyer MLE with ME:.
 * Imported buttons are upgraded without a config, so then only Acuity and openGear keyers lack a transition direction
 * (openGear ignores the MLE).
 */
export const acuityKeyerMleUpgrade: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const result = emptyResult()
	if (props.config && props.config.model !== 'acuity') return result

	for (const action of props.actions) {
		const mle = action.options.mle
		if (action.actionId !== 'transKey' || !mle || mle.isExpression || typeof mle.value !== 'string') continue
		if (!props.config && action.options.transD) continue

		const match = /^(?:ME|MLE):(\d+|\$\([^()]+\))$/.exec(mle.value.trim())
		if (match) {
			mle.value = match[1]
			result.updatedActions.push(action)
		}
	}

	return result
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	legacyUpgrade,
	numericFieldsUpgrade,
	// Before the dropdown upgrade, while a variable MLE is still plain text it can strip the prefix from
	acuityKeyerMleUpgrade,
	textToDropdownsUpgrade,
]
