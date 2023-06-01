import { Butler as BUTLER } from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { Triggler } from "./triggler.js";

export class TrigglerForm extends FormApplication {
	constructor(object, options = { parent: null }) {
		super(object, options);
		this.data = object || {};
		this.parent = options.parent || null;
	}

	/**
	 *
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "cub-triggler-form",
			title: "Triggler",
			template: `${BUTLER.PATH}/templates/triggler-form.html`,
			classes: ["sheet"],
			width: 780,
			height: 685,
			resizable: true,
			closeOnSubmit: false,
		});
	}

	/**
	 * Get data for the triggler form
	 */
	getData() {
		const id = this.data.id;
		const triggers = Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers);

		if (this.noMerge) {
			this.noMerge = false;
		} else if (id && triggers) {
			const trigger = triggers.find((t) => t.id === id);
			mergeObject(this.data, trigger);
		}

		const {
			triggerType = "simple",
			category = null,
			attribute = null,
			property1 = null,
			operator = null,
			value = null,
			property2 = null,
			advancedName = null,
			advancedActorProperty = null,
			advancedActorProperty2 = null,
			advancedTokenProperty = null,
			advancedTokenProperty2 = null,
			advancedOperator = null,
			advancedValue = null,
			pcOnly = null,
			npcOnly = null,
			notZero = null,
		} = this.data || {};
		const isSimpleTrigger = triggerType === "simple";
		const isAdvancedTrigger = triggerType === "advanced";
		const actorModel = game.system.model?.Actor;
		const mergedModel = actorModel
			? Object.keys(actorModel).reduce((accumulator, key, index) => {
					return foundry.utils.mergeObject(accumulator, actorModel[key]);
			  }, {})
			: null;
		const categories = mergedModel ? Object.keys(mergedModel) : null;
		const attributes = category ? Object.keys(mergedModel[category]) : null;
		const properties = category && attribute ? Object.keys(mergedModel[category][attribute]) : null;
		const operators = BUTLER.DEFAULT_CONFIG.triggler.operators;

		const triggerSelected = id && triggers ? true : false;

		if (!categories) {
			ui.notifications.warn("Simple Trigger not supported. Try Advanced Trigger");
			//return false;
		}

