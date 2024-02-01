import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

export class Butler {
	/** Flags */
	static NAME = "condition-lab-triggler";

	/** Message output */
	static TITLE = "Condition Lab & Triggler";

	static PATH = `modules/${this.NAME}`;

	static get DEFAULT_CONFIG() {
		return {
			enhancedConditions: {
				iconPath: `${this.PATH}/icons/`,
				conditionMapsPath: `${this.PATH}/condition-maps`,
				outputChat: false,
				outputCombat: false,
				removeDefaultEffects: false,
				mapTypes: {
					default: game.i18n.localize("CLT.SETTINGS.EnhancedConditions.MapType.Choices.default"),
					custom: game.i18n.localize("CLT.SETTINGS.EnhancedConditions.MapType.Choices.custom"),
					other: game.i18n.localize("CLT.SETTINGS.EnhancedConditions.MapType.Choices.other")
				},
				referenceTypes: [
					{
						id: "journalEntry",
						name: "Journal",
						icon: "fas fa-book-open"
					},
					{
						id: "compendium.journalEntry",
						name: "Journal (C)",
						icon: "fas fa-atlas"
					},
					{
						id: "item",
						name: "Item",
						icon: "fas fa-suitcase"
					},
					{
						id: "compendium.item",
						name: "Item (C)",
						icon: "fas fa-suitcase"
					}
				],
				templates: {
					conditionLab: `${this.PATH}/templates/condition-lab.hbs`,
					chatOutput: `${this.PATH}/templates/chat-conditions.hbs`,
					chatConditionsPartial: `${this.PATH}/templates/partials/chat-card-condition-list.hbs`,
					importDialog: `${this.PATH}/templates/import-conditions.html`,
					macroConfig: `${this.PATH}/templates/enhanced-condition-macro-config.hbs`,
					triggerConfig: `${this.PATH}/templates/enhanced-condition-trigger-config.hbs`,
					optionConfig: `${this.PATH}/templates/enhanced-condition-option-config.hbs`
				},
				migrationVersion: "",
				specialStatusEffects: {
					blinded: {
						optionProperty: "blindToken"
					},
					invisible: {
						optionProperty: "markInvisible"
					}
				}
			},
			tokenUtility: {
				autoRollHP: false,
				hideAutoRoll: false,
				effectSize: {
					xLarge: {
						multiplier: 5,
						divisor: 2
					},
					large: {
						multiplier: 3.3,
						divisor: 3
					},
					medium: {
						multiplier: 2.5,
						divisor: 4
					},
					small: {
						multiplier: 2,
						divisor: 5
					}
				},
				effectSizeChoices: {
					small: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.small"),
					medium: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.medium"),
					large: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.large"),
					xLarge: game.i18n.localize("CLT.SETTINGS.TokenUtility.TokenEffectSize.choices.xLarge")
				}
			},
			triggler: {
				flags: {
					macro: "macroTrigger"
				},
				operators: {
					eq: "=",
					ne: "≠",
					lt: "<",
					lteq: "≤",
					gt: ">",
					gteq: "≥"
				},
				options: {
					percent: "%"
				},
				templates: {
					triggerForm: `${this.PATH}/templates/triggler-form.html`,
					macroTriggerSelect: `${this.PATH}/templates/trigger-select.html`
				}
			}
		};
	}

	static FLAGS = {
		enhancedConditions: {
			conditionId: "conditionId",
			overlay: "overlay"
		}
	};

	static SETTING_KEYS = {
		migration: {
			hasRunMigration: "hasRunMigration"
		},
		enhancedConditions: {
			menu: "enchantedConditionsMenu",
			coreIcons: "coreStatusIcons",
			coreEffects: "coreStatusEffects",
			map: "activeConditionMap",
			defaultMaps: "defaultConditionMaps",
			mapType: "conditionMapType",
			removeDefaultEffects: "removeDefaultEffects",
			outputChat: "conditionsOutputToChat",
			outputCombat: "conditionsOutputDuringCombat",
			migrationVersion: "enhancedConditionsMigrationVersion",
			showSortDirectionDialog: "showSortDirectionDialog",
			defaultSpecialStatusEffects: "defaultSpecialStatusEffects",
			specialStatusEffectMapping: "specialStatusEffectMapping"
		},
		tokenUtility: {
			effectSize: "effectSize"
		},
		triggler: {
			menu: "trigglerMenu",
			triggers: "storedTriggers"
		},
		sceneControls: "sceneControls"
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
