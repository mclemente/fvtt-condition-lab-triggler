import { EnhancedConditions } from "../enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "../sidekick.js";

/**
 * Handles triggers for other gadgets in the module... or does it?!
 */
export class Triggler {
	static OPERATORS = {
		eq: "=",
		ne: "≠",
		lt: "<",
		lteq: "≤",
		gt: ">",
		gteq: "≥"
	};

	/**
	 * Parses triggers JSON and returns triggers
	 * @param {{}} json
	 * @returns {Array}
	 */
	static triggersFromJson(json) {
		if (json.system !== game.system.id) {
			ui.notifications.warn(game.i18n.localize("CLT.ENHANCED_CONDITIONS.MapMismatch"));
		}
		const triggers = [];
		if (json.triggers) {
			for (const trigger of json.triggers) {
				const processedTrigger = Triggler._prepareTrigger(trigger);
				if (processedTrigger) {
					triggers.push(processedTrigger);
				}
			}
			return triggers;
		}
		return [];
	}

	/**
	 * Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible
	 * @param {*} trigger
	 * @returns {boolean | object}
	 */
	static _prepareTrigger(trigger) {
		const { triggerType = "simple", id = null } = trigger;

		// const triggerType = formData?.triggerType;

		if (triggerType === "advanced" && !trigger.advancedName.length) {
			console.warn(
				`CLT | Trigger with ID "${id} is defined as an Advanced Trigger but has no Trigger Name.`
			);
			return false;
		}

		const triggers = game.settings.get("condition-lab-triggler", "storedTriggers");
		const text = triggerType === "simple" ? Triggler._constructString(trigger) : trigger.advancedName;

		if (!text) return false;

		const existingTrigger = triggers.find((t) => t.id === id);
		if (existingTrigger) {
			console.warn(`CLT | Trigger with ID "${id} already exists.`);
			return false;
		}
		return {
			id,
			...duplicate(trigger),
			text
		};
	}

	/**
	 * Construct a string based on trigger parts
	 * @param {*} parts
	 * @returns {string}
	 */
	static _constructString(parts) {
		const triggerType = parts.triggerType;
		const operatorText = Triggler.OPERATORS[parts.operator];
		const advancedOperatorText = Triggler.OPERATORS[parts.advancedOperator];

		const pcOnly = parts.pcOnly ? " (PCs Only)" : "";
		const npcOnly = parts.npcOnly ? " (NPCs Only)" : "";
		const notZero = parts.notZero ? " (Not 0)" : "";
		if (triggerType === "simple") {
			const property2 = parts.property2 ? ` ${parts.category}.${parts.attribute}.${parts.property2}` : "";
			return `${parts.category}.${parts.attribute}.${parts.property1} ${operatorText} ${parts.value}${property2}${pcOnly}${npcOnly}${notZero}`;
		} else if (triggerType === "advanced") {
			const advancedProperty2 = parts.advancedProperty2 ? ` ${parts.advancedProperty2}` : "";
			return `${parts.advancedProperty} ${advancedOperatorText} ${parts.advancedValue}${advancedProperty2}${pcOnly}${npcOnly}${notZero}`;
		}
		return "";
	}

	/**
	 * Executes a trigger calling predefined actions
	 * @param {*} trigger
	 * @param {*} target
	 */
	static async _executeTrigger(trigger, target) {
		const actor =
			target instanceof Actor
				? target
				: target instanceof TokenDocument || target instanceof Token
					? target.actor
					: null;
		const token = target instanceof TokenDocument ? target : target instanceof Token ? target.document : null;
		const conditionMap = game.settings.get("condition-lab-triggler", "activeConditionMap");
		const matchedApplyConditions = conditionMap.filter((m) => m.applyTrigger === trigger.id);
		const matchedRemoveConditions = conditionMap.filter((m) => m.removeTrigger === trigger.id);
		const matchedMacros = game.macros.contents.filter(
			(m) => m.getFlag("condition-lab-triggler", "macroTrigger") === trigger.id
		);
		const applyConditionNames = matchedApplyConditions.map((c) => c.name);
		const removeConditionNames = matchedRemoveConditions.map((c) => c.name);

		if (applyConditionNames.length) {
			await EnhancedConditions.addCondition(applyConditionNames, target, { warn: false });
		}
		if (removeConditionNames.length) {
			await EnhancedConditions.removeCondition(removeConditionNames, target, { warn: false });
		}

		for (const macro of matchedMacros) {
			await macro.execute({ actor, token });
		}
	}

