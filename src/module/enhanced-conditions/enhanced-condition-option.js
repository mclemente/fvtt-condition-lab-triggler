import { Sidekick } from "../sidekick.js";

/**
 * Enhanced Condition Trigger Config Application
 */
export default class EnhancedConditionOptionConfig extends FormApplication {
	constructor(object, options) {
		super(object, options);

		this.initialObject = foundry.utils.duplicate(this.object);
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "cub-enhanced-condition-option-config",
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.OptionConfig.Title"),
			template: "modules/condition-lab-triggler/templates/enhanced-condition-option-config.hbs",
			classes: ["sheet"],
			closeOnSubmit: false,
			width: 500
		});
	}

	getData() {
		return {
			condition: this.object,
			optionData: this.object.options,
			specialStatus: CONFIG.specialStatusEffects
		};
	}

	activateListeners(html) {
		const checkboxes = html.find("input[type='checkbox']");

		// for (const checkbox of checkboxes) {
		checkboxes.on("change", (event) => this._onCheckboxChange(event));
		// }
	}

	/**
	 * Checkbox change event handler
	 * @param {*} event
	 * @returns {*}
	 */
	_onCheckboxChange(event) {
		if (!event.target?.checked) return;
		const targetName = event.target?.name;
		const propertyName = Sidekick.toCamelCase(targetName, "-");
		const specialStatusEffectsProps = Object.values({
			blinded: { optionProperty: "blindToken" },
			invisible: { optionProperty: "markInvisible" }
		}).map((k) => k.optionProperty);

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
	 * @returns {*}
	 */
	static async _onSpecialStatusEffectToggle(event) {
		// is another condition already using this special status effect?
		const existingCondition = game.clt.conditions.find((c) => {
			const optionValue = foundry.utils.getProperty(
				c,
				`options.${Sidekick.toCamelCase(event.detail.statusName, "-")}`
			);
			return c.id !== event.detail.conditionId && optionValue;
		});
		if (existingCondition) {
			event.preventDefault();
			// raise a dialog asking for override
			const title = game.i18n.localize("CLT.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Title");
			const content = game.i18n.format(
				"CLT.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Content",
				{
					existingCondition: existingCondition.name,
					statusEffect: event.detail.statusLabel ?? event.detail.statusName
				}
			);
			const yes = () => { };
			const no = () => {
				return (event.target.checked = false);
			};
			const defaultYes = false;
			return Dialog.confirm({ title, content, yes, no, defaultYes }, {});
		}

		return event;
	}

	async _updateObject(event, formData) {
		this.object.options = {};
		const specialStatusEffectMapping = game.settings.get("condition-lab-triggler",
			"specialStatusEffectMapping"
		);
		const map = game.clt.conditionLab.map;
		const newMap = foundry.utils.deepClone(map);
		let conditionIndex = newMap.findIndex((c) => c.id === this.object.id);

		for (const field in formData) {
			const value = formData[field];
			const propertyName = Sidekick.toCamelCase(field, "-");
			const specialStatusEffect = this.getSpecialStatusEffectByField(field);

			if (specialStatusEffect) {
				const existingMapping = foundry.utils.getProperty(specialStatusEffectMapping, specialStatusEffect);
				if (existingMapping === this.object.id && value === false) {
					this.setSpecialStatusEffectMapping(specialStatusEffect);
				} else if (existingMapping !== this.object.id && value === true) {
					this.setSpecialStatusEffectMapping(specialStatusEffect, this.object.id);
					if (existingMapping) {
						const existingId = existingMapping.replace("condition-lab-triggler.", "");
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
		await game.clt.conditionLab._saveMapping(newMap);
		await this.close();
	}

	/**
	 * Get the enum for a special status effect based on the field name
	 * @param {string} field
	 * @returns {string | undefined} BLIND, INVISIBLE, or DEFEATED
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
	 * @param {string} effect	Either BLIND, INVISIBLE, or DEFEATED
	 * @param {string} conditionId
	 */
	setSpecialStatusEffectMapping(effect, conditionId = null) {
		if (!Object.prototype.hasOwnProperty.call(CONFIG.specialStatusEffects, effect)) return;

		CONFIG.specialStatusEffects[effect] = conditionId;
		game.settings.set("condition-lab-triggler",
			"specialStatusEffectMapping",
			CONFIG.specialStatusEffects
		);
	}
}
