import { Butler as BUTLER } from "../butler.js";
import { EnhancedConditions } from "../enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "../sidekick.js";

export default class MigrationHelper {
	static async _onReady() {
		const cubVersion = game.modules.get(BUTLER.NAME)?.version;

		await EnhancedConditions._migrationHelper(cubVersion);
	}

	static _importFromCUB() {
		if (
			game.user.isGM &&
			!Sidekick.getSetting(BUTLER.SETTING_KEYS.migration.hasRunMigration) &&
			(game.modules.has("combat-utility-belt") ||
				game.settings.storage.get("world").find((setting) => setting.key.includes("combat-utility-belt")))
		) {
			Dialog.confirm({
				title: game.i18n.localize(`CLT.MIGRATION.Title`),
				content: game.i18n.localize(`CLT.MIGRATION.Content`),
				yes: () => {
					const CUB_SETTINGS = {};
					game.settings.storage
						.get("world")
						.filter((setting) => setting.key.includes("combat-utility-belt"))
						.forEach((setting) => {
							CUB_SETTINGS[setting.key.replace("combat-utility-belt.", "")] = setting.value;
						});
					if (CUB_SETTINGS["activeConditionMap"]) {
						CUB_SETTINGS["activeConditionMap"].forEach((status) => {
							if (status.icon.includes("/combat-utility-belt/")) {
								status.icon = status.icon.replace("/combat-utility-belt/", `/${BUTLER.NAME}/`);
							}
						});
					}
					if (CUB_SETTINGS["defaultConditionMaps"]) {
						Object.keys(CUB_SETTINGS["defaultConditionMaps"]).forEach((map) => {
							CUB_SETTINGS["defaultConditionMaps"][map].forEach((status) => {
								if (status.icon.includes("/combat-utility-belt/")) {
									status.icon = status.icon.replace("/combat-utility-belt/", `/${BUTLER.NAME}/`);
								}
								if (status.referenceId.includes("combat-utility-belt")) {
									status.referenceId = status.referenceId.replace(
										"combat-utility-belt",
										`${BUTLER.NAME}`
									);
								}
							});
						});
					}
					const listOfSettings = [
						"activeConditionMap",
						"activeSystem",
						"conditionMapType",
						"conditionsOutputDuringCombat",
						"conditionsOutputToChat",
						"coreStatusEffects",
						"coreStatusIcons",
						"defaultConditionMaps",
						"defaultSpecialStatusEffects",
						"effectSize",
						"removeDefaultEffects",
						"showSortDirectionDialog",
						"specialStatusEffectMapping",
						"storedTriggers",
					];
					listOfSettings.forEach((setting) => {
						if (CUB_SETTINGS[setting]) Sidekick.setSetting(setting, CUB_SETTINGS[setting]);
					});
					Sidekick.setSetting(BUTLER.SETTING_KEYS.migration.hasRunMigration, true);
				},
				no: () => {
					Sidekick.setSetting(BUTLER.SETTING_KEYS.migration.hasRunMigration, true);
				},
			});
		}
	}
}