	/**
	 * Processes an entity update and evaluates triggers
	 * @param {*} entity
	 * @param {*} update
	 * @param {*} entryPoint1
	 */
	static async _processUpdate(entity, update, entryPoint1) {
		if (!entity || !update) return;

		const triggers = game.settings.get("condition-lab-triggler", "storedTriggers");
		const entityType =
			entity instanceof Actor
				? "Actor"
				: entity instanceof Token || entity instanceof TokenDocument
					? "Token"
					: null;

		if (!entityType) {
			return;
		}

		/**
		 * Avoid issues with Multi-Level Tokens by ignoring clone tokens
		 * @see Issue #491
		 */
		if (entity.flags && "multilevel-tokens" in entity.flags && "stoken" in entity.flags["multilevel-tokens"]) {
			return;
		}

		const hasPlayerOwner = !!(entity.hasPlayerOwner ?? entity.document?.hasPlayerOwner);

		/**
		 * process each trigger in turn, checking for a match in the update payload,
		 * if a match is found, then test the values using the appropriate operator,
		 * if values match, apply any mapped conditions
		 * @todo reduce this down to just mapped triggers at least
		 */
		for (let trigger of triggers) {
			const triggerType = trigger.triggerType || "simple";
			const pcOnly = trigger.pcOnly;
			const npcOnly = trigger.npcOnly;
			const notZero = trigger.notZero;

			if ((pcOnly && !hasPlayerOwner) || (npcOnly && hasPlayerOwner)) {
				continue;
			}

			let matchString1;
			let matchString2;

			if (triggerType === "simple") {
				const baseMatchString = `${entryPoint1}${entryPoint1 ? "." : ""}${trigger.category}${
					trigger.attribute ? `.${trigger.attribute}` : ""
				}`;
				// example : actorData.system.attributes.hp.value or actorData.data.status.isShaken
				matchString1 = `${baseMatchString}${trigger.property1 ? `.${trigger.property1}` : ""}`;

				// example: actor.system.hp.max -- note this is unlikely to be in the update data
				matchString2 = `${baseMatchString}${trigger.property2 ? `.${trigger.property2}` : ""}`;
			} else if (triggerType === "advanced") {
				// entry point differs based on actor vs token
				matchString1 = entityType === "Actor" ? trigger?.advancedActorProperty : trigger?.advancedTokenProperty;
				matchString2 =
					entityType === "Actor" ? trigger?.advancedActorProperty2 : trigger?.advancedTokenProperty2;
				trigger.value = trigger.advancedValue;
				trigger.operator = trigger.advancedOperator;
			}

			// If the update doesn't have a value that matches the 1st property this trigger should be skipped
			if (!foundry.utils.hasProperty(update, matchString1)) {
				continue;
			}

			// Get a value from the update that matches the 1st property in the trigger
			const updateValue = getProperty(update, matchString1);

			// If the trigger is not allowed to run when value is zero, skip
			if (updateValue === 0 && notZero) {
				continue;
			}

			// Get a value from the entity that matches the 2nd property in the trigger (if any)
			const property2Value = getProperty(entity, matchString2);

			// We need the type later
			const updateValueType = typeof updateValue;

			// example: "="
			const operator = Triggler.OPERATORS[trigger.operator];

			// percent requires whole different handling
			const isPercent = trigger.value.endsWith("%");

			// example: "50" -- check if the value can be converted to a number
			const triggerValue = isPercent
				? Number(trigger.value.replace("%", ""))
				: Sidekick.coerceType(trigger.value, updateValueType);

			const triggers = [];

			/**
			 * Switch on the operator checking it against the predefined operator choices
			 * If it matches, then compare the values using the operator
			 * @todo bulkify refactor this to add matched triggers to an array then execut the array at the end
			 */
			switch (operator) {
				case Triggler.OPERATORS.eq:
					if (isPercent) {
						// example: (50 / 100) = 0.5;
						const divisor = triggerValue / 100;
						// if property 1 update value = 50% of property 2 value
						if (updateValue === property2Value * divisor) {
							triggers.push({ trigger, entity });
						}
						break;
					}
					if (updateValue === triggerValue) {
						// execute the trigger's condition mappings
						triggers.push({ trigger, entity });
					}
					break;

				case Triggler.OPERATORS.gt:
					if (isPercent) {
						// example: (50 / 100) = 0.5;
						const divisor = triggerValue / 100;
						// if property 1 update value = 50% of property 2 value
						if (updateValue > property2Value * divisor) {
							triggers.push({ trigger, entity });
						}
						break;
					}
					if (updateValue > triggerValue) {
						triggers.push({ trigger, entity });
					}
					break;

				case Triggler.OPERATORS.gteq:
					if (isPercent) {
						// example: (50 / 100) = 0.5;
						const divisor = triggerValue / 100;
						// if property 1 update value = 50% of property 2 value
						if (updateValue >= property2Value * divisor) {
							triggers.push({ trigger, entity });
						}
						break;
					}
					if (updateValue >= triggerValue) {
						triggers.push({ trigger, entity });
					}
					break;

				case Triggler.OPERATORS.lt:
					if (isPercent) {
						// example: (50 / 100) = 0.5;
						const divisor = triggerValue / 100;
						// if property 1 update value = 50% of property 2 value
						if (updateValue < property2Value * divisor) {
							triggers.push({ trigger, entity });
						}
						break;
					}
					if (updateValue < triggerValue) {
						triggers.push({ trigger, entity });
					}
					break;

				case Triggler.OPERATORS.lteq:
					if (isPercent) {
						// example: (50 / 100) = 0.5;
						const divisor = triggerValue / 100;
						// if property 1 update value = 50% of property 2 value
						if (updateValue <= property2Value * divisor) {
							triggers.push({ trigger, entity });
						}
						break;
					}
					if (updateValue <= triggerValue) {
						triggers.push({ trigger, entity });
					}
					break;

				case Triggler.OPERATORS.ne:
					if (isPercent) {
						// example: (50 / 100) = 0.5;
						const divisor = triggerValue / 100;
						// if property 1 update value = 50% of property 2 value
						if (updateValue !== property2Value * divisor) {
							triggers.push({ trigger, entity });
						}
						break;
					}
					if (updateValue !== triggerValue) {
						triggers.push({ trigger, entity });
					}
					break;

				default:
					break;
			}

			for (const { trigger, entity } of triggers) {
				await Triggler._executeTrigger(trigger, entity);
			}
		}
	}

	/**
	 * Update Actor handler
	 * @param {*} actor
	 * @param {*} update
	 * @param {*} options
	 * @param {*} userId
	 */
	static _onUpdateActor(actor, update, options, userId) {
		if (game.userId === userId) Triggler._processUpdate(actor, update, "system");
	}

	/**
	 * Update token handler
	 * @param {Token} token
	 * @param {*} update
	 * @param {*} options
	 * @param {*} userId
	 */
	static _onUpdateToken(token, update, options, userId) {
		if (game.userId === userId) Triggler._processUpdate(token, update, "actorData.system");
	}
}
