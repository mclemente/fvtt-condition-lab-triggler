import { EnhancedConditions } from "../enhanced-conditions/enhanced-conditions.js";

export default class MigrationHelper {
	static async _onReady() {
		const cubVersion = game.modules.get("condition-lab-triggler")?.version;

		await EnhancedConditions._migrationHelper(cubVersion);
	}

	static _importFromCUB() {
		if (
			game.user.isGM
			&& !game.settings.get("condition-lab-triggler", "hasRunMigration")
			&& (game.modules.has("combat-utility-belt")
				|| game.settings.storage.get("world").find((setting) => setting.key.includes("combat-utility-belt")))
		) {
			Dialog.confirm({
				title: game.i18n.localize("CLT.MIGRATION.Title"),
				content: game.i18n.localize("CLT.MIGRATION.Content"),
				yes: () => {
					const CUB_SETTINGS = {};
					game.settings.storage
						.get("world")
						.filter((setting) => setting.key.includes("combat-utility-belt"))
						.forEach((setting) => {
							CUB_SETTINGS[setting.key.replace("combat-utility-belt.", "")] = setting.value;
						});
					if (CUB_SETTINGS.activeConditionMap) {
						CUB_SETTINGS.activeConditionMap.forEach((status) => {
							if (status.icon.includes("/combat-utility-belt/")) {
								status.icon = status.icon.replace("/combat-utility-belt/", "/condition-lab-triggler/");
							}
						});
					}
					if (CUB_SETTINGS.defaultConditionMaps) {
						Object.keys(CUB_SETTINGS.defaultConditionMaps).forEach((map) => {
							CUB_SETTINGS.defaultConditionMaps[map].forEach((status) => {
								if (status.icon.includes("/combat-utility-belt/")) {
									status.icon = status.icon.replace("/combat-utility-belt/", "/condition-lab-triggler/");
								}
								if (status.referenceId.includes("combat-utility-belt")) {
									status.referenceId = status.referenceId.replace(
										"combat-utility-belt",
										"condition-lab-triggler"
									);
								}
							});
						});
					}
					const listOfSettings = [
						"activeConditionMap",
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
						"storedTriggers"
					];
					listOfSettings.forEach((setting) => {
						if (CUB_SETTINGS[setting]) game.settings.set("condition-lab-triggler", setting, CUB_SETTINGS[setting]);
					});
					game.settings.set("condition-lab-triggler", "hasRunMigration", true);
				},
				no: () => {
					game.settings.set("condition-lab-triggler", "hasRunMigration", true);
				}
			});
		}
	}
}
