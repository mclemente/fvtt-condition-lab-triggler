import { Butler as BUTLER } from "../butler.js";
import { EnhancedConditions } from "../enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "../sidekick.js";

export default class MigrationHelper {
	static async _onReady() {
		const cubVersion = game.modules.get(BUTLER.NAME)?.version;

		await EnhancedConditions._migrationHelper(cubVersion);
	}
}
