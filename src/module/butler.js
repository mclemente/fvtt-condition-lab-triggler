import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

export class Butler {
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
