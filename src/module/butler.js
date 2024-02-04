import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

export class Butler {
	static get DEFAULT_CONFIG() {
		return {
			enhancedConditions: {
				mapTypes: {
					default: game.i18n.localize("CLT.SETTINGS.EnhancedConditions.MapType.Choices.default"),
					custom: game.i18n.localize("CLT.SETTINGS.EnhancedConditions.MapType.Choices.custom"),
					other: game.i18n.localize("CLT.SETTINGS.EnhancedConditions.MapType.Choices.other")
				},
				specialStatusEffects: {
					blinded: {
						optionProperty: "blindToken"
					},
					invisible: {
						optionProperty: "markInvisible"
					}
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
					triggerForm: "modules/condition-lab-triggler/templates/triggler-form.html",
					macroTriggerSelect: "modules/condition-lab-triggler/templates/trigger-select.html"
				}
			}
		};
	}

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
