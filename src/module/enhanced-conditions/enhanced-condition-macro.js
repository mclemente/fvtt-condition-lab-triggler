/**
 * Enhanced Condition Macro Config Application
 */
export default class EnhancedConditionMacroConfig extends FormApplication {
	constructor(object, options) {
		super(object, options);

		this.object = this.object ?? {};
		this.object.macros = this.object.macros ?? [];

		this.initialObject = foundry.utils.duplicate(this.object);
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "cub-enhanced-condition-macro-config",
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.MacroConfig.Title"),
			template: "modules/condition-lab-triggler/templates/enhanced-condition-macro-config.hbs",
			classes: ["sheet"],
			closeOnSubmit: false
		});
	}

	getData() {
		const conditionMacros = this.object.macros;
		const applyMacroId = conditionMacros.find((m) => m.type === "apply")?.id;
		const removeMacroId = conditionMacros.find((m) => m.type === "remove")?.id;

		const macroChoices = game.macros?.contents
			?.map((m) => {
				return { id: m.id, name: m.name };
			})
			.sort((a, b) => a.name.localeCompare(b.name));

		return {
			condition: this.object,
			applyMacroId,
			removeMacroId,
			macroChoices
		};
	}

	async _updateObject(event, formData) {
		this.object.macros = [];

		for (const field in formData) {
			const type = field.split("-").slice(-1)
				.pop() ?? "";
			const tempMacro = { id: formData[field], type: type };
			this.object.macros.push(tempMacro);
		}

		const map = game.clt.conditions;
		const newMap = foundry.utils.duplicate(map);

		let conditionIndex = newMap.findIndex((c) => c.id === this.object.id);
		newMap[conditionIndex] = this.object;
		await game.settings.set("condition-lab-triggler", "activeConditionMap", newMap);
		this.close();
	}
}
