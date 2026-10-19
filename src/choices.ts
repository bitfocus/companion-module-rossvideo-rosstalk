import type { DropdownChoice } from '@companion-module/base'

const MES = [1, 2, 3, 4]
const KEYS_PER_ME = [1, 2, 3, 4]
const INPUTS = range(48)
const AUXES = range(24)
const MINI_MES = range(4)
const MEDIA_STORE_CHANNELS = range(4)
const CHROMA_KEYS = range(4)
const MULTISCREENS = range(2)
const SCENES = range(4)
const XPRESSION_CHANNELS = range(4)

function range(count: number): number[] {
	return Array.from({ length: count }, (_, i) => i + 1)
}

function choice(id: string, label: string): DropdownChoice<string> {
	return { id, label: `${label} (${id})` }
}

const keyChoices = MES.flatMap((me) => KEYS_PER_ME.map((key) => choice(`ME:${me}:KEY:${key}`, `ME ${me} Key ${key}`)))

export const VIDEO_DESTINATION_CHOICES: DropdownChoice<string>[] = [
	...MES.flatMap((me) => [choice(`ME:${me}:PGM`, `ME ${me} Program`), choice(`ME:${me}:PST`, `ME ${me} Preset`)]),
	...keyChoices,
	...AUXES.map((aux) => choice(`AUX:${aux}`, `Aux ${aux}`)),
	...MINI_MES.map((mme) => choice(`MME:${mme}`, `MiniME ${mme}`)),
]

export const VIDEO_SOURCE_CHOICES: DropdownChoice<string>[] = [
	choice('BK', 'Black'),
	choice('BG', 'Matte Color'),
	choice('PGM', 'Program'),
	choice('PV', 'Preview'),
	choice('CLN', 'Clean Feed'),
	choice('CLIP', 'Clip Player'),
	...INPUTS.map((input) => choice(`IN:${input}`, `Input ${input}`)),
	...AUXES.map((aux) => choice(`AUX:${aux}`, `Aux ${aux}`)),
	...MES.flatMap((me) => [
		choice(`ME:${me}:PGM`, `ME ${me} Program`),
		choice(`ME:${me}:PV`, `ME ${me} Preview`),
		choice(`ME:${me}:PST`, `ME ${me} Preset`),
		choice(`ME:${me}:CLN`, `ME ${me} Clean`),
		choice(`ME:${me}:BKGD`, `ME ${me} Background`),
		choice(`ME:${me}:MW`, `ME ${me} MediaWipe`),
		choice(`ME:${me}:MWA`, `ME ${me} MediaWipe Alpha`),
		...KEYS_PER_ME.flatMap((key) => [
			choice(`ME:${me}:KEY:${key}:V`, `ME ${me} Key ${key} Video`),
			choice(`ME:${me}:KEY:${key}:A`, `ME ${me} Key ${key} Alpha`),
		]),
	]),
	...MINI_MES.flatMap((mme) => [
		choice(`MME:${mme}:PGM`, `MiniME ${mme} Program`),
		choice(`MME:${mme}:PV`, `MiniME ${mme} Preview`),
		choice(`MME:${mme}:PST`, `MiniME ${mme} Preset`),
		choice(`MME:${mme}:BKGD`, `MiniME ${mme} Background`),
		choice(`MME:${mme}:CMB`, `MiniME ${mme} Combined Key`),
		...KEYS_PER_ME.flatMap((key) => [
			choice(`MME:${mme}:KEY:${key}:V`, `MiniME ${mme} Key ${key} Video`),
			choice(`MME:${mme}:KEY:${key}:A`, `MiniME ${mme} Key ${key} Alpha`),
		]),
	]),
	...MEDIA_STORE_CHANNELS.map((ms) => choice(`MS:${ms}`, `Media-Store ${ms}`)),
	...CHROMA_KEYS.map((ck) => choice(`CK:${ck}`, `Chroma Key ${ck} Video`)),
	...CHROMA_KEYS.map((ck) => choice(`CKA:${ck}`, `Chroma Key ${ck} Alpha`)),
	...SCENES.map((scene) => choice(`SNC:${scene}`, `UltraScene ${scene} Video`)),
	...SCENES.map((scene) => choice(`SNCA:${scene}`, `UltraScene ${scene} Alpha`)),
	// Graphite only
	...XPRESSION_CHANNELS.map((xp) => choice(`XP:${xp}:V`, `XPression ${xp} Video`)),
	...XPRESSION_CHANNELS.map((xp) => choice(`XP:${xp}:A`, `XPression ${xp} Alpha`)),
]

