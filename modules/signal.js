/* -------------------------------------------- */
/*                    Imports                   */
/* -------------------------------------------- */
import * as BUTLER from "./butler.js";
import { registerSettings } from "./settings.js";
import { Sidekick } from "./sidekick.js";

/* ------------------ Gadgets ----------------- */

import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

/* ------------------- Utils ------------------ */

import { ConditionLab } from "./enhanced-conditions/condition-lab.js";
import { Triggler } from "./triggler/triggler.js";
import MigrationHelper from "./utils/migration.js";

/* -------------------------------------------- */
/*                     Class                    */
/* -------------------------------------------- */

/**
 * Initiates module classes (and shines a light on the dark night sky)
 */
export class Signal {
	/**
	 * Registers hooks
	 */
	static lightUp() {
		/* -------------------------------------------- */
		/*                    System                    */
		/* -------------------------------------------- */

		/* ------------------- Init/Ready ------------------- */

		Hooks.on("init", () => {
			// Assign the namespace Object if it already exists or instantiate it as an object if not
			game.cub = game.cub ?? {};
			ui.cub = ui.cub ?? {};

			// Execute housekeeping
			Sidekick.handlebarsHelpers();
			Sidekick.jQueryHelpers();
			Sidekick.loadTemplates();
			registerSettings();

			// Instantiate gadget classes
			game.cub.enhancedConditions = new EnhancedConditions();
			// Wrappers
			libWrapper.register(
				"condition-lab-triggler",
				"Token.prototype._refreshEffects",
				function () {
					const effectSize = Sidekick.getSetting(BUTLER.SETTING_KEYS.tokenUtility.effectSize);
					// Use the default values if no setting found
					const multiplier = effectSize
						? BUTLER.DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].multiplier
						: 2;
					const divisor = effectSize ? BUTLER.DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].divisor : 5;

					let i = 0;
					const w = Math.round(canvas.dimensions.size / 2 / 5) * multiplier;
					const rows = Math.floor(this.document.height * divisor);

					// Unchanged
					const bg = this.effects.bg.clear().beginFill(0x000000, 0.4).lineStyle(1.0, 0x000000);
					for (const effect of this.effects.children) {
						if (effect === bg) continue;

						// Overlay effect
						if (effect === this.effects.overlay) {
							const size = Math.min(this.w * 0.6, this.h * 0.6);
							effect.width = effect.height = size;
							effect.position.set((this.w - size) / 2, (this.h - size) / 2);
						}

						// Status effect
						else {
							effect.width = effect.height = w;
							effect.x = Math.floor(i / rows) * w;
							effect.y = (i % rows) * w;
							bg.drawRoundedRect(effect.x + 1, effect.y + 1, w - 2, w - 2, 2);
							i++;
						}
					}
				},
				"OVERRIDE"
			);

			// Expose API methods
			game.cub.getCondition = EnhancedConditions.getCondition;
			game.cub.getConditions = EnhancedConditions.getConditions;
			game.cub.getConditionEffects = EnhancedConditions.getConditionEffects;
			game.cub.hasCondition = EnhancedConditions.hasCondition;
			game.cub.applyCondition = EnhancedConditions.applyCondition;
			game.cub.addCondition = EnhancedConditions.addCondition;
			game.cub.removeCondition = EnhancedConditions.removeCondition;
			game.cub.removeAllConditions = EnhancedConditions.removeAllConditions;
		});

		Hooks.on("ready", () => {
			EnhancedConditions._onReady();
			MigrationHelper._onReady();
		});

		/* -------------------------------------------- */
		/*                    Entity                    */
		/* -------------------------------------------- */

		/* ------------------- Actor ------------------ */

		Hooks.on("updateActor", (actor, updateData, options, userId) => {
			// Workaround for actor array returned in hook for non triggering clients
			if (actor instanceof Collection) {
				actor = actor.contents.find((a) => a.id === update.id);
			}
			Triggler._onUpdateActor(actor, updateData, options, userId);
		});

		Hooks.on("createActiveEffect", (effect, options, userId) => {
			EnhancedConditions._onCreateActiveEffect(effect, options, userId);
		});

		Hooks.on("deleteActiveEffect", (effect, options, userId) => {
			EnhancedConditions._onDeleteActiveEffect(effect, options, userId);
		});

		/* ------------------- Token ------------------ */

		Hooks.on("preUpdateToken", (tokenDocument, updateData, options, userId) => {
			EnhancedConditions._onPreUpdateToken(tokenDocument, updateData, options, userId);
		});

		Hooks.on("updateToken", (tokenDocument, updateData, options, userId) => {
			EnhancedConditions._onUpdateToken(tokenDocument, updateData, options, userId);
			Triggler._onUpdateToken(tokenDocument, updateData, options, userId);
		});

		/* ------------------ Combat ------------------ */

		Hooks.on("updateCombat", (combat, updateData, options, userId) => {
			EnhancedConditions._onUpdateCombat(combat, updateData, options, userId);
		});

		/* -------------------------------------------- */
		/*                    Render                    */
		/* -------------------------------------------- */

		/* ------------------- Misc ------------------- */

		Hooks.on("renderSettingsConfig", (app, html, data) => {
			const trigglerMenu = html.find(`button[data-key="condition-lab-triggler.trigglerMenu"]`)[0];
			const exclamationMark = trigglerMenu.children[0];
			exclamationMark.style.marginRight = "0px";
			const rightChevron = document.createElement("i");
			rightChevron.classList.add("fas", "fa-angle-right");
			rightChevron.style.marginRight = "0px";
			trigglerMenu.insertBefore(rightChevron, exclamationMark);
			const leftChevron = document.createElement("i");
			leftChevron.classList.add("fas", "fa-angle-left");
			exclamationMark.after(leftChevron);
		});

		Hooks.on("renderMacroConfig", (app, html, data) => {
			Triggler._onRenderMacroConfig(app, html, data);
		});

		/* ------------------- Chat ------------------- */

		Hooks.on("renderChatLog", (app, html, data) => {
			EnhancedConditions._onRenderChatLog(app, html, data);
		});

		Hooks.on("renderChatMessage", (app, html, data) => {
			EnhancedConditions._onRenderChatMessage(app, html, data);
		});

		Hooks.on("renderDialog", (app, html, data) => {
			switch (app.title) {
				case game.i18n.localize(`CLT.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.Title`):
					ConditionLab._onRenderSaveDialog(app, html, data);
					break;

				case game.i18n.localize(`CLT.ENHANCED_CONDITIONSLab.RestoreDefaultsTitle`):
					ConditionLab._onRenderRestoreDefaultsDialog(app, html, data);
					break;

				default:
					break;
			}
		});

		/* -------------- Combat Tracker -------------- */

		Hooks.on("renderCombatTracker", (app, html, data) => {
			EnhancedConditions._onRenderCombatTracker(app, html, data);
		});

		/* ---------------- Custom Apps --------------- */

		Hooks.on("renderConditionLab", (app, html, data) => {
			ConditionLab._onRender(app, html, data);
		});
	}
}
