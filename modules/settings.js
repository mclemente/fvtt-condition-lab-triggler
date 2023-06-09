import { Butler as BUTLER } from "./butler.js";
import { ConditionLab } from "./enhanced-conditions/condition-lab.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "./sidekick.js";
import { TrigglerForm } from "./triggler/triggler-form.js";

export function registerSettings() {
	/* -------------------------------------------- */
	/*            Setting Configuration             */
	/* -------------------------------------------- */

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat, {
		name: "CLT.SETTINGS.EnhancedConditions.OutputChatN",
		hint: "CLT.SETTINGS.EnhancedConditions.OutputChatH",
		scope: "world",
		type: Boolean,
		config: true,
		default: BUTLER.DEFAULT_CONFIG.enhancedConditions.outputChat,
		onChange: (s) => {
			if (s === true) {
				const dialog = Dialog.confirm({
					title: game.i18n.localize(`CLT.ENHANCED_CONDITIONS.OutputChatConfirm.Title`),
					content: game.i18n.localize(`CLT.ENHANCED_CONDITIONS.OutputChatConfirm.Content`),
					yes: () => {
						const newMap = deepClone(game.cub.conditions);
						if (!newMap.length) return;
						newMap.forEach((c) => (c.options.outputChat = true));
						Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
					},
					no: () => {},
				});
			}
		},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputCombat, {
		name: "CLT.SETTINGS.EnhancedConditions.OutputCombatN",
		hint: "CLT.SETTINGS.EnhancedConditions.OutputCombatH",
		scope: "world",
		type: Boolean,
		config: true,
		default: BUTLER.DEFAULT_CONFIG.enhancedConditions.outputCombat,
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects, {
		name: "CLT.SETTINGS.EnhancedConditions.RemoveDefaultEffectsN",
		hint: "CLT.SETTINGS.EnhancedConditions.RemoveDefaultEffectsH",
		scope: "world",
		type: Boolean,
		config: true,
		default: BUTLER.DEFAULT_CONFIG.enhancedConditions.removeDefaultEffects,
		onChange: (s) => {
			EnhancedConditions._updateStatusEffects();
		},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.migrationVersion, {
		name: `CLT.SETTINGS.EnhancedConditions.MigrationVersionN`,
		hint: `CLT.SETTINGS.EnhancedConditions.MigrationVersionH`,
		scope: "world",
		type: String,
		config: false,
		apiOnly: true,
		default: BUTLER.DEFAULT_CONFIG.enhancedConditions.migrationVersion,
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.showSortDirectionDialog, {
		name: `CLT.SETTINGS.EnhancedConditions.ShowSortDirectionDialogN`,
		hint: `CLT.SETTINGS.EnhancedConditions.ShowSortDirectionDialogH`,
		scope: "world",
		type: Boolean,
		config: true,
		default: true,
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultSpecialStatusEffects, {
		name: `CLT.SETTINGS.EnhancedConditions.DefaultSpecialStatusEffectsN`,
		hint: `CLT.SETTINGS.EnhancedConditions.DefaultSpecialStatusEffectsH`,
		scope: "world",
		type: Object,
		default: {},
		config: false,
		onChange: () => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping, {
		name: `CLT.SETTINGS.EnhancedConditions.SpecialStatusEffectMappingN`,
		hint: `CLT.SETTINGS.EnhancedConditions.SpecialStatusEffectMappingH`,
		scope: "world",
		type: Object,
		default: {},
		config: false,
		onChange: () => {},
	});

	/* -------------------------------------------- */
	/*              EnhancedConditions              */
	/* -------------------------------------------- */

	Sidekick.registerMenu(BUTLER.SETTING_KEYS.enhancedConditions.menu, {
		name: "CLT.ENHANCED_CONDITIONS.Lab.Title",
		label: "CLT.ENHANCED_CONDITIONS.Lab.Title",
		hint: "CLT.ENHANCED_CONDITIONS.Lab.Hint",
		icon: "fas fa-flask",
		type: ConditionLab,
		restricted: true,
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons, {
		name: "CLT.SETTINGS.EnhancedConditions.CoreIconsN",
		hint: "CLT.SETTINGS.EnhancedConditions.CoreIconsH",
		scope: "world",
		type: Object,
		default: [],
		config: false,
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects, {
		name: "CLT.SETTINGS.EnhancedConditions.CoreEffectsN",
		hint: "CLT.SETTINGS.EnhancedConditions.CoreEffectsH",
		scope: "world",
		type: Object,
		default: [],
		config: false,
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, {
		name: "CLT.SETTINGS.EnhancedConditions.MapTypeN",
		hint: "CLT.SETTINGS.EnhancedConditions.MapTypeH",
		scope: "world",
		type: String,
		default: "",
		choices: BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes,
		config: false,
		apiOnly: true,
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps, {
		name: "CLT.SETTINGS.EnhancedConditions.DefaultMapsN",
		hint: "CLT.SETTINGS.EnhancedConditions.DefaultMapsH",
		scope: "world",
		type: Object,
		default: {},
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, {
		name: "CLT.SETTINGS.EnhancedConditions.ActiveConditionMapN",
		hint: "CLT.SETTINGS.EnhancedConditions.ActiveConditionMapH",
		scope: "world",
		type: Object,
		default: [],
		onChange: async (conditionMap) => {
			await EnhancedConditions._updateStatusEffects(conditionMap);

			// Save the active condition map to a convenience property
			if (game.cub) {
				game.cub.conditions = conditionMap;
			}
		},
	});

	/* -------------------------------------------- */
	/*                 TokenUtility                 */
	/* -------------------------------------------- */

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.effectSize, {
		name: "CLT.SETTINGS.TokenUtility.TokenEffectSizeN",
		hint: "CLT.SETTINGS.TokenUtility.TokenEffectSizeH",
		default: "small",
		scope: "client",
		type: String,
		choices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices,
		config: true,
		onChange: (s) => {
			canvas.draw();
		},
	});

	/* -------------------------------------------- */
	/*                    Triggler                  */
	/* -------------------------------------------- */

	Sidekick.registerMenu(BUTLER.SETTING_KEYS.triggler.menu, {
		name: "CLT.SETTINGS.Triggler.TriggersN",
		label: "CLT.SETTINGS.Triggler.TriggersN",
		hint: "CLT.SETTINGS.Triggler.TriggersH",
		icon: "fas fa-exclamation",
		type: TrigglerForm,
		restricted: true,
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.triggler.triggers, {
		name: "CLT.SETTINGS.Triggler.TriggersN",
		hint: "CLT.SETTINGS.Triggler.TriggersH",
		scope: "world",
		type: Object,
		default: [],
		onChange: (s) => {},
	});

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.migration.hasRunMigration, {
		scope: "world",
		type: Boolean,
		default: false,
	});

	/* -------------------------------------------- */

	Sidekick.registerSetting(BUTLER.SETTING_KEYS.sceneControls, {
		name: "CLT.SETTINGS.SceneControls.Name",
		hint: "CLT.SETTINGS.SceneControls.Hint",
		scope: "world",
		type: Boolean,
		default: false,
		config: true,
		requiresReload: true,
	});
}