/** MLEs in the `ME:1` form used by Carbonite */
export const MLE_CHOICES: DropdownChoice<string>[] = [
	...MES.map((me) => choice(`ME:${me}`, `ME ${me}`)),
	choice('ME:P/P', 'ME P/P (Carbonite Ultra program ME)'),
	...MINI_MES.map((mme) => choice(`MME:${mme}`, `MiniME ${mme}`)),
	...MULTISCREENS.map((msc) => choice(`MSC:${msc}`, `MultiScreen ${msc}`)),
]

/** Acuity addresses MEs by number alone for transitions and keyers */
export const MLE_NUMBER_CHOICES: DropdownChoice<string>[] = MES.map((me) => choice(String(me), `ME ${me}`))

// Acuity accepts both ME and MLE, but Vision only accepts MLE, so MLE works for both
const ACUITY_AUX_BANKS = range(4)
const ACUITY_AUX_PER_BANK = range(8)
const ACUITY_PROGRAM_OUTPUTS = ['A', 'B', 'C', 'D', 'E', 'F']
const ACUITY_MULTIVIEWERS = range(2)
const ACUITY_GLOBAL_STORE_CHANNELS = range(4)
const ACUITY_ME_STORE_CHANNELS = range(2)

const acuityAuxChoices = ACUITY_AUX_BANKS.flatMap((bank) =>
	ACUITY_AUX_PER_BANK.map((aux) => choice(`AUX:${bank}:${aux}`, `Aux bank ${bank} aux ${aux}`)),
)
const acuityKeyChoices = MES.flatMap((me) =>
	KEYS_PER_ME.map((key) => choice(`MLE:${me}:KEY:${key}`, `ME ${me} Key ${key}`)),
)

export const ACUITY_VIDEO_DESTINATION_CHOICES: DropdownChoice<string>[] = [
	...MES.flatMap((me) => [choice(`MLE:${me}:PGM`, `ME ${me} Program`), choice(`MLE:${me}:PST`, `ME ${me} Preset`)]),
	...acuityKeyChoices,
	...MES.flatMap((me) =>
		KEYS_PER_ME.map((key) => choice(`MLE:${me}:KEY:${key}:KEYBUS:2`, `ME ${me} Key ${key} second channel`)),
	),
	...acuityAuxChoices,
]

export const ACUITY_VIDEO_SOURCE_CHOICES: DropdownChoice<string>[] = [
	choice('BK', 'Black'),
	...range(2).map((bg) => choice(`BG:${bg}`, `Matte Color ${bg}`)),
	...INPUTS.map((input) => choice(`IN:${input}`, `Input ${input}`)),
	...acuityAuxChoices,
	...MES.flatMap((me) => [
		choice(`MLE:${me}:PV`, `ME ${me} Preview`),
		choice(`MLE:${me}:PGM`, `ME ${me} Program A/B`),
		...ACUITY_PROGRAM_OUTPUTS.map((output) => choice(`MLE:${me}:PGM:${output}`, `ME ${me} Program ${output}`)),
		choice(`MLE:${me}:CLN:1`, `ME ${me} Clean 1`),
		choice(`MLE:${me}:CLN:2`, `ME ${me} Clean 2`),
	]),
	...acuityKeyChoices,
	...ACUITY_GLOBAL_STORE_CHANNELS.map((gs) => choice(`GS:${gs}`, `Global-Store ${gs}`)),
	...MES.flatMap((me) => ACUITY_ME_STORE_CHANNELS.map((ch) => choice(`MS:${me}:${ch}`, `ME ${me} ME-Store ${ch}`))),
	...ACUITY_MULTIVIEWERS.flatMap((mv) => [
		choice(`MVA:${mv}`, `MultiViewer ${mv} Head A`),
		choice(`MVB:${mv}`, `MultiViewer ${mv} Head B`),
	]),
]
