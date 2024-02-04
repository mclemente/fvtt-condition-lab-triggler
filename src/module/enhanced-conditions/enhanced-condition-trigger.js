/**
 * Enhanced Condition Trigger Config Application
 */
export default class EnhancedConditionTriggerConfig extends FormApplication {
	constructor(object, options) {
		super(object, options);

		this.object = this.object ?? {};

		this.initialObject = foundry.utils.duplicate(this.object);
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "cub-enhanced-condition-trigger-config",
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.TriggerConfig.Title"),
			template: "modules/condition-lab-triggler/templates/enhanced-condition-trigger-config.hbs",
			classes: ["sheet"],
			closeOnSubmit: false,
			width: 500
		});
	}

	getData() {
		return {
			condition: this.object,
			applyTriggerId: this.object.applyTrigger,
			removeTriggerId: this.object.removeTrigger,
			triggerChoices: game.settings.get("condition-lab-triggler", "storedTriggers") ?? []
		};
	}

	/**
	 * Update Object on Form Submission
	 * @param {*} event
	 * @param {*} formData
	 */
	async _updateObject(event, formData) {
		this.object.macros = [];

		for (const field in formData) {
			const type = field.split("-").slice(-1)
				.pop() ?? "";
			this.object[`${type}Trigger`] = formData[field];
		}

		const map = game.clt.conditions;
		const newMap = foundry.utils.duplicate(map);

		let conditionIndex = newMap.findIndex((c) => c.id === this.object.id);
		newMap[conditionIndex] = this.object;
		game.settings.set("condition-lab-triggler", "activeConditionMap", newMap);
		this.close();
	}
}
