/* -------------------------------------------- */
/*                    Imports                   */
/* -------------------------------------------- */
import { libWrapper } from "./libWrapper.js";
import { registerSettings } from "./settings.js";
import { Sidekick } from "./sidekick.js";

/* ------------------ Gadgets ----------------- */

import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

/* ------------------- Utils ------------------ */

import { ConditionLab } from "./enhanced-conditions/condition-lab.js";
import { TrigglerForm } from "./triggler/triggler-form.js";
import { Triggler } from "./triggler/triggler.js";

/* -------------------------------------------- */
/*                    System                    */
/* -------------------------------------------- */

/* ------------------- Init ------------------- */

Hooks.on("i18nInit", () => {
	registerSettings();

	// Assign the namespace Object if it already exists or instantiate it as an object if not
	game.clt = EnhancedConditions;
	ui.clt = {};

	// Execute housekeeping
	Sidekick.loadTemplates();

	// Keybinds
	game.keybindings.register("condition-lab-triggler", "openConditionLab", {
		name: "CLT.KEYBINDINGS.openConditionLab.name",
		onDown: () => {
			new ConditionLab().render(true);
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
	});
	game.keybindings.register("condition-lab-triggler", "openTriggler", {
		name: "CLT.KEYBINDINGS.openTriggler.name",
		onDown: () => {
			new TrigglerForm().render(true);
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
	});

	// Wrappers
	if (!game.modules.get("status-halo")?.active && !game.modules.get("illandril-token-hud-scale")?.active) {
		const effectSizes = {
			xLarge: {
				multiplier: 5,
				divisor: 2
			},
			large: {
				multiplier: 3.3,
				divisor: 3
			},
			medium: {
				multiplier: 2.5,
				divisor: 4
			},
			small: {
				multiplier: 2,
				divisor: 5
			}
		};
		libWrapper.register(
			"condition-lab-triggler",
			"Token.prototype._refreshEffects",
			function () {
				const effectSize = game.settings.get("condition-lab-triggler", "effectSize");
				// Use the default values if no setting found
				const { multiplier = 2, divisor = 5 } = effectSizes[effectSize];

				let i = 0;
				const size = Math.round(canvas.dimensions.size / 2 / 5) * multiplier;
				const rows = Math.floor(this.document.height * divisor);

				// Unchanged
				const bg = this.effects.bg.clear().beginFill(0x000000, 0.4)
					.lineStyle(1.0, 0x000000);
				for (const effect of this.effects.children) {
					if (effect === bg) continue;

					if (effect === this.effects.overlay) {
						const { width, height } = this.getSize();
						const size = Math.min(width * 0.6, height * 0.6);
						effect.width = effect.height = size;
						effect.position = this.getCenterPoint({ x: 0, y: 0 });
						effect.anchor.set(0.5, 0.5);
					} else {
						effect.width = effect.height = size;
						effect.x = Math.floor(i / rows) * size;
						effect.y = (i % rows) * size;
						bg.drawRoundedRect(effect.x + 1, effect.y + 1, size - 2, size - 2, 2);
						i++;
					}
				}
			},
			"OVERRIDE"
		);
	}
});

Hooks.on("ready", async () => {
	game.clt.CoreStatusEffects = foundry.utils.deepClone(CONFIG.statusEffects)
		.map((status) => {
			/** @deprecated since v12 */
			for (const [oldKey, newKey] of Object.entries({ label: "name", icon: "img" })) {
				const msg = `StatusEffectConfig#${oldKey} has been deprecated in favor of StatusEffectConfig#${newKey}`;
				Object.defineProperty(status, oldKey, {
					get() {
						foundry.utils.logCompatibilityWarning(msg, { since: 12, until: 14, once: true });
						return this[newKey];
					},
					set(value) {
						foundry.utils.logCompatibilityWarning(msg, { since: 12, until: 14, once: true });
						this[newKey] = value;
					},
					enumerable: false,
					configurable: true
				});
			}
			return status;
		});
	game.clt.CoreSpecialStatusEffects = foundry.utils.deepClone(CONFIG.specialStatusEffects);
	game.clt.supported = false;
	let defaultMaps = game.settings.get("condition-lab-triggler", "defaultConditionMaps");
	let conditionMap = game.settings.get("condition-lab-triggler", "activeConditionMap");

	const mapType = game.settings.get("condition-lab-triggler", "conditionMapType");

	// If there's no defaultMaps or defaultMaps doesn't include game system, check storage then set appropriately
	if (
		game.user.isGM
		&& (
			!defaultMaps
			|| Object.keys(defaultMaps).length === 0
			|| !Object.keys(defaultMaps).includes(game.system.id)
		)
	) {
		defaultMaps = await EnhancedConditions._loadDefaultMaps();
		game.settings.set("condition-lab-triggler", "defaultConditionMaps", defaultMaps);
	}

	// If map type is not set and a default map exists for the system, set maptype to default
	if (!mapType && defaultMaps instanceof Object && Object.keys(defaultMaps).includes(game.system.id)) {
		game.settings.set("condition-lab-triggler", "conditionMapType", "default");
	}

	// If there's no condition map, get the default one
	if (!conditionMap.length) {
		// Pass over defaultMaps since the storage version is still empty
		conditionMap = EnhancedConditions.getDefaultMap(defaultMaps);

		if (game.user.isGM && conditionMap.length) {
			game.settings.set("condition-lab-triggler", "activeConditionMap", conditionMap);
		}
	}

	// If map type is not set, now set to default
	if (!mapType && conditionMap.length) {
		game.settings.set("condition-lab-triggler", "conditionMapType", "default");
	}

	// Update status icons accordingly
	if (game.user.isGM) {
		// CONFIG.statusEffects
		// CONFIG.specialStatusEffects
	}
	// const specialStatusEffectMap = game.settings.get("condition-lab-triggler", "specialStatusEffectMapping");
	if (conditionMap.length) EnhancedConditions._updateStatusEffects(conditionMap);
	setInterval(EnhancedConditions.updateConditionTimestamps, 15000);

	// Save the active condition map to a convenience property
	game.clt.conditions = conditionMap;

	game.clt.supported = true;
});

/* -------------------------------------------- */
/*                    Entity                    */
/* -------------------------------------------- */

/* ------------------- Actor ------------------ */

Hooks.on("updateActor", (actor, updateData, options, userId) => {
	// Workaround for actor array returned in hook for non triggering clients
	if (game.userId !== userId) return;
	Triggler._processUpdate(actor, updateData, "system");
});

/* --------------- Active Effect -------------- */

Hooks.on("createActiveEffect", (effect, options, userId) => {
	if (!game.user.isGM || game.userId !== userId) return;
	EnhancedConditions._processActiveEffectChange(effect, "create");
});

Hooks.on("deleteActiveEffect", (effect, options, userId) => {
	if (!game.user.isGM || game.userId !== userId) return;
	EnhancedConditions._processActiveEffectChange(effect, "delete");
});

/* ------------------ Combat ------------------ */

Hooks.on("updateCombat", (combat, update, options, userId) => {
	const enableOutputCombat = game.settings.get("condition-lab-triggler", "conditionsOutputDuringCombat");
	const outputChatSetting = game.settings.get("condition-lab-triggler", "conditionsOutputToChat");
	const combatant = combat.combatant;

	if (
		!foundry.utils.hasProperty(update, "turn")
		|| !combatant
		|| !outputChatSetting
		|| !enableOutputCombat
		|| !game.user.isGM
	) {
		return;
	}

	const token = combatant.token;

	if (!token) return;

	const tokenConditions = EnhancedConditions.getConditions(token, { warn: false });
	let conditions = tokenConditions && tokenConditions.conditions ? tokenConditions.conditions : [];
	conditions = conditions instanceof Array ? conditions : [conditions];

	if (!conditions.length) return;

	const chatConditions = conditions.filter((c) => c.options?.outputChat);

	if (!chatConditions.length) return;

	EnhancedConditions.outputChatMessage(token, chatConditions, { type: "active" });
});

/* -------------- Scene Controls -------------- */
Hooks.on("getSceneControlButtons", function (hudButtons) {
	if (game.user.isGM && game.settings.get("condition-lab-triggler", "sceneControls")) {
		let hud = hudButtons.find((val) => val.name === "token");
		if (hud) {
			hud.tools.push({
				name: "CLT.ENHANCED_CONDITIONS.Lab.Title",
				title: "CLT.ENHANCED_CONDITIONS.Lab.Title",
				icon: "fas fa-flask",
				button: true,
				onClick: async () => new ConditionLab().render(true)
			});
			hud.tools.push({
				name: "Triggler",
				title: "Triggler",
				icon: "fas fa-exclamation",
				button: true,
				onClick: async () => new TrigglerForm().render(true)
			});
		}
	}
});

Hooks.on("renderSceneControls", (app, html, data) => {
	const trigglerButton = html.find('li[data-tool="Triggler"]')[0];
	if (trigglerButton) {
		trigglerButton.style.display = "inline-block";
		const exclamationMark = trigglerButton.children[0];
		exclamationMark.style.marginRight = "0px";
		const rightChevron = document.createElement("i");
		rightChevron.classList.add("fas", "fa-angle-right");
		rightChevron.style.marginRight = "0px";
		trigglerButton.insertBefore(rightChevron, exclamationMark);
		const leftChevron = document.createElement("i");
		leftChevron.classList.add("fas", "fa-angle-left");
		exclamationMark.after(leftChevron);
	}
});

/* ------------------- Misc ------------------- */

Hooks.on("renderSettingsConfig", (app, html, data) => {
	const trigglerMenu = html.find("button[data-key=\"condition-lab-triggler.trigglerMenu\"]")[0];
	if (trigglerMenu) {
		const exclamationMark = trigglerMenu.children[0];
		exclamationMark.style.marginRight = "0px";
		const rightChevron = document.createElement("i");
		rightChevron.classList.add("fas", "fa-angle-right");
		rightChevron.style.marginRight = "0px";
		trigglerMenu.insertBefore(rightChevron, exclamationMark);
		const leftChevron = document.createElement("i");
		leftChevron.classList.add("fas", "fa-angle-left");
		exclamationMark.after(leftChevron);
	}
});

Hooks.on("renderMacroConfig", (app, html, data) => {
	const typeSelect = html.find("select[name='type']");
	const typeSelectDiv = typeSelect.closest("div");
	const flag = app.object.getFlag("condition-lab-triggler", "macroTrigger");
	const triggers = game.settings.get("condition-lab-triggler", "storedTriggers");

	const select = foundry.applications.fields.createSelectInput({
		name: "flags.condition-lab-triggler.macroTrigger",
		options: triggers,
		value: flag,
		blank: "CLT.ENHANCED_CONDITIONS.MacroConfig.NoTriggerSet",
		localize: true,
		sort: true,
		valueAttr: "id",
		labelAttr: "text"
	});

	typeSelectDiv.after($(`
		<div class="form-group">
			<label>${game.i18n.localize("CLT.Trigger")}</label>
			${select.outerHTML}
		</div>
	`));
});

/* ------------------- Chat ------------------- */

Hooks.on("renderChatLog", (app, html, data) => {
	EnhancedConditions.updateConditionTimestamps();
});

Hooks.on("renderChatMessage", (app, html, data) => {
	if (data.message.content && !data.message.content.match("enhanced-conditions")) {
		return;
	}

	const speaker = data.message.speaker;

	if (!speaker) return;

	const removeConditionAnchor = html.find("a[name='remove-row']");
	const undoRemoveAnchor = html.find("a[name='undo-remove']");

	/**
	 * @todo #284 move to chatlog listener instead
	 */
	removeConditionAnchor.on("click", (event) => {
		const conditionListItem = event.target.closest("li");
		const conditionName = conditionListItem.dataset.conditionName;
		const messageListItem = conditionListItem?.parentElement?.closest("li");
		const messageId = messageListItem?.dataset?.messageId;
		const message = messageId ? game.messages.get(messageId) : null;

		if (!message) return;

		const token = canvas.tokens.get(speaker.token);
		const actor = game.actors.get(speaker.actor);
		const entity = token ?? actor;

		if (!entity) return;

		EnhancedConditions.removeCondition(conditionName, entity, { warn: false });
	});

	undoRemoveAnchor.on("click", (event) => {
		const conditionListItem = event.target.closest("li");
		const conditionName = conditionListItem.dataset.conditionName;
		const messageListItem = conditionListItem?.parentElement?.closest("li");
		const messageId = messageListItem?.dataset?.messageId;
		const message = messageId ? game.messages.get(messageId) : null;

		if (!message) return;

		const speaker = message?.speaker;

		if (!speaker) return;

		const token = canvas.tokens.get(speaker.token);
		const actor = game.actors.get(speaker.actor);
		const entity = token ?? actor;

		if (!entity) return;

		EnhancedConditions.addCondition(conditionName, entity);
	});
});

Hooks.on("renderDialog", (app, html, data) => {
	switch (app.title) {
		case game.i18n.localize("CLT.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.Title"):
			ConditionLab._onRenderSaveDialog(app, html, data);
			break;

		case game.i18n.localize("CLT.ENHANCED_CONDITIONS.Lab.RestoreDefaultsTitle"):
			ConditionLab._onRenderRestoreDefaultsDialog(app, html, data);
			break;

		default:
			break;
	}
});

/* -------------- Combat Tracker -------------- */

Hooks.on("renderCombatTracker", (app, html, data) => {
	html.find("img[class='token-effect']").each((index, element) => {
		const url = new URL(element.src);
		const path = url?.pathname?.substring(1);
		const conditions = EnhancedConditions.getConditionsByIcon(path);
		const statusEffect = CONFIG.statusEffects.find((e) => e.img === path);

		if (conditions?.length) {
			element.title = conditions[0];
		} else if (statusEffect?.name) {
			element.title = game.i18n.localize(statusEffect.name);
		}
	});
});

/* ---------------- Custom Apps --------------- */

Hooks.on("renderConditionLab", (app, html, data) => {
	ConditionLab._onRender(app, html, data);
});
