import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

export class Butler {
	/** Flags */
	static NAME = "condition-lab-triggler";
	/** Message output */
	static TITLE = "Condition Lab & Triggler";

	static PATH = "modules/condition-lab-triggler";

	/**
	 * Stores information about well known game systems. All other systems will resolve to "other"
	 * Keys must match id
	 */
	static get KNOWN_GAME_SYSTEMS() {
		return {
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
	}

	static get DEFAULT_CONFIG() {
		return {
			enhancedConditions: {
				iconPath: `${this.PATH}/icons/`,
				conditionMapsPath: `${this.PATH}/condition-maps`,
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
					conditionLab: `${this.PATH}/templates/condition-lab.hbs`,
					chatOutput: `${this.PATH}/templates/chat-conditions.hbs`,
					chatConditionsPartial: `${this.PATH}/templates/partials/chat-card-condition-list.hbs`,
					importDialog: `${this.PATH}/templates/import-conditions.html`,
					macroConfig: `${this.PATH}/templates/enhanced-condition-macro-config.hbs`,
					triggerConfig: `${this.PATH}/templates/enhanced-condition-trigger-config.hbs`,
					optionConfig: `${this.PATH}/templates/enhanced-condition-option-config.hbs`,
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
					macroTriggerSelect: `${this.PATH}/templates/trigger-select.html`,
				},
			},
		};
	}

	static FLAGS = {
		enhancedConditions: {
			conditionId: "conditionId",
			overlay: "overlay",
		},
	};

	static SETTING_KEYS = {
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

	// Instantiate gadget classes
	enhancedConditions = new EnhancedConditions();

	// Expose API methods
	getCondition = EnhancedConditions.getCondition;
	getConditions = EnhancedConditions.getConditions;
	getConditionEffects = EnhancedConditions.getConditionEffects;
	hasCondition = EnhancedConditions.hasCondition;
	applyCondition = EnhancedConditions.applyCondition;
	addCondition = EnhancedConditions.addCondition;
	removeCondition = EnhancedConditions.removeCondition;
	removeAllConditions = EnhancedConditions.removeAllConditions;
}
