import { ConditionLab } from "./enhanced-conditions/condition-lab.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { Triggler } from "./triggler/triggler.js";

export class Butler {
	conditionLab = ConditionLab;

	triggler = Triggler;

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
