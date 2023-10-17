import { Butler } from "./butler";
import { Sidekick } from "./sidekick";
import { Triggler } from "./triggler/triggler";

/**
 * Create a new API class and export it as default
 */
const API = {

  /**
   * Retrieve a registered trigger with id
   * @param {string} id the id of the trigger
   * @returns {Object} trigger The trigger.
   * @returns {string} [trigger.attribute] an optional string property
   * @returns {string} [trigger.category] an optional string property
   * @returns {boolean} [trigger.notZero] an optional boolean property
   * @returns {boolean} [trigger.npcOnly] an optional boolean property
   * @returns {boolean} [trigger.pcOnly] an optional boolean property
   * @returns {string} [trigger.operator] an optional string property
   * @returns {string} [trigger.property1] an optional string property
   * @returns {string} [trigger.property2] an optional string property
   * @returns {('simple'|'advanced')} [trigger.triggerType] an string property
   * @returns {string} [trigger.id] an optional string property
   * @returns {string} [trigger.value] an optional string property
   * @returns {string} [trigger.advancedName] Only with triggerType === 'advanced'
   */
  retrieveTriggler(id) {
    const triggers = Sidekick.getSetting(Butler.SETTING_KEYS.triggler?.triggers);
    const existingTrigger = triggers.find((t) => t.id && t.id === id);
    return existingTrigger;
  },

  /**
   * Check the specific trigger is hooked from this update
   * @param {Actor|Token|TokenDocument} entity the Actor or Token entity to reference
   * @param {string} id the id of the trigger
   * @param {Object} update the object update to check
   * @returns {boolean} the trigger is been evaluate positively or negatively
   */
  isTrigglerPositive(entity, id, update){
    if(!entity) {
      ui.notifications.warn(game.i18n.localize(`No entity is been passed`));
      return;
    }
    if(!id) {
      ui.notifications.warn(game.i18n.localize(`No trigger id is been passed`));
      return;
    }
    const trigger = this.retrieveTriggler(id);
    if(!trigger) {
      ui.notifications.warn(game.i18n.localize(`No trigger found with id '${id}'`));
      return;
    }
		const entityType =
			entity instanceof Actor
				? "Actor"
				: entity instanceof Token || entity instanceof TokenDocument
				? "Token"
				: null;

		if (!entityType) {
      ui.notifications.warn(game.i18n.localize(`No valid entity found for '${entity}'`));
			return;
		}

    const dataProp = `system`;
		const dataDataProp = `system`;

    const triggers = Triggler._prepareUpdate(entity, update, dataProp, dataDataProp, [trigger]);
    return triggers?.length > 0 ? true : false;

  },

  executeTriggler(entity, id) {
    if(!entity) {
      ui.notifications.warn(game.i18n.localize(`No entity is been passed`));
      return;
    }
    if(!id) {
      ui.notifications.warn(game.i18n.localize(`No trigger id is been passed`));
      return;
    }
    const trigger = this.retrieveTriggler(id);
    if(!trigger) {
      ui.notifications.warn(game.i18n.localize(`No trigger found with id '${id}'`));
      return;
    }
		const entityType =
			entity instanceof Actor
				? "Actor"
				: entity instanceof Token || entity instanceof TokenDocument
				? "Token"
				: null;

		if (!entityType) {
      ui.notifications.warn(game.i18n.localize(`No valid entity found for '${entity}'`));
			return;
		}

    const dataProp = `system`;
		const dataDataProp = `system`;

    Triggler._processUpdate(entity, update, dataProp, dataDataProp, [trigger]);
  },
  
  
};

export default API;
