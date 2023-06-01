/** Flags */
export const NAME = "condition-lab-triggler";

/** Message output */
export const TITLE = "Condition Lab & Triggler";

export const PATH = "modules/condition-lab-triggler";

export const WIKIPATH = "https://github.com/mclemente/condition-lab-triggler/wiki";

export const GADGETS = {
	enhancedConditions: {
		name: "Enhanced Conditions",
		info: "Provides the ability to map Conditions to Status Effect icons",
		wiki: `${WIKIPATH}/enhanced-conditions`,
	},
	triggler: {
		name: "Triggler",
		info: "A trigger-management system for token/actor attribute changes",
		wiki: `${WIKIPATH}/triggler`,
	},
	tokenUtility: {
		name: "Misc Token",
		info: "Miscellaneous Token enhancements",
		wiki: null,
	},
};
/**
 * Stores information about well known game systems. All other systems will resolve to "other"
 * Keys must match id
 */
export const KNOWN_GAME_SYSTEMS = {
	dnd5e: {
		id: "dnd5e",
		name: "Dungeons & Dragons 5th Edition",
		concentrationAttribute: "con",
		healthAttribute: "attributes.hp",
		initiative: "attributes.initiative",
	},
	pf1: {
		id: "pf1",
		name: "Pathfinder",
		concentrationAttribute: "",
		healthAttribute: "attributes.hp",
		initiative: "attributes.init.total",
	},
	pf2e: {
		id: "pf2e",
		name: "Pathfinder 2nd Edition",
		concentrationAttribute: "",
		healthAttribute: "attributes.hp",
		initiative: "attributes.perception",
	},
	wfrp4e: {
		id: "wfrp4e",
		name: "Warhammer Fantasy Roleplaying Game 4th Edition",
		concentrationAttribute: "",
		healthAttribute: "status.wounds",
		initiative: "characteristics.i",
	},
	archmage: {
		id: "archmage",
		name: "13th Age",
		concentrationAttribute: "",
		healthAttribute: "attributes.hp",
		initiative: "attributes.init.mod",
	},
	ironclaw2e: {
		id: "ironclaw2e",
		name: "Ironclaw Second Edition",
		concentrationAttribute: "",
		healthAttribute: "",
		initiative: "",
	},
	"cyberpunk-red-core": {
		id: "cyberpunk-red-core",
		name: "Cyberpunk Red Core",
	},
	other: {
		id: game.i18n.localize("CLT.GAME_SYSTEMS.other"),
		name: game.i18n.localize("CLT.GAME_SYSTEMS.custom"),
		concentrationAttribute: game.i18n.localize("CLT.GAME_SYSTEMS.unknown"),
		healthAttribute: game.i18n.localize("CLT.GAME_SYSTEMS.unknown"),
		initiative: game.i18n.localize("CLT.GAME_SYSTEMS.unknown"),
	},
};

export const DEFAULT_CONFIG = {
	enhancedConditions: {
		iconPath: `${PATH}/icons/`,
		conditionMapsPath: `${PATH}/condition-maps`,
		outputChat: false,
		outputCombat: false,
		removeDefaultEffects: false,
		conditionLab: {
			id: "cub-condition-lab",
			title: "Condition Lab",
		},
		macroConfig: {
			id: "cub-enhanced-condition-macro-config",
			title: "CUB Enhanced Condition - Macro Config",
		},
		triggerConfig: {
			id: "cub-enhanced-condition-trigger-config",
			title: "CUB Enhanced Condition - Trigger Config",
		},
		optionConfig: {
			id: "cub-enhanced-condition-option-config",
			title: "CUB Enhanced Condition - Option Config",
		},
		title: "Enhanced Conditions",
		mapTypes: {
			default: "System - Default",
			custom: "System - Custom",
			other: "Other/Imported",
		},
		referenceTypes: [
			{
				id: "journalEntry",
				name: "Journal",
				icon: `fas fa-book-open`,
			},
			{
				id: "compendium.journalEntry",
				name: "Journal (C)",
				icon: `fas fa-atlas`,
			},
			{
				id: "item",
				name: "Item",
				icon: `fas fa-suitcase`,
			},
			{
				id: "compendium.item",
				name: "Item (C)",
				icon: `fas fa-suitcase`,
			},
		],
		templates: {
			conditionLab: `${PATH}/templates/condition-lab.hbs`,
			chatOutput: `${PATH}/templates/chat-conditions.hbs`,
			chatConditionsPartial: `${PATH}/templates/partials/chat-card-condition-list.hbs`,
			importDialog: `${PATH}/templates/import-conditions.html`,
			macroConfig: `${PATH}/templates/enhanced-condition-macro-config.hbs`,
			triggerConfig: `${PATH}/templates/enhanced-condition-trigger-config.hbs`,
			optionConfig: `${PATH}/templates/enhanced-condition-option-config.hbs`,
		},
		migrationVersion: "",
		specialStatusEffects: {
			blinded: {
				optionProperty: "blindToken",
			},
			invisible: {
				optionProperty: "markInvisible",
			},
		},
	},
	tokenUtility: {
		autoRollHP: false,
		hideAutoRoll: false,
		effectSize: {
			xLarge: {
				multiplier: 5,
				divisor: 2,
			},
			large: {
				multiplier: 3.3,
				divisor: 3,
			},
			medium: {
				multiplier: 2.5,
				divisor: 4,
			},
			small: {
				multiplier: 2,
				divisor: 5,
			},
		},
		effectSizeChoices: {
			small: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.small"),
			medium: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.medium"),
			large: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.large"),
			xLarge: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.xLarge"),
		},
	},
	triggler: {
		flags: {
			macro: "macroTrigger",
		},
		operators: {
			eq: "=",
			lt: "<",
			ne: "!=",
			lteq: "<=",
			gt: ">",
			gteq: ">=",
		},
		options: {
			percent: "%",
		},
		templatePaths: {
			macroTriggerSelect: `${PATH}/templates/trigger-select.html`,
		},
	},
};

export const FLAGS = {
	enhancedConditions: {
		conditionId: "conditionId",
		overlay: "overlay",
	},
};

export const SETTING_KEYS = {
	migration: {
		hasRunMigration: "hasRunMigration",
	},
	enhancedConditions: {
		menu: "enchantedConditionsMenu",
		coreIcons: "coreStatusIcons",
		coreEffects: "coreStatusEffects",
		system: "activeSystem",
		map: "activeConditionMap",
		defaultMaps: "defaultConditionMaps",
		mapType: "conditionMapType",
		removeDefaultEffects: "removeDefaultEffects",
		outputChat: "conditionsOutputToChat",
		outputCombat: "conditionsOutputDuringCombat",
		migrationVersion: "enhancedConditionsMigrationVersion",
		showSortDirectionDialog: "showSortDirectionDialog",
		defaultSpecialStatusEffects: "defaultSpecialStatusEffects",
		specialStatusEffectMapping: "specialStatusEffectMapping",
	},
	tokenUtility: {
		effectSize: "effectSize",
	},
	triggler: {
		menu: "trigglerMenu",
		triggers: "storedTriggers",
	},
};
