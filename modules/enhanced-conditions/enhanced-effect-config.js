import { Butler as BUTLER } from "../butler.js";

export default class EnhancedEffectConfig extends ActiveEffectConfig {
	/**
	 * Get data for template rendering
	 * @param {*} options
	 * @inheritdoc
	 */
	getData(options) {
		const effect = this.object.toObject();
		return {
			effect: effect, // Backwards compatibility
			data: this.object.toObject(),
			// Manually set effect type
			isActorEffect: true,
			isItemEffect: false,
			submitText: "EFFECT.Submit",
			modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
				obj[e[1]] = game.i18n.localize("EFFECT.MODE_" + e[0]);
				return obj;
			}, {}),
		};
	}

	/**
	 * Override default update object behaviour
	 * @param {*} formData
	 * @override
	 */
	async _updateObject(event, formData) {
		const conditionIdFlag = getProperty(
			this.object.flags,
			`${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`
		);
		if (!conditionIdFlag) return;

		// find the matching condition row
		const map = ui.clt?.conditionLab?.map;

		if (!map && !map.length) return;

		const conditionId = conditionIdFlag.replace(`${BUTLER.NAME}.`, "");
		const condition = map.find((c) => c.id === conditionId);

		if (!condition) return;

		// update the effect data

		condition.activeEffect = condition.activeEffect ? mergeObject(condition.activeEffect, formData) : formData;

		this.object.updateSource(formData);
		if (this._state == 2) await this.render();
		if (ui.clt.conditionLab) {
			ui.clt.conditionLab.map = ui.clt.conditionLab.updatedMap;
			//ui.clt.conditionLab.unsaved = true;
			ui.clt.conditionLab.render();
		}
	}
}