		return {
			id,
			triggerSelected,
			triggers,
			isSimpleTrigger,
			isAdvancedTrigger,
			category,
			categories,
			attribute,
			attributes,
			property1,
			properties,
			operator,
			operators,
			value,
			property2,
			advancedName,
			advancedActorProperty,
			advancedActorProperty2,
			advancedTokenProperty,
			advancedTokenProperty2,
			advancedOperator,
			advancedValue,
			pcOnly,
			npcOnly,
			notZero,
		};
	}

	/**
	 *
	 */
	activateListeners(html) {
		super.activateListeners(html);

		const triggerSelect = html.find("select[name='triggers']");
		const deleteTrigger = html.find("a.delete");
		const categorySelect = html.find("select[name='category']");
		const attributeSelect = html.find("select[name='attribute']");
		const property1Select = html.find("select[name='property1']");
		const operatorSelect = html.find("select[name='operator']");
		const valueInput = html.find("input[name='value']");
		const property2Select = html.find("select[name='property2']");
		const triggerTypeRadio = html.find("input[name='triggerType']");
		const advancedOperatorSelect = html.find("select[name='advancedOperator']");
		const advancedValueInput = html.find("input[name='advancedValue']");
		const pcOnlyCheckbox = html.find("input[name='pcOnly']");
		const npcsOnlyCheckbox = html.find("input[name='npcOnly']");
		const notZeroCheckbox = html.find("input[name='notZero']");
		const cancelButton = html.find("button[name='cancel']");

		this.noMerge = true;

		triggerSelect.on("change", (event) => {
			this.data = {};
			this.data.id = event.target.value;
			this.noMerge = false;
			this.render();
		});

		deleteTrigger.on("click", async (event) => {
			const triggers = Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers);
			const triggerIndex = triggers.findIndex((t) => t.id === this.data.id);
			if (triggerIndex === undefined) {
				return;
			}
			const updatedTriggers = duplicate(triggers);

			updatedTriggers.splice(triggerIndex, 1);

			await Sidekick.setSetting(BUTLER.SETTING_KEYS.triggler.triggers, updatedTriggers);
			this.data = {};
			this.render();
		});

		categorySelect.on("change", (event) => {
			this.data.category = event.target.value;
			this.data.attribute = null;
			this.data.property1 = null;
			this.data.property2 = null;
			this.data.operator = null;
			this.data.value = null;

			this.render();
		});

		attributeSelect.on("change", (event) => {
			this.data.attribute = event.target.value;
			this.data.property1 = null;
			this.data.property2 = null;
			this.data.operator = null;
			this.data.value = null;

			this.render();
		});
		property1Select.on("change", (event) => {
			this.data.property1 = event.target.value;
			this.render();
		});

		property2Select.on("change", (event) => {
			this.data.value = null;
			this.data.property2 = event.target.value;
			this.render();
		});
		operatorSelect.on("change", (event) => {
			this.data.operator = event.target.value;
			this.render();
		});
		valueInput.on("change", (event) => {
			this.data.value = event.target.value;
			this.data.property2 = null;
			this.render();
		});

		triggerTypeRadio.on("change", (event) => {
			this.data.triggerType = event.currentTarget.value;
			this.render();
		});

		advancedOperatorSelect.on("change", (event) => {
			this.data.advancedOperator = event.target.value;
			this.render();
		});
		advancedValueInput.on("change", (event) => {
			this.data.advancedValue = event.target.value;
			this.render();
		});

		pcOnlyCheckbox.on("click", (event) => {
			this.data.pcOnly = event.target.checked;
			this.render();
		});
		npcsOnlyCheckbox.on("click", (event) => {
			this.data.npcOnly = event.target.checked;
			this.render();
		});
		notZeroCheckbox.on("click", (event) => {
			this.data.notZero = event.target.checked;
			this.render();
		});

		cancelButton.on("click", (event) => {
			this.close();
		});
	}

	/**
	 * Update the Trigger object
	 * @param {*} event
	 * @param {*} formData
	 */
	async _updateObject(event, formData) {
		if (!formData.category && !formData.advancedActorProperty && !formData.advancedTokenProperty) {
			return;
		}

		const triggerType = formData?.triggerType;

		if (triggerType === "advanced" && !formData.advancedName.length) {
			ui.notifications.warn(game.i18n.localize("CLT.TRIGGLER.App.AdvancedTrigger.Name.Warning"));
			return false;
		}

		const triggers = Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers);
		const existingIds = triggers ? triggers.map((t) => t.id) : null;
		const text = triggerType === "simple" ? Triggler._constructString(formData) : formData.advancedName;

		if (!text) return false;

		const id = this.data.id;
		const newData = duplicate(formData);
		delete newData.triggers;

		const updatedTriggers = duplicate(triggers);
		const existingTrigger = triggers.find((t) => t.id === id);
		const isNew = existingTrigger ? triggerType === "simple" || existingTrigger.advancedName !== text : true;

		if (!isNew) {
			const updatedTrigger = mergeObject(existingTrigger, newData);
			updatedTrigger.text = text;
			updatedTriggers[triggers.indexOf(existingTrigger)] = updatedTrigger;
			this.data = updatedTrigger;
		} else {
			const newTrigger = {
				id: Sidekick.createId(existingIds),
				...newData,
				text,
			};
			updatedTriggers.push(newTrigger);
			this.data = newTrigger;
		}

		const setting = await Sidekick.setSetting(BUTLER.SETTING_KEYS.triggler.triggers, updatedTriggers);
		if (!!setting) ui.notifications.info(game.i18n.localize("CLT.TRIGGLER.App.SaveSuccessful"));

		this.render();
	}

	/**
	 * Exports the current map to JSON
	 */
	_exportToJSON() {
		const triggers = duplicate(Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers));
		const data = {
			system: game.system.id,
			triggers,
		};

		// Trigger file save procedure
		const filename = `cub-${game.world.id}-triggers.json`;
		saveDataToFile(JSON.stringify(data, null, 2), "text/json", filename);
	}

	/**
	 * Initiates an import via a dialog
	 * Borrowed from foundry.js Entity class
	 */
	async _importFromJSONDialog() {
		new Dialog({
			title: game.i18n.localize("CLT.TRIGGLER.ImportTitle"),
			//TODO change
			content: await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.importDialog, {}),
			buttons: {
				import: {
					icon: '<i class="fas fa-file-import"></i>',
					label: game.i18n.localize("CLT.WORDS.Import"),
					callback: (html) => {
						this._processImport(html);
					},
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize("CLT.WORDS.Cancel"),
				},
			},
			default: "import",
		}).render(true);
	}

	/**
	 * Process a Condition Map Import
	 * @param {*} html
	 */
	async _processImport(html) {
		const form = html.find("form")[0];

		if (!form.data.files.length) {
			return ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.Import.NoFile"));
		}

		const jsonFile = await readTextFromFile(form.data.files[0]);
		const json = JSON.parse(jsonFile);
		const triggers = Triggler.triggersFromJson(json);

		if (!triggers || !triggers?.length) {
			return;
		}

		const originalTriggers = Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers);
		await Sidekick.setSetting(BUTLER.SETTING_KEYS.triggler.triggers, originalTriggers.concat(triggers));
		this.render();
	}

	/**
	 * Override the header buttons method
	 */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();

		buttons.unshift(
			{
				label: game.i18n.localize("CLT.WORDS.Import"),
				class: "import",
				icon: "fas fa-file-import",
				onclick: async (ev) => {
					await this._importFromJSONDialog();
				},
			},
			{
				label: game.i18n.localize("CLT.WORDS.Export"),
				class: "export",
				icon: "fas fa-file-export",
				onclick: async (ev) => {
					this._exportToJSON();
				},
			}
		);

		return buttons;
	}
}
