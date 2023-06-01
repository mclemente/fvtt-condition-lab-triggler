import { Butler as BUTLER } from "../butler.js";
import { Sidekick } from "../sidekick.js";

/**
 * Enhanced Condition Trigger Config Application
 */
export default class EnhancedConditionOptionConfig extends FormApplication {
	constructor(object, options) {
		super(object, options);

		this.object = this.object ?? {};

		this.initialObject = foundry.utils.duplicate(this.object);
	}

	/**
	 * defaultOptions
	 */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "cub-enhanced-condition-option-config",
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.OptionConfig.Title"),
			template: BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.optionConfig,
			classes: ["sheet"],
			closeOnSubmit: false,
			width: 500,
		});
	}

	/**
	 * Gets data for template rendering
	 * @returns {Object} data
	 */
	getData() {
		return {
			condition: this.object,
			optionData: this.object.options,
		};
	}

	/**
	 * Application listeners
	 * @param {jQuery} html
	 */
	activateListeners(html) {
		const checkboxes = html.find("input[type='checkbox']");

		for (const checkbox of checkboxes) {
			checkbox.addEventListener("change", (event) => this._onCheckboxChange(event));
		}
	}

	/**
	 * Checkbox change event handler
	 * @param {*} event
	 * @returns
	 */
	_onCheckboxChange(event) {
		if (!event.target?.checked) return;
		const targetName = event.target?.name;
		const propertyName = Sidekick.toCamelCase(targetName, "-");
		const specialStatusEffectsProps = Object.values(
			BUTLER.DEFAULT_CONFIG.enhancedConditions.specialStatusEffects
		).map((k) => k.optionProperty);

		if (!propertyName || !specialStatusEffectsProps) return;

		if (specialStatusEffectsProps.includes(propertyName)) {
			event.detail = event.detail && event.detail instanceof Object ? event.detail : {};
			event.detail.statusName = targetName;
			event.detail.statusLabel = event.target.nextElementSibling?.innerText;
			event.detail.conditionId = this.object.id;
			return EnhancedConditionOptionConfig._onSpecialStatusEffectToggle(event);
		}
	}

	/**
	 * Special Status Effect toggle handler
	 * @param {*} event
	 */
	static async _onSpecialStatusEffectToggle(event) {
		// is another condition already using this special status effect?
		const existingCondition = game.cub.conditions.find((c) => {
			const optionValue = foundry.utils.getProperty(
				c,
				`options.${Sidekick.toCamelCase(event.detail.statusName, "-")}`
			);
			return c.id !== event.detail.conditionId && optionValue == true;
		});
		if (existingCondition) {
			event.preventDefault();
			// raise a dialog asking for override
			const title = game.i18n.localize(
				`${BUTLER.NAME}.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Title`
			);
			const content = game.i18n.format(
				`${BUTLER.NAME}.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Content`,
				{
					existingCondition: existingCondition.name,
					statusEffect: event.detail.statusLabel ?? event.detail.statusName,
				}
			);
			const yes = () => {};
			const no = () => {
				return (event.target.checked = false);
			};
			const defaultYes = false;
			return Dialog.confirm({ title, content, yes, no, defaultYes }, {});
		}

		return event;
	}

	/**
	 * Update Object on Form Submission
	 * @param {*} event
	 * @param {*} formData
	 */
	async _updateObject(event, formData) {
		this.object.options = {};
		const specialStatusEffectMapping = Sidekick.getSetting(
			BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping
		);
		const map = game.cub.conditionLab.map;
		const newMap = foundry.utils.deepClone(map);
		let conditionIndex = newMap.findIndex((c) => c.id === this.object.id);

		for (const field in formData) {
			const value = formData[field];
			const element = event.target?.querySelector(`input[name="${field}"]`);
			const propertyName = Sidekick.toCamelCase(field, "-");
			const specialStatusEffect = this.getSpecialStatusEffectByField(field);

			if (specialStatusEffect) {
				const existingMapping = foundry.utils.getProperty(specialStatusEffectMapping, specialStatusEffect);
				if (existingMapping === `${BUTLER.NAME}.${this.object.id}` && value === false) {
					this.setSpecialStatusEffectMapping(specialStatusEffect);
				} else if (existingMapping !== `${BUTLER.NAME}.${this.object.id}` && value === true) {
					this.setSpecialStatusEffectMapping(specialStatusEffect, this.object.id);
					if (existingMapping) {
						const existingId = existingMapping.replace(`${BUTLER.NAME}.`, "");
						const existingConditionIndex = newMap.findIndex((c) => c.id === existingId);
						if (existingConditionIndex !== -1) {
							const existingCondition = newMap[existingConditionIndex];
							const options = existingCondition?.options;
							options[propertyName] = false;
							newMap[existingConditionIndex] = existingCondition;
						}
					}
				}
			}

			this.object.options[propertyName] = value;
		}

		newMap[conditionIndex] = this.object;
		await game.cub.conditionLab._saveMapping(newMap);
		await this.close();
	}

	/**
	 * Get the enum for a special status effect based on the field name
	 * @param {*} field
	 * @returns {String} enum for the special status effect
	 */
	getSpecialStatusEffectByField(field) {
		switch (field) {
			case "blind-token":
				return "BLIND";

			case "mark-invisible":
				return "INVISIBLE";

			default:
				break;
		}
	}

	/**
	 * Sets the special status effect to the provided condition Id
	 * @param {*} effect
	 * @param {*} conditionId
	 */
	setSpecialStatusEffectMapping(effect, conditionId = null) {
		if (!CONFIG.specialStatusEffects.hasOwnProperty(effect)) return;

		CONFIG.specialStatusEffects[effect] = conditionId ? `${BUTLER.NAME}.${conditionId}` : "";
		Sidekick.setSetting(
			BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping,
			CONFIG.specialStatusEffects
		);
	}
}
