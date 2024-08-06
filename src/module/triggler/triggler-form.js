import { Sidekick } from "../sidekick.js";
import { Triggler } from "./triggler.js";

export class TrigglerForm extends FormApplication {
	constructor(object, options = { parent: null }) {
		super(object, options);
		this.data = object || {};
		this.parent = options.parent || null;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "cub-triggler-form",
			title: "Triggler",
			template: "modules/condition-lab-triggler/templates/triggler-form.html",
			classes: ["sheet", "triggler-form"],
			width: 780,
			height: "auto",
			resizable: true,
			closeOnSubmit: false
		});
	}

	getData() {
		const id = this.data.id;
		const triggers = game.settings.get("condition-lab-triggler", "storedTriggers");

		if (this.noMerge) {
			this.noMerge = false;
		} else if (id && triggers) {
			const trigger = triggers.find((t) => t.id === id);
			foundry.utils.mergeObject(this.data, trigger);
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
			notZero = null
		} = this.data || {};
		const isSimpleTrigger = triggerType === "simple";
		const isAdvancedTrigger = triggerType === "advanced";
		let actorModel = game.model.Actor ?? {};
		const isEmpty = Object.values(actorModel).every((obj) => Object.keys(obj).length === 0);
		let mergedModel = null;
		if (isEmpty) {
			actorModel = CONFIG.Actor.dataModels ?? {};
			mergedModel = Object.keys(actorModel)
				.reduce((obj, key) =>
					foundry.utils.mergeObject(obj, new CONFIG.Actor.documentClass({ name: "CLT Actor", type: key }).toObject().system), {});
		} else {
			mergedModel = Object.keys(actorModel)
				.reduce((accumulator, key) => foundry.utils.mergeObject(accumulator, actorModel[key]), {});
		}
		const arrayToObj = (arr) => {
			return arr.reduce((obj, key) => {
				obj[key] = key;
				return obj;
			}, {});
		};
		const categories = mergedModel ? arrayToObj(Object.keys(mergedModel).sort()) : {};
		const attributes = category ? arrayToObj(Object.keys(mergedModel[category])) : {};
		const properties = category && attribute ? arrayToObj(Object.keys(mergedModel[category][attribute])) : {};
		const operators = Triggler.OPERATORS;

		const triggerSelected = !!(id && triggers);

		if (!categories) {
			ui.notifications.warn("Simple Trigger not supported. Try Advanced Trigger");
			// return false;
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
			notZero
		};
	}

	async _render(force, options) {
		await super._render(force, options);
		this._originalTop = this.element[0].style.top;
		if (this._reposition && !this._repositioned) {
			this._repositioned = true;

			const el = this.element[0];
			const scaledHeight = el.offsetHeight;
			const tarT = (window.innerHeight - scaledHeight) / 2;
			const maxT = Math.max(window.innerHeight - scaledHeight, 0);
			this.setPosition({ top: Math.clamp(tarT, 0, maxT) });
		}
	}

	activateListeners(html) {
		super.activateListeners(html);

		const triggerSelect = html.find("select[name='triggers']");
		const deleteTrigger = html.find("a.delete");

		// Simple
		const categorySelect = html.find("select[name='category']");
		const attributeSelect = html.find("select[name='attribute']");
		const property1Select = html.find("select[name='property1']");
		const operatorSelect = html.find("select[name='operator']");
		const valueInput = html.find("input[name='value']");
		const property2Select = html.find("select[name='property2']");

		// Simple/Advanced Toggle
		const triggerTypeRadio = html.find("input[name='triggerType']");

		// Advanced
		const advancedNameInput = html.find("input[name='advancedName']");
		const advancedActorPropertyInput = html.find("input[name='advancedActorProperty']");
		const advancedActorProperty2Input = html.find("input[name='advancedActorProperty2']");
		const advancedTokenPropertyInput = html.find("input[name='advancedTokenProperty']");
		const advancedTokenProperty2Input = html.find("input[name='advancedTokenProperty2']");
		const advancedOperatorSelect = html.find("select[name='advancedOperator']");
		const advancedValueInput = html.find("input[name='advancedValue']");

		// Options
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
			const triggers = game.settings.get("condition-lab-triggler", "storedTriggers");
			const triggerIndex = triggers.findIndex((t) => t.id === this.data.id);
			if (triggerIndex === undefined) {
				return;
			}
			const updatedTriggers = duplicate(triggers);

			updatedTriggers.splice(triggerIndex, 1);

			await game.settings.set("condition-lab-triggler", "storedTriggers", updatedTriggers);
			this.data = {};
			this.render();
		});

		// Simple
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
			this.data.property2 = event.target.value;
			this.render();
		});
		operatorSelect.on("change", (event) => {
			this.data.operator = event.target.value;
			this.render();
		});
		valueInput.on("change", (event) => {
			this.data.value = event.target.value;
			this.render();
		});

		// Simple/Advanced Toggle
		triggerTypeRadio.on("change", (event) => {
			this.data.triggerType = event.currentTarget.value;
			if (event.currentTarget.value === "advanced"
				&& this._originalTop === this.element[0].style.top
				&& !this._reposition) {
				this._reposition = true;
			}
			this.render();
		});

		// Advanced
		advancedNameInput.on("change", (event) => {
			this.data.advancedName = event.target.value;
			this.render();
		});
		advancedActorPropertyInput.on("change", (event) => {
			this.data.advancedActorProperty = event.target.value;
			this.render();
		});
		advancedActorProperty2Input.on("change", (event) => {
			this.data.advancedActorProperty2 = event.target.value;
			this.render();
		});
		advancedTokenPropertyInput.on("change", (event) => {
			this.data.advancedTokenProperty = event.target.value;
			this.render();
		});
		advancedTokenProperty2Input.on("change", (event) => {
			this.data.advancedTokenProperty2 = event.target.value;
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

		// Options
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

	async _updateObject(event, formData) {
		if (!formData.category && !formData.advancedActorProperty && !formData.advancedTokenProperty) {
			return;
		}

		const triggerType = formData?.triggerType;

		if (triggerType === "advanced" && !formData.advancedName.length) {
			ui.notifications.warn(game.i18n.localize("CLT.TRIGGLER.App.AdvancedTrigger.Name.Warning"));
			return false;
		}

		const triggers = game.settings.get("condition-lab-triggler", "storedTriggers");
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
			const updatedTrigger = foundry.utils.mergeObject(existingTrigger, newData);
			updatedTrigger.text = text;
			updatedTriggers[triggers.indexOf(existingTrigger)] = updatedTrigger;
			this.data = updatedTrigger;
		} else {
			const newTrigger = {
				id: Sidekick.createId(existingIds),
				...newData,
				text
			};
			updatedTriggers.push(newTrigger);
			this.data = newTrigger;
		}

		const setting = await game.settings.set("condition-lab-triggler", "storedTriggers", updatedTriggers);
		if (!setting) ui.notifications.info(game.i18n.localize("CLT.TRIGGLER.App.SaveSuccessful"));

		this.render();
	}

	/**
	 * Exports the current map to JSON
	 */
	_exportToJSON() {
		const triggers = duplicate(game.settings.get("condition-lab-triggler", "storedTriggers"));
		const data = {
			system: game.system.id,
			triggers
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
			// TODO change
			content: await renderTemplate("modules/condition-lab-triggler/templates/import-conditions.html", {}),
			buttons: {
				import: {
					icon: '<i class="fas fa-file-import"></i>',
					label: game.i18n.localize("CLT.WORDS.Import"),
					callback: (html) => {
						this._processImport(html);
					}
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize("Cancel")
				}
			},
			default: "import"
		}).render(true);
	}

	/**
	 * Process a Condition Map Import
	 * @param {*} html
	 * @returns {*}
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

		const originalTriggers = game.settings.get("condition-lab-triggler", "storedTriggers");
		await game.settings.set("condition-lab-triggler", "storedTriggers", originalTriggers.concat(triggers));
		this.render();
	}

	/** @override */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();

		buttons.unshift(
			{
				label: game.i18n.localize("CLT.WORDS.Import"),
				class: "import",
				icon: "fas fa-file-import",
				onclick: async (ev) => {
					await this._importFromJSONDialog();
				}
			},
			{
				label: game.i18n.localize("CLT.WORDS.Export"),
				class: "export",
				icon: "fas fa-file-export",
				onclick: async (ev) => {
					this._exportToJSON();
				}
			}
		);

		return buttons;
	}
}
