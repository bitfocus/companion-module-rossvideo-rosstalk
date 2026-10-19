import type {
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
	DropdownChoice,
} from '@companion-module/base'
import type {
	KeyTransitionDirection,
	KeyTransitionType,
	LoadLocation,
	OnOff,
	TransitionType,
	Ultra60Drive,
} from '../commands.js'

// Carbonite Ultra names its program ME `P/P`
export const RE_ME_SOURCE = '/^(ME|MME|MSC):([0-9]{1,2}|P\\/P)$/'

export function numberField<TKey extends string>(
	id: TKey,
	label: string,
	defaultValue: number,
	min: number,
): CompanionInputFieldNumber<TKey> {
	return { type: 'number', id, label, default: defaultValue, min, max: 9999, asInteger: true }
}

export function textField<TKey extends string>(
	id: TKey,
	label: string,
	defaultValue: string,
	extra: Partial<CompanionInputFieldTextInput<TKey>>,
): CompanionInputFieldTextInput<TKey> {
	return { type: 'textinput', id, label, default: defaultValue, useVariables: true, ...extra }
}

/** Common values to pick from; anything else can still be typed in, as not every frame has the same resources */
export function videoField<TKey extends string>(
	id: TKey,
	label: string,
	defaultValue: string,
	choices: DropdownChoice<string>[],
): CompanionInputFieldDropdown<TKey, string> {
	return { type: 'dropdown', id, label, default: defaultValue, choices, allowCustom: true }
}

export function mleField(
	choices: DropdownChoice<string>[],
	regex: string | undefined,
): CompanionInputFieldDropdown<'mle', string> {
	return { ...videoField('mle', 'MLE', String(choices[0].id), choices), regex }
}

export function dropdownField<TKey extends string, TChoice extends string>(
	id: TKey,
	label: string,
	defaultValue: TChoice,
	choices: DropdownChoice<TChoice>[],
): CompanionInputFieldDropdown<TKey, TChoice> {
	return { type: 'dropdown', id, label, default: defaultValue, choices, disableAutoExpression: true }
}

/**
 * A dropdown whose value buttons may want to change at runtime, so it can be switched to an expression.
 * Companion skips the action if the expression's result isn't one of the choices.
 */
export function expressionDropdownField<TKey extends string, TChoice extends string>(
	id: TKey,
	label: string,
	defaultValue: TChoice,
	choices: DropdownChoice<TChoice>[],
): CompanionInputFieldDropdown<TKey, TChoice> {
	return { type: 'dropdown', id, label, default: defaultValue, choices }
}

export function onOffField<TKey extends string>(id: TKey, label: string): CompanionInputFieldDropdown<TKey, OnOff> {
	return expressionDropdownField<TKey, OnOff>(id, label, 'ON', [
		{ id: 'ON', label: 'On' },
		{ id: 'OFF', label: 'Off' },
	])
}

export const ULTRA_60_DRIVES: DropdownChoice<Ultra60Drive>[] = [
	{ id: '0', label: 'Internal (0)' },
	{ id: '1', label: 'USB 1' },
	{ id: '2', label: 'USB 2' },
	{ id: '3', label: 'USB 3' },
]

export const ACUITY_LOCATIONS: DropdownChoice<LoadLocation>[] = [
	{ id: 'USB', label: 'USB' },
	{ id: 'HD', label: 'HD' },
]

export const TRANSITION_TYPES: DropdownChoice<TransitionType>[] = [
	{ id: 'DISS', label: 'Dissolve' },
	{ id: 'DVE', label: 'DVE' },
	{ id: 'MEDIA', label: 'Media Wipe' },
	{ id: 'WIPE', label: 'Wipe' },
]

export const transitionTypeField = expressionDropdownField<'transT', KeyTransitionType>(
	'transT',
	'Transition type',
	'CUT',
	[
		{ id: 'AUTO', label: 'Auto Transition' },
		{ id: 'CUT', label: 'Cut Transition' },
	],
)

export const transitionDirectionField = expressionDropdownField<'transD', KeyTransitionDirection>(
	'transD',
	'Transition On/Off Air',
	'TOGGLE',
	[
		{ id: 'TOGGLE', label: 'Toggle Keyer' },
		{ id: 'ON', label: 'Transition OnAir' },
		{ id: 'OFF', label: 'Transition OffAir' },
	],
)
