import { Sidekick } from "../sidekick.js";
import { TrigglerForm } from "../triggler/triggler-form.js";
import EnhancedConditionMacroConfig from "./enhanced-condition-macro.js";
import EnhancedConditionOptionConfig from "./enhanced-condition-option.js";
import EnhancedConditionTriggerConfig from "./enhanced-condition-trigger.js";
import { EnhancedConditions } from "./enhanced-conditions.js";
import EnhancedEffectConfig from "./enhanced-effect-config.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
export class ConditionLab extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
		game.clt.conditionLab = this;
		this.data = (game.clt.conditionLab ? game.clt.conditionLab.data : object) ?? null;
		this.system = game.system.id;
		this.initialMapType = game.settings.get("condition-lab-triggler", "conditionMapType");
		this.mapType = null;
		this.initialMap = game.settings.get("condition-lab-triggler", "activeConditionMap");
		this.map = null;
		this.displayedMap = null;
		this.maps = game.settings.get("condition-lab-triggler", "defaultConditionMaps");
		this.filterValue = "";
		this.sortDirection = "";
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "cub-condition-lab",
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.Title"),
			template: "modules/condition-lab-triggler/templates/condition-lab.hbs",
			classes: ["sheet", "condition-lab-form"],
			width: 780,
			height: 680,
			resizable: true,
			closeOnSubmit: false,
			scrollY: ["ol.condition-lab"],
			dragDrop: [{ dropSelector: "div.text-entry.reference" }]
		});
	}

	/**
	 * Get updated map by combining existing in-memory map with current formdata
	 * @returns {object[]}
	 */
	get updatedMap() {
		const submitData = this._buildSubmitData();
		const mergedMap = this._processFormData(submitData);
		return EnhancedConditions._prepareMap(mergedMap);
	}

	/**
	 * Gets data for the template render
	 * @returns {object}
	 */
	async getData() {
		const sortDirection = this.sortDirection;
		const sortTitle = game.i18n.localize(
			`CLT.ENHANCED_CONDITIONS.ConditionLab.SortAnchorTitle.${sortDirection ? sortDirection : "unsorted"}`
		);
		const filterTitle = game.i18n.localize("CLT.ENHANCED_CONDITIONS.ConditionLab.FilterInputTitle");
		const filterValue = this.filterValue;

		const defaultMaps = game.settings.get("condition-lab-triggler", "defaultConditionMaps");
		// const mappedSystems = Object.keys(defaultMaps) || [];
		const mappedSystems = [];
		const mapTypeChoices = game.settings.settings.get("condition-lab-triggler.conditionMapType").choices;

		// If there's no default map for this system don't provide the "default" choice
		if (!mappedSystems.includes(game.system.id)) {
			if (this.initialMap.length) {
				mapTypeChoices.default = game.i18n.localize("CLT.SETTINGS.EnhancedConditions.MapType.Choices.inferred");
			} else {
				delete mapTypeChoices.default;
			}
		}

		this.mapType ||= this.initialMapType || "other";
		const conditionMap = (this.map ||= foundry.utils.duplicate(this.initialMap));
		const triggers = game.settings.get("condition-lab-triggler", "storedTriggers").map((t) => {
			return [t.id, t.text];
		});

		const isDefault = this.mapType === "default";
		const outputChatSetting = game.settings.get("condition-lab-triggler", "conditionsOutputToChat");
		const disableChatOutput = isDefault || !outputChatSetting;

		for (const condition of conditionMap) {
			condition.name = game.i18n.localize(condition.name);
			// Check if the row exists in the saved map
			const existingEntry = this.initialMap.find((e) => e.id === condition.id) ?? null;
			condition.isNew = !existingEntry;
			condition.isChanged = condition.isNew || this._hasEntryChanged(condition, existingEntry);

			// Set the Output to Chat checkbox
			condition.options = condition.options ?? {};
			condition.enrichedReference = condition.reference
				? await TextEditor.enrichHTML(`@UUID[${condition.reference}]`, { documents: true })
				: "";

			// Default all entries to show
			condition.hidden = condition.hidden ?? false;
		}

		// Pre-apply any filter value
		this.displayedMap = filterValue
			? this._filterMapByName(conditionMap, filterValue)
			: foundry.utils.duplicate(conditionMap);

		// Sort the displayed map based on the sort direction
		if (sortDirection) {
			this.displayedMap = this._sortMapByName(this.displayedMap, sortDirection);
		}

		const displayedMap = this.displayedMap;
		const conditionMapLength = displayedMap.length - 1;

		let unsavedMap = false;
		if (
			this.mapType !== this.initialMapType
			|| conditionMap?.length !== this.initialMap?.length
			|| conditionMap.some((c) => c.isNew || c.isChanged)
		) {
			unsavedMap = true;
		}

		// Prepare final data object for template
		const data = {
			sortTitle,
			sortDirection,
			filterTitle,
			filterValue,
			mapTypeChoices,
			mapType: this.mapType,
			conditionMap,
			displayedMap,
			conditionMapLength,
			triggers,
			isDefault,
			disableChatOutput,
			unsavedMap
		};

		this.data = data;
		return data;
	}

	/**
	 * Enriches submit data with existing map to ensure continuity
	 * @returns {object}
	 */
	_buildSubmitData() {
		const map = this.sortDirection ? this._sortMapByName(this.map) : this.map;
		const data =
			map?.reduce((acc, entry, index) => {
				acc[`id-${index}`] = entry.id;
				return acc;
			}, {}) ?? {};
		return this._getSubmitData(data);
	}

	/**
	 * Processes the Form Data and builds a usable Condition Map
	 * @param {object} formData
	 * @returns {object}
	 */
	_processFormData(formData) {
		let ids = [];
		let conditions = [];
		let icons = [];
		let references = [];
		let newMap = [];
		const rows = [];
		const existingMap = this.map ?? game.settings.get("condition-lab-triggler", "activeConditionMap");

		// need to tighten these up to check for the existence of digits after the word
		const conditionRegex = /condition/i;
		const idRegex = new RegExp(/^id/, "i");
		const iconRegex = /icon/i;
		const referenceRegex = /reference/i;
		const rowRegex = new RegExp(/\d+$/);

		// write it back to the relevant condition map
		// @todo: maybe switch to a switch
		for (let e in formData) {
			const rowMatch = e.match(rowRegex);
			const row = rowMatch ? rowMatch[0] : null;

			if (!row) {
				continue;
			}

			rows.push(row);

			if (e.match(idRegex)) {
				ids[row] = formData[e];
			} else if (e.match(conditionRegex)) {
				conditions[row] = formData[e];
			} else if (e.match(iconRegex)) {
				icons[row] = formData[e];
			} else if (e.match(referenceRegex)) {
				references[row] = formData[e];
			}
		}

		const uniqueRows = [...new Set(rows)];

		for (let i = 0; i < uniqueRows.length; i++) {
			const id = ids[i] ?? null;
			const name = conditions[i];
			const existingCondition = existingMap && id ? existingMap.find((c) => c.id === id) : null;
			const {
				activeEffect = null,
				applyTrigger = null,
				removeTrigger = null,
				macros = null,
				options = {}
			} = existingCondition || {};

			const condition = {
				id,
				name,
				img: icons[i],
				reference: references[i],
				applyTrigger,
				removeTrigger,
				activeEffect,
				macros,
				options
			};

			newMap.push(condition);
		}

		return newMap;
	}

	/**
	 * Restore defaults for a mapping
	 * @param {object} options
	 * @param {boolean} options.clearCache
	 */
	async _restoreDefaults({ clearCache = false } = {}) {
		const system = this.system;
		let defaultMaps = game.settings.get("condition-lab-triggler", "defaultConditionMaps");

		if (clearCache) {
			defaultMaps = await EnhancedConditions._loadDefaultMaps();
			game.settings.set("condition-lab-triggler", "defaultConditionMaps", defaultMaps);
		}
		const tempMap = this.mapType !== "other" && defaultMaps && defaultMaps[system] ? defaultMaps[system] : [];

		// If the mapType is other then the map should be empty, otherwise it's the default map for the system
		this.map = tempMap;
		this.render(true);
	}

	/**
	 * Take the new map and write it back to settings, overwriting existing
	 * @param {object} event
	 * @param {object} formData
	 */
	async _updateObject(event, formData) {
		const showDialogSetting = game.settings.get("condition-lab-triggler", "showSortDirectionDialog");

		if (this.sortDirection && showDialogSetting) {
			await Dialog.confirm({
				title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.Title"),
				content: game.i18n.localize("CLT.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.Content"),
				yes: ($html) => {
					const checkbox = $html[0].querySelector("input[name='dont-show-again']");
					if (checkbox.checked) {
						game.settings.set("condition-lab-triggler", "showSortDirectionDialog", false);
					}
					this._processFormUpdate(formData);
				},
				no: () => {}
			});
		} else {
			this._processFormUpdate(formData);
		}
	}

	/**
	 * Process Condition Lab formdata and then save changes
	 * @param {*} formData
	 */
	async _processFormUpdate(formData) {
		const mapType = formData["map-type"];
		let newMap = this.updatedMap;

		if (mapType === "default") {
			const defaultMap = EnhancedConditions.getDefaultMap(this.system);
			newMap = foundry.utils.mergeObject(newMap, defaultMap);
		}

		this._saveMapping(newMap, mapType);
	}

	/**
	 * Saves a given map and option map type to storage
	 * @param {*} newMap
	 * @param {*} mapType
	 */
	async _saveMapping(newMap, mapType = this.mapType) {
		this.mapType = this.initialMapType = mapType;
		const preparedMap = EnhancedConditions._prepareMap(newMap);

		await game.settings.set("condition-lab-triggler", "conditionMapType", mapType);
		await game.settings.set("condition-lab-triggler", "activeConditionMap", preparedMap);

		this._finaliseSave(preparedMap);
	}

	/**
	 * Performs final steps after saving mapping
	 * @param {*} preparedMap
	 */
	async _finaliseSave(preparedMap) {
		this.map = this.initialMap = preparedMap;
		this.unsaved = false;
		this.sortDirection = "";

		ui.notifications.info(game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.SaveSuccess"));
		this.render(true);
	}

	/**
	 * Exports the current map to JSON
	 */
	_exportToJSON() {
		const map = foundry.utils.duplicate(this.map);
		const data = {
			system: game.system.id,
			map
		};

		// Trigger file save procedure
		const filename = `cub-${game.system.id}-condition-map.json`;
		saveDataToFile(JSON.stringify(data, null, 2), "text/json", filename);
	}

	/**
	 * Initiates an import via a dialog
	 * Borrowed from foundry.js Entity class
	 */
	async _importFromJSONDialog() {
		new Dialog({
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.ImportTitle"),
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
		const map = EnhancedConditions.mapFromJson(json);

		if (!map || !map?.length) {
			return;
		}

		this.mapType = "other";
		this.map = map;
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
					this._importFromJSONDialog();
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

	/* -------------------------------------------- */
	/*                 Hook Handlers                */
	/* -------------------------------------------- */

	/**
	 * Condition Lab Render handler
	 * @param {*} app
	 * @param {*} html
	 * @param {*} data
	 */
	static _onRender(app, html, data) {
		ui.clt.conditionLab = app;
	}

	/**
	 * Render save dialog hook handler
	 * @param {*} app
	 * @param {jQuery} html
	 * @param {*} data
	 */
	static _onRenderSaveDialog(app, html, data) {
		const contentDiv = html[0].querySelector("div.dialog-content");
		const checkbox = `<div class="form-group"><label class="dont-show-again-checkbox">${game.i18n.localize(
			"CLT.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.CheckboxText"
		)}<input type="checkbox" name="dont-show-again"></label></div>`;
		contentDiv.insertAdjacentHTML("beforeend", checkbox);
		app.setPosition({ height: app.position.height + 32 });
	}

	/**
	 * Render restore defaults hook handler
	 * @param {*} app
	 * @param {*} html
	 * @param {*} data
	 */
	static _onRenderRestoreDefaultsDialog(app, html, data) {
		if (game.clt.conditionLab.mapType !== "default") return;

		const contentDiv = html[0].querySelector("div.dialog-content");
		const checkbox = `<div class="form-group">
		<label>${game.i18n.localize("CLT.ENHANCED_CONDITIONS.ConditionLab.RestoreDefaultClearCache.CheckboxText")}</label>
		<input type="checkbox" name="clear-cache">
		</div>`;
		contentDiv.insertAdjacentHTML("beforeend", checkbox);
		app.setPosition({ height: app.position.height + 32 });
	}

	/* -------------------------------------------- */
	/*                Event Handlers                */
	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		const inputs = html.find("input");
		const mapTypeSelector = html.find("select[class='map-type']");
		const activeEffectButton = html.find("button.active-effect-config");
		const triggerAnchor = html.find("a[class='trigger']");
		const addRowAnchor = html.find("a[name='add-row']");
		const removeRowAnchor = html.find("a[class='remove-row']");
		const changeOrderAnchor = html.find(".row-controls a.move-up, .row-controls a.move-down");
		const restoreDefaultsButton = html.find("button[class='restore-defaults']");
		const resetFormButton = html.find("button[name='reset']");
		const filterInput = html.find("input[name='filter-list']");
		const sortButton = html.find("a.sort-list");
		const macroConfigButton = html.find("button.macro-config");
		const triggerConfigButton = html.find("button.trigger-config");
		const optionConfigButton = html.find("button.option-config");

		inputs.on("change", (event) => this._onChangeInputs(event));
		mapTypeSelector.on("change", (event) => this._onChangeMapType(event));
		activeEffectButton.on("click", (event) => this._onClickActiveEffectConfig(event));
		triggerAnchor.on("click", (event) => this._onOpenTrigglerForm(event));
		addRowAnchor.on("click", async (event) => this._onAddRow(event));
		removeRowAnchor.on("click", async (event) => this._onRemoveRow(event));
		changeOrderAnchor.on("click", (event) => this._onChangeSortOrder(event));
		restoreDefaultsButton.on("click", async (event) => this._onRestoreDefaults(event));
		resetFormButton.on("click", (event) => this._onResetForm(event));
		filterInput.on("input", (event) => this._onChangeFilter(event));
		sortButton.on("click", (event) => this._onClickSortButton(event));
		macroConfigButton.on("click", (event) => this._onClickMacroConfig(event));
		triggerConfigButton.on("click", (event) => this._onClickTriggerConfig(event));
		optionConfigButton.on("click", (event) => this._onClickOptionConfig(event));

		super.activateListeners(html);
	}

	/** @override */
	_activateCoreListeners(html) {
		super._activateCoreListeners(html);
		if (this.isEditable) html.find("img[data-edit]").on("click", this._onEditImage.bind(this));
	}

	/**
	 * Input change handler
	 * @param {*} event
	 * @returns {Application.render}
	 */
	async _onChangeInputs(event) {
		const name = event.target.name;
		if (name.startsWith("filter-list")) return;
		this.map = this.updatedMap;
		if (!this.map.length) return;
		if (name.startsWith("reference")) this._onChangeReferenceId(event);
		if (this._hasMapChanged()) return this.render();
	}

	/**
	 * Filter input change handler
	 * @param {*} event
	 */
	_onChangeFilter(event) {
		const input = event.target;
		const inputValue = input?.value;
		this.filterValue = inputValue ?? "";
		this.displayedMap = this._filterMapByName(this.map, this.filterValue);

		this.displayedRowIds = this.displayedMap.filter((r) => !r.hidden).map((r) => r.id);

		const conditionRowEls = this._element[0].querySelectorAll("li.row");
		for (const el of conditionRowEls) {
			const conditionId = el.dataset.conditionId;
			if (this.displayedRowIds.includes(conditionId)) {
				el.classList.remove("hidden");
			} else {
				el.classList.add("hidden");
			}
		}
	}

	/**
	 * Filter the given map by the name property using the supplied filter value, marking filtered entries as "hidden"
	 * @param {Array} map
	 * @param {string} filter
	 * @returns {object[]} filteredMap
	 */
	_filterMapByName(map, filter) {
		return map.map((c) => ({ ...c, hidden: !c.name.toLowerCase().includes(filter.toLowerCase()) }));
	}

	/**
	 * Change Map Type event handler
	 * @param {*} event
	 */
	async _onChangeMapType(event) {
		event.preventDefault();
		const selection = $(event.target).find("option:selected");
		const newType = (this.mapType = selection.val());

		switch (newType) {
			case "default":
			case "custom": {
				const defaultMap = EnhancedConditions.getDefaultMap(this.system);
				this.map = defaultMap?.length ? EnhancedConditions._prepareMap(defaultMap) : [];
				break;
			}

			case "other": {
				this.map = this.initialMapType === "other" ? this.initialMap : [];
				break;
			}

			default:
				break;
		}

		this.data = null;
		this.render();
	}

	/**
	 * Handle click Active Effect Config button
	 * @param {*} event
	 */
	async _onClickActiveEffectConfig(event) {
		const li = event.currentTarget.closest("li");
		const conditionId = li ? li.dataset.conditionId : null;

		if (!conditionId) return;

		const conditions = this.map ?? game.settings.get("condition-lab-triggler", "activeConditionMap");
		const condition = conditions.length ? conditions.find((c) => c.id === conditionId) : null;

		if (!condition) return;

		const conditionEffect = condition.activeEffect ?? EnhancedConditions.getActiveEffects(condition)[0];

		if (!conditionEffect) return;

		if (!foundry.utils.hasProperty(conditionEffect, "flags.condition-lab-triggler.conditionId")) {
			setProperty(
				conditionEffect,
				"flags.condition-lab-triggler.conditionId",
				conditionId
			);
		}

		// Build a fake effect object for the ActiveEffectConfig sheet
		// @todo #544 make Conditions an ActiveEffect extension?
		delete conditionEffect.id;
		const effect = new ActiveEffect(conditionEffect);
		effect.testUserPermission = (...args) => {
			return true;
		};

		new EnhancedEffectConfig(effect).render(true);
	}

	/**
	 * Reference Link change handler
	 * @param {*} event
	 */
	async _onChangeReferenceId(event) {
		event.preventDefault();
		const input = event.currentTarget ?? event.target;
		input.nextElementSibling.innerHTML = await TextEditor.enrichHTML(input.value, { documents: true });
	}

	/**
	 * Open Triggler form event handler
	 * @param {*} event
	 */
	_onOpenTrigglerForm(event) {
		event.preventDefault();
		const anchor = event.currentTarget;
		const select = anchor.parentElement.nextElementSibling;
		const id = select.value;
		const conditionLabRow = select.name.match(/\d+$/)[0];

		const data = {
			id,
			conditionLabRow
		};

		new TrigglerForm(data, { parent: this }).render(true);
	}

	/**
	 * Add Row event handler
	 * @param {*} event
	 */
	_onAddRow(event) {
		event.preventDefault();

		const existingNewConditions = this.map.filter((m) => m.name.match(/^New Condition \d+$/));
		const newConditionIndex = existingNewConditions.length
			? Math.max(...existingNewConditions.map((m) => Number(m.name.match(/\d+$/g)[0]))) + 1
			: 1;
		const newConditionName = `New Condition ${newConditionIndex}`;
		const fdMap = this.updatedMap;

		if (this.mapType === "default") {
			const defaultMap = EnhancedConditions.getDefaultMap(this.system);
			this.map = foundry.utils.mergeObject(fdMap, defaultMap);
		} else {
			this.map = fdMap;
		}

		const newMap = foundry.utils.duplicate(this.map);
		const exisitingIds = this.map.filter((c) => c.id).map((c) => c.id);
		const outputChatSetting = game.settings.get("condition-lab-triggler", "conditionsOutputToChat");

		newMap.push({
			id: Sidekick.createId(exisitingIds),
			name: newConditionName,
			img: "icons/svg/d20-black.svg",
			reference: "",
			trigger: "",
			options: {
				outputChat: outputChatSetting
			}
		});

		const newMapType = this.mapType === "default" ? "custom" : this.mapType;

		this.mapType = newMapType;
		this.map = newMap;
		this.data = null;

		this.render();
	}

	/**
	 * Handler for remove row event
	 * @param {*} event
	 */
	_onRemoveRow(event) {
		event.preventDefault();

		this.map = this.updatedMap;

		const row = event.currentTarget.name.match(/\d+$/)[0];

		const dialog = new Dialog({
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.ConfirmDeleteTitle"),
			content: game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.ConfirmDeleteContent"),
			buttons: {
				yes: {
					icon: '<i class="fa fa-check"></i>',
					label: game.i18n.localize("Yes"),
					callback: async (event) => {
						const newMap = foundry.utils.duplicate(this.map);
						newMap.splice(row, 1);
						this.map = newMap;
						this.render();
					}
				},
				no: {
					icon: '<i class="fa fa-times"></i>',
					label: game.i18n.localize("No"),
					callback: (event) => {}
				}
			},
			default: "no"
		});

		dialog.render(true);
	}

	/**
	 * Handle a change sort order click
	 * @param {*} event
	 */
	_onChangeSortOrder(event) {
		event.preventDefault();

		const anchor = event.currentTarget;
		const liRow = anchor?.closest("li");
		const rowNumber = parseInt(liRow?.dataset.mappingRow);
		const type = anchor?.className;
		const newMap = foundry.utils.deepClone(this.map);
		const mappingRow = newMap?.splice(rowNumber, 1) ?? [];
		let newIndex = -1;

		switch (type) {
			case "move-up":
				newIndex = rowNumber - 1;
				break;

			case "move-down":
				newIndex = rowNumber + 1;
				break;

			default:
				break;
		}

		if (newIndex <= -1) return;

		newMap.splice(newIndex, 0, ...mappingRow);
		this.map = newMap;
		this.render();
	}

	/**
	 * Sort button handler
	 * @param {*} event
	 * @returns {Application}                 The rendered Application instance
	 */
	_onClickSortButton(event) {
		const sortDirection = this.sortDirection;
		// const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
		switch (sortDirection) {
			case "":
				this.sortDirection = "asc";
				break;

			case "asc":
				this.sortDirection = "desc";
				break;

			case "desc":
				this.sortDirection = "";
				break;

			default:
				break;
		}

		return this.render();
	}

	/**
	 * Sorts the given map by the name property
	 * @param {Array} map
	 * @param {*} direction
	 * @returns {Array}
	 */
	_sortMapByName(map, direction) {
		return map.sort((a, b) => {
			if (direction === "desc") return b.name.localeCompare(a.name);
			return a.name.localeCompare(b.name);
		});
	}

	/**
	 * Opens dialog to reset to default values.
	 * @param {*} event
	 */
	_onRestoreDefaults(event) {
		event.preventDefault();
		const content = game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.RestoreDefaultsContent");

		const confirmationDialog = new Dialog({
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.RestoreDefaultsTitle"),
			content,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: game.i18n.localize("Yes"),
					callback: ($html) => {
						const checkbox = $html[0].querySelector("input[name='clear-cache']");
						const clearCache = checkbox?.checked;
						this._restoreDefaults({ clearCache });
					}
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize("No"),
					callback: () => {}
				}
			},
			default: "no",
			close: () => {}
		});

		confirmationDialog.render(true);
	}

	/**
	 * Reset form handler
	 * @param {*} event
	 */
	_onResetForm(event) {
		const dialog = new Dialog({
			title: game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.ResetFormTitle"),
			content: game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.ResetFormContent"),
			buttons: {
				yes: {
					icon: '<i class="fa fa-check"></i>',
					label: game.i18n.localize("Yes"),
					callback: (event) => {
						this.map = this.initialMap;
						this.render();
					}
				},
				no: {
					icon: '<i class="fa fa-times"></i>',
					label: game.i18n.localize("No"),
					callback: (event) => {}
				}
			},
			default: "no"
		});
		dialog.render(true);
	}

	async _onDrop(event) {
		event.preventDefault();
		const eventData = TextEditor.getDragEventData(event);
		const link = await TextEditor.getContentLink(eventData);
		if (link) {
			const targetInput = event.currentTarget.querySelector("input");
			targetInput.value = eventData.uuid;
			return targetInput.dispatchEvent(new Event("change"));
		}
		return ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.ConditionLab.BadReference"));
	}

	/**
	 * Macro Config button click handler
	 * @param {*} event
	 */
	_onClickMacroConfig(event) {
		const rowLi = event.target.closest("li");
		const conditionId = rowLi ? rowLi.dataset.conditionId : null;

		if (!conditionId) return;

		const condition = this.map.find((c) => c.id === conditionId);

		new EnhancedConditionMacroConfig(condition).render(true);
	}

	/**
	 * Trigger Config button click handler
	 * @param {*} event
	 */
	_onClickTriggerConfig(event) {
		const rowLi = event.target.closest("li");
		const conditionId = rowLi ? rowLi.dataset.conditionId : null;

		if (!conditionId) return;

		const condition = this.map.find((c) => c.id === conditionId);

		new EnhancedConditionTriggerConfig(condition).render(true);
	}

	/**
	 * Option Config button click handler
	 * @param {*} event
	 */
	_onClickOptionConfig(event) {
		const rowLi = event.target.closest("li");
		const conditionId = rowLi ? rowLi.dataset.conditionId : null;

		if (!conditionId) return;

		const condition = this.map.find((c) => c.id === conditionId);

		const config = new EnhancedConditionOptionConfig(condition);
		config.parent = this;
		config.render(true);
	}

	// Checks the updatedMap property against the initial map
	_hasMapChanged() {
		let hasChanged = false;
		const conditionMap = this.updatedMap;

		conditionMap.forEach((entry, index, array) => {
			// Check if the row exists in the saved map
			const existingEntry = this.initialMap.find((e) => e.id === entry.id) ?? null;
			entry.isNew = !existingEntry;

			// If row is new or if its index has changed, it is also changed
			entry.isChanged = entry.isNew || index !== this.initialMap?.indexOf(existingEntry);

			// If it's not changed, check if the compared entries are equal
			if (!entry.isChanged) {
				entry.isChanged = !foundry.utils.isEmpty(foundry.utils.diffObject(existingEntry, entry));
				hasChanged ||= entry.isChanged;
			}
		});

		return hasChanged;
	}

	_hasEntryChanged(entry, existingEntry) {
		const propsToCheck = [
			"name",
			"img",
			"options",
			"reference",
			"applyTrigger",
			"removeTrigger",
			"activeEffect"
		];
		return propsToCheck.some((p) => this._hasPropertyChanged(p, existingEntry, entry));
	}

	/**
	 * Checks a given propertyName on an original and comparison object to see if it has changed
	 * @param {*} propertyName
	 * @param {*} original
	 * @param {*} comparison
	 * @returns {boolean}
	 */
	_hasPropertyChanged(propertyName, original, comparison) {
		const originalValue = original?.[propertyName];
		const comparisonValue = comparison?.[propertyName];
		return (originalValue && !comparisonValue)
			|| (original && JSON.stringify(originalValue) !== JSON.stringify(comparisonValue));
	}

	_onEditImage(event) {
		const current = event.target.getAttribute("src");
		const fp = new FilePicker({
			current,
			type: "image",
			callback: (path) => {
				event.currentTarget.src = path;
				const iconPath = event.target.closest(".content1").querySelector(".icon-path");
				iconPath.value = path;
				this.map = this.updatedMap;
				if (this._hasMapChanged()) this.render();
			},
			top: this.position.top + 40,
			left: this.position.left + 10
		});
		return fp.browse();
	}
}
