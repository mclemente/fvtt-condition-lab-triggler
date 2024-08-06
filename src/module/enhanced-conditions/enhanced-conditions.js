import { Sidekick } from "../sidekick.js";

/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export class EnhancedConditions {
	conditions = null;

	conditionMapType = "default";

	get enhancedConditions() {
		return this;
	}

	/* -------------------------------------------- */
	/*                    Workers                   */
	/* -------------------------------------------- */

	/**
	 * Process the addition/removal of an Active Effect
	 * @param {ActiveEffect} effect  the effect
	 * @param {string} type  the type of change to process. "create" or "delete"
	 */
	static _processActiveEffectChange(effect, type = "create") {
		if (!(effect instanceof ActiveEffect)) return;

		const conditionId = effect.getFlag("condition-lab-triggler", "conditionId");
		const isDefault = !conditionId;
		const effectIds = conditionId ? [conditionId] : Array.from(effect.statuses);

		const conditions = effectIds.map((effectId) => ({
			...EnhancedConditions.lookupEntryMapping(effectId),
			effectId
		}));

		const toOutput = conditions.filter((condition) => (isDefault && game.settings.get("condition-lab-triggler", "defaultConditionsOutputToChat"))
			|| (game.settings.get("condition-lab-triggler", "conditionsOutputToChat") && condition?.options?.outputChat));
		const actor = effect.parent;

		if (toOutput.length) {
			EnhancedConditions.outputChatMessage(actor, toOutput, { type: type === "delete" ? "removed" : "added" });
		}

		if (isDefault) return;
		// If not default we only have one condition.
		const condition = conditions[0];
		let macros = [];

		switch (type) {
			case "create":
				macros = condition.macros?.filter((m) => m.type === "apply");
				if (condition.options?.removeOthers) EnhancedConditions._removeOtherConditions(actor, condition.id);
				if (condition.options?.markDefeated) EnhancedConditions._toggleDefeated(actor, { markDefeated: true });

				break;

			case "delete":
				macros = condition.macros?.filter((m) => m.type === "remove");
				if (condition.options?.markDefeated) EnhancedConditions._toggleDefeated(actor, { markDefeated: false });
				break;

			default:
				break;
		}

		const macroIds = macros?.length ? macros.filter((m) => m.id).map((m) => m.id) : null;

		if (macroIds?.length) EnhancedConditions._processMacros(macroIds, actor);
	}

	/**
	 * Checks statusEffect icons against map and returns matching condition mappings
	 * @param {string[] | string} effectIds  A list of effectIds, or a single effectId to check
	 * @returns {string[] | string | undefined}
	 */
	static lookupEntryMapping(effectIds) {
		if (!(effectIds instanceof Array)) {
			effectIds = [effectIds];
		}

		const conditionEntries = EnhancedConditions.getConditionsMap().filter((row) =>
			effectIds.includes(row.id ?? Sidekick.generateUniqueSlugId(row.name))
		);

		if (conditionEntries.length === 0) return;

		return conditionEntries.length > 1 ? conditionEntries : conditionEntries.shift();
	}

	/**
	 * Output one or more condition entries to chat
	 * @param {Actor|Token} entity
	 * @param {Array<Condition>} entries
	 * @param {object} options
	 * @param {string} options.type	"added", "removed", or "active"
	 * @todo refactor to use actor or token
	 */
	static async outputChatMessage(entity, entries, options = { type: "active" }) {
		const isActorEntity = entity instanceof Actor;
		// Turn a single condition mapping entry into an array
		entries = entries instanceof Array ? entries : [entries];

		if (!entity || !entries.length) return;

		const type = {};

		switch (options.type) {
			case "added":
				type.added = true;
				type.title = game.i18n.localize("CLT.ENHANCED_CONDITIONS.ChatCard.Title.Added");
				break;

			case "removed":
				type.removed = true;
				type.title = game.i18n.localize("CLT.ENHANCED_CONDITIONS.ChatCard.Title.Removed");
				break;

			case "active":
			default:
				type.active = true;
				type.title = game.i18n.localize("CLT.ENHANCED_CONDITIONS.ChatCard.Title.Active");
				break;
		}

		const chatUser = game.userId;
		// const token = token || this.currentToken;
		const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;
		const speaker = isActorEntity
			? ChatMessage.getSpeaker({ actor: entity })
			: ChatMessage.getSpeaker({ token: entity });
		const timestamp = type.active ? null : Date.now();

		// iterate over the entries and mark any with references and flags for use in the template
		const conditions = entries.map(({ reference, referenceId: rId, ...e }) => {
			let referenceId = rId;
			if (!rId && reference) {
				referenceId = `@UUID[${reference}]`;
			}
			if (referenceId && !referenceId.match(/\{.+\}/)) {
				referenceId = `${referenceId}{${e.name}}`;
			}
			const isDefault = !e.options;
			return ({
				...e,
				referenceId,
				hasReference: !!referenceId,
				hasButtons: !isDefault
					&& game.user.isGM
			});
		});

		// if the last message Enhanced conditions, append instead of making a new one
		const lastMessage = game.messages.contents[game.messages.contents.length - 1];
		const lastMessageSpeaker = lastMessage?.speaker;
		const sameSpeaker = isActorEntity
			? lastMessageSpeaker?.actor === speaker.actor
			: lastMessageSpeaker?.token === speaker.token;

		// hard code the recent timestamp to 30s for now
		const recentTimestamp = Date.now() <= (lastMessage?.timestamp ?? 0) + 30000;
		const enhancedConditionsDiv = lastMessage?.content.match("enhanced-conditions");

		if (!type.active && enhancedConditionsDiv && sameSpeaker && recentTimestamp) {
			let newContent = "";
			for (const condition of conditions) {
				const newRow = await renderTemplate(
					"modules/condition-lab-triggler/templates/partials/chat-card-condition-list.hbs",
					{ condition, type, timestamp }
				);
				newContent += newRow;
			}
			const existingContent = lastMessage.content;
			const ulEnd = existingContent?.indexOf("</ul>");
			if (!ulEnd) return;
			const content = existingContent.slice(0, ulEnd) + newContent + existingContent.slice(ulEnd);
			await lastMessage.update({ content });
			EnhancedConditions.updateConditionTimestamps();
			ui.chat.scrollBottom();
		} else {
			const chatCardHeading = game.i18n.localize(
				type.active ? "CLT.ENHANCED_CONDITIONS.ChatCard.HeadingActive" : "CLT.ENHANCED_CONDITIONS.ChatCard.Heading"
			);

			const templateData = {
				chatCardHeading,
				type,
				timestamp,
				entityId: entity.id,
				alias: speaker.alias,
				conditions,
				isOwner: entity.isOwner || game.user.isGM
			};

			const content = await renderTemplate(
				"modules/condition-lab-triggler/templates/chat-conditions.hbs",
				templateData
			);

			await ChatMessage.create({
				speaker,
				content,
				type: chatType,
				user: chatUser
			});
		}
	}

	/**
	 * Marks a Combatants for a particular entity as defeated
	 * @param {Actor | Token} entities  the entity to mark defeated
	 * @param {object} options
	 * @param {boolean} options.markDefeated  an optional state flag (default=true)
	 */
	static _toggleDefeated(entities, { markDefeated = true } = {}) {
		const combat = game.combat;

		if (!entities) {
			// First check for any controlled tokens
			if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
			else if (game.user.character) entities = game.user.character;
		}

		if (!entities) {
			return;
		}

		entities = entities instanceof Array ? entities : [entities];

		const tokens = entities.flatMap((e) =>
			e instanceof Token || e instanceof TokenDocument ? e : e instanceof Actor ? e.getActiveTokens() : null
		);

		const updates = [];

		// loop through tokens, and if there's matching combatants, add them to the update
		for (const token of tokens) {
			const combatants = combat
				? combat.combatants?.contents?.filter((c) => c.tokenId === token.id && c.defeated !== markDefeated)
				: [];

			if (!combatants.length) return;

			const update = combatants.map((c) => {
				return {
					_id: c.id,
					defeated: markDefeated
				};
			});

			updates.push(update);
		}

		if (!updates.length) return;

		// update all combatants at once
		combat.updateEmbeddedDocuments("Combatant", updates.length > 1 ? updates : updates.shift());
	}

	/**
	 * For a given entity, removes conditions other than the one supplied
	 * @param {*} entity
	 * @param {*} conditionId
	 */
	static async _removeOtherConditions(entity, conditionId) {
		const entityConditions = EnhancedConditions.getConditions(entity, { warn: false });
		let conditions = entityConditions ? entityConditions.conditions : [];
		conditions = conditions instanceof Array ? conditions : [conditions];

		if (!conditions.length) return;

		const removeConditions = conditions.filter((c) => c.id !== conditionId);

		if (!removeConditions.length) return;

		for (const c of removeConditions) await EnhancedConditions.removeCondition(c.name, entity, { warn: true });
	}

	/**
	 * Process macros based on given Ids
	 * @param {*} macroIds
	 * @param {*} entity
	 */
	static async _processMacros(macroIds, entity = null) {
		const scope = {};
		if (entity instanceof Token || entity instanceof TokenDocument) {
			scope.token = entity;
		} else if (entity instanceof Actor) {
			scope.actor = entity;
		}

		for (const macroId of macroIds) {
			const macro = game.macros.get(macroId);
			if (!macro) continue;

			await macro.execute(scope);
		}
	}

	/**
	 * Update condition added/removed timestamps
	 */
	static updateConditionTimestamps() {
		const conditionRows = document.querySelectorAll("ol#chat-log ul.condition-list li");
		for (const li of conditionRows) {
			const timestamp =
				typeof li.dataset.timestamp === "string" ? parseInt(li.dataset.timestamp) : li.dataset.timestamp;
			const iconSpanWrapper = li.querySelector("span.add-remove-icon");

			if (!timestamp || !iconSpanWrapper) continue;

			const type = li.dataset.changeType;
			iconSpanWrapper.title = `${type} ${foundry.utils.timeSince(timestamp)}`;
		}
	}

	/* -------------------------------------------- */
	/*                    Helpers                   */
	/* -------------------------------------------- */

	/**
	 * Returns the default maps supplied with the module
	 * @todo: map to entryId and then rebuild on import
	 * @returns {Promise<object[]>}
	 */
	static async _loadDefaultMaps() {
		const path = "modules/condition-lab-triggler/condition-maps";
		const jsons = await Sidekick.fetchJsons("data", path);

		const defaultMaps = jsons
			.filter((j) => !j.system.includes("example"))
			.reduce((obj, current) => {
				obj[current.system] = current.map;
				return obj;
			}, {});

		return defaultMaps;
	}

	/**
	 * Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible
	 * @param {*} conditionMap
	 * @returns {object[]}
	 */
	static _prepareMap(conditionMap) {
		const preparedMap = [];

		if (!conditionMap || !conditionMap?.length) {
			return preparedMap;
		}

		const outputChatSetting = game.settings.get("condition-lab-triggler", "conditionsOutputToChat");
		conditionMap = conditionMap.filter((c) => c.name && c.id);

		// Iterate through the map validating/preparing the data
		for (const condition of conditionMap) {
			condition.options = condition.options || {};
			if (condition.options.outputChat === undefined) condition.options.outputChat = outputChatSetting;
			preparedMap.push(condition);
		}

		return preparedMap;
	}

	/**
	 * Creates journal entries for any conditions that don't have one
	 * @param {string} condition the condition being evaluated
	 * @returns {*}
	 */
	static async _createJournalEntry(condition) {
		return await JournalEntry.create(
			{
				name: condition,
				permission: {
					default: CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED
				}
			},
			{
				displaySheet: false
			}
		);
	}

	static getConditionsMap() {
		let conditions = game.settings.get("condition-lab-triggler", "activeConditionMap");
		if (!game.settings.get("condition-lab-triggler", "removeDefaultEffects")) {
			conditions = conditions.concat(game.clt.CoreStatusEffects);
		}
		return conditions;
	}

	/**
	 * Gets one or more conditions from the map by their name
	 * @param {string} conditionName  the condition to get
	 * @returns {string[] | string | undefined}
	 */
	static _lookupConditionByName(conditionName) {
		if (!conditionName) return;

		conditionName = conditionName instanceof Array ? conditionName : [conditionName];

		const conditions = EnhancedConditions.getConditionsMap().filter((c) => conditionName.includes(c.name)) ?? [];
		if (!conditions.length) return;

		return conditions.length > 1 ? conditions : conditions.shift();
	}

	/**
	 * Updates the CONFIG.statusEffect effects with Condition Map ones
	 * @param {*} conditionMap
	 */
	static _updateStatusEffects(conditionMap) {
		const removeDefaultEffects = game.settings.get("condition-lab-triggler", "removeDefaultEffects");
		const activeConditionMap = conditionMap || game.settings.get("condition-lab-triggler", "activeConditionMap");

		if (!removeDefaultEffects && !activeConditionMap) {
			return;
		}

		const activeConditionEffects = EnhancedConditions._prepareStatusEffects(activeConditionMap);

		if (removeDefaultEffects) {
			CONFIG.statusEffects = activeConditionEffects ?? [];
		} else if (activeConditionMap instanceof Array) {
			// add the icons from the condition map to the status effects array
			const coreEffects =
				CONFIG.defaultStatusEffects || game.clt.CoreStatusEffects;

			// Create a Set based on the core status effects and the Enhanced Condition effects. Using a Set ensures unique icons only
			CONFIG.statusEffects = coreEffects.concat(activeConditionEffects);
		}
	}

	/**
	 * Converts the given Condition Map (one or more Conditions) into a Status Effects array or object
	 * @param {object[] | object} conditionMap
	 * @returns {object[]} statusEffects
	 */
	static _prepareStatusEffects(conditionMap) {
		conditionMap = conditionMap instanceof Array ? conditionMap : [conditionMap];
		if (!conditionMap.length) return [];

		const existingIds = conditionMap.filter((c) => c.id).map((c) => c.id);

		const statusEffects = conditionMap.map((c) => {
			const id = c.id || Sidekick.createId(existingIds);
			const { activeEffect, duration, img, name, options } = c;

			return {
				id,
				statuses: [id],
				name,
				img,
				changes: activeEffect?.changes || [],
				description: activeEffect?.description || "",
				duration: duration || activeEffect?.duration || {},
				flags: {
					...activeEffect?.flags,
					core: {
						overlay: options?.overlay ?? false
					},
					"condition-lab-triggler": {
						conditionId: id
					}
				},
				get icon() {
					return this.img;
				},
				get label() {
					return this.name;
				},
				set label(value) {
					this.name = value;
				}
			};
		});

		return statusEffects;
	}

	/**
	 * Prepares one or more ActiveEffects from Conditions for placement on an actor
	 * @param {object[] | object} effects  a single ActiveEffect data object or an array of ActiveEffect data objects
	 * @returns {object[]}
	 */
	static _prepareActiveEffects(effects) {
		effects = effects instanceof Array ? effects : [effects];
		if (!effects) return [];

		for (const effect of effects) {
			const overlay = foundry.utils.getProperty(effect, "flags.condition-lab-triggler.core.overlay");
			// If the parent Condition for the ActiveEffect defines it as an overlay, mark the ActiveEffect as an overlay
			if (overlay) {
				effect.flags.core.overlay = overlay;
			}
		}

		return effects;
	}

	/**
	 * Retrieves a condition name by its mapped icon
	 * @param {*} icon
	 * @returns {string[]}
	 */
	static getConditionsByIcon(icon) {
		const conditionMap = game.settings.get("condition-lab-triggler", "activeConditionMap");

		if (!conditionMap || !icon) {
			return [];
		}

		if (conditionMap instanceof Array && conditionMap.length) {
			const filteredIcons = conditionMap.filter((c) => c.icon === icon).map((c) => c.name);
			if (!filteredIcons.length) {
				return [];
			}
			return filteredIcons;
		}

		return [];
	}

	/**
	 * Parses a condition map JSON and returns a map
	 * @param {*} json
	 * @returns {object[]}
	 */
	static mapFromJson(json) {
		if (json.system !== game.system.id) {
			ui.notifications.warn(game.i18n.localize("CLT.ENHANCED_CONDITIONS.MapMismatch"));
		}

		const map = json.map ? EnhancedConditions._prepareMap(json.map) : [];

		return map;
	}

	/**
	 * Returns the default condition map for a given system
	 * @param {object} defaultMaps
	 * @returns {object}}
	 */
	static getDefaultMap(defaultMaps = null) {
		const system = game.system.id;
		defaultMaps =
			defaultMaps instanceof Object
				? defaultMaps
				: game.settings.get("condition-lab-triggler", "defaultConditionMaps");
		let defaultMap = defaultMaps[system] || [];

		if (!defaultMap.length) {
			defaultMap = EnhancedConditions.buildDefaultMap();
		}

		return defaultMap;
	}

	/**
	 * Builds a default map for a given system
	 * @todo #281 update for active effects
	 * @returns {object[]}
	 */
	static buildDefaultMap() {
		const coreEffectsSetting = game.clt.CoreStatusEffects;
		const coreEffects = coreEffectsSetting && coreEffectsSetting.length
			? coreEffectsSetting
			: foundry.utils.duplicate(CONFIG.statusEffects);
		return EnhancedConditions._prepareMap(coreEffects);
	}

	/* -------------------------------------------- */
	/*                      API                     */
	/* -------------------------------------------- */

	/**
	 * Apply the named condition to the provided entities (Actors or Tokens)
	 * @deprecated
	 * @param  {...any} params
	 * @returns {*}
	 * @see EnhancedConditions#addCondition
	 */
	static async applyCondition(...params) {
		return await EnhancedConditions.addCondition(...params);
	}

	/**
	 * Applies the named condition to the provided entities (Actors or Tokens)
	 * @param {string[] | string} conditionName  the name of the condition to add
	 * @param {(Actor[] | Token[] | Actor | Token)} [entities=null] one or more Actors or Tokens to apply the Condition to
	 * @param {object} options
	 * @param {boolean} [options.allowDuplicates=false]  if one or more of the Conditions specified is already active on the Entity, this will still add the Condition. Use in conjunction with `replaceExisting` to determine how duplicates are handled
	 * @param {boolean} [options.replaceExisting=false]  whether or not to replace existing Conditions with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and `replaceExisting` is false then a duplicate condition is created. Has no effect is `keepDuplicates` is `false`
	 * @example
	 * // Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.
	 * game.clt.addCondition("Blinded", game.actors.getName("Bob"));
	 * @example
	 * // Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.
	 * game.clt.addCondition("Charmed");
	 * @example
	 * // Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, replacing any existing Conditions of the same names.
	 * game.clt.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
	 */
	static async addCondition(
		conditionName,
		entities = null,
		{ allowDuplicates = false, replaceExisting = false } = {}
	) {
		if (!entities) {
			// First check for any controlled tokens
			if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
			else if (game.user.character) entities = game.user.character;
		}

		if (!entities) {
			ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.ApplyCondition.Failed.NoToken"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.ApplyCondition.Failed.NoToken"
				)}`
			);
			return;
		}

		let conditions = EnhancedConditions._lookupConditionByName(conditionName);

		if (!conditions) {
			ui.notifications.error(
				`${game.i18n.localize("CLT.ENHANCED_CONDITIONS.ApplyCondition.Failed.NoCondition")} ${conditionName}`
			);
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.ApplyCondition.Failed.NoCondition"
				)}`,
				conditionName
			);
			return;
		}

		conditions = conditions instanceof Array ? conditions : [conditions];
		const conditionNames = conditions.map((c) => c.name);

		let effects = EnhancedConditions.getActiveEffects(conditions);

		if (!effects) {
			ui.notifications.error(
				`${game.i18n.localize("CLT.ENHANCED_CONDTIONS.ApplyCondition.Failed.NoEffect")} ${conditions}`
			);
			console.log(
				`Condition Lab & Triggler | ${game.i18n.localize(
					"CLT.ENHANCED_CONDTIONS.ApplyCondition.Failed.NoEffect"
				)}`,
				conditions
			);
			return;
		}

		effects = EnhancedConditions._prepareActiveEffects(effects);

		if (entities && !(entities instanceof Array)) {
			entities = [entities];
		}

		for (let entity of entities) {
			const actor =
				entity instanceof Actor
					? entity
					: entity instanceof Token || entity instanceof TokenDocument
						? entity.actor
						: null;

			if (!actor) continue;

			const hasDuplicates = EnhancedConditions.hasCondition(conditionNames, actor, { warn: false });
			const newEffects = [];
			const updateEffects = [];

			// If there are duplicate Condition effects on the Actor take extra steps
			if (hasDuplicates) {
				// @todo #348 determine the best way to raise warnings in this scenario
				/*
				if (warn) {
					ui.notifications.warn(`${entity.name}: ${conditionName} ${game.i18n.localize("CLT.ENHANCED_CONDITIONS.ApplyCondition.Failed.AlreadyActive")}`);
					console.log(`Combat Utility Belt - Enhanced Conditions | ${entity.name}: ${conditionName} ${game.i18n.localize("CLT.ENHANCED_CONDITIONS.ApplyCondition.Failed.AlreadyActive")}`);
				}
				*/

				// Get the existing conditions on the actor
				let existingConditionEffects = EnhancedConditions.getConditionEffects(actor, { warn: false });
				existingConditionEffects =
					existingConditionEffects instanceof Array ? existingConditionEffects : [existingConditionEffects];

				// Loop through the effects sorting them into either existing or new effects
				for (const effect of effects) {
					// Scenario 1: if duplicates are allowed, but existing conditions are not replaced, everything is new
					if (allowDuplicates && !replaceExisting) {
						newEffects.push(effect);
						continue;
					}

					const conditionId = foundry.utils.getProperty(effect, `flags.condition-lab-triggler.${"conditionId"}`);
					const matchedConditionEffects = existingConditionEffects.filter(
						(e) => e.getFlag("condition-lab-triggler", "conditionId") === conditionId
					);

					// Scenario 2: if duplicates are allowed, and existing conditions should be replaced, add any existing conditions to update
					if (replaceExisting) {
						for (const matchedCondition of matchedConditionEffects) {
							updateEffects.push({ id: matchedCondition.id, ...effect });
						}
					}

					// Scenario 2 cont'd: if the condition is not matched, it must be new, so add to the new effects
					// Scenario 3: if duplicates are not allowed, and existing conditions are not replaced, just add the new conditions
					if (!matchedConditionEffects.length) newEffects.push(effect);
				}
			}

			// If the any of the conditions remove others, remove all conditions
			// @todo maybe add this to the logic above?
			if (conditions.some((c) => c?.options?.removeOthers)) {
				await EnhancedConditions.removeAllConditions(actor, { warn: false });
			}

			const createData = hasDuplicates ? newEffects : effects;
			const updateData = updateEffects;
			// If system is dnd3.5e, then prevent upstream updates to avoid condition being immediately removed
			const stopUpdates = game.system.id === "D35E";

			if (createData.length) await actor.createEmbeddedDocuments("ActiveEffect", createData, { stopUpdates });
			if (updateData.length) await actor.updateEmbeddedDocuments("ActiveEffect", updateData, { stopUpdates });
		}
	}

	/**
	 * Gets a condition by name from the Condition Map
	 * @param {*} conditionName
	 * @param {*} map
	 * @param {object} options
	 * @param {*} options.warn
	 * @returns {string[] | string | undefined}
	 */
	static getCondition(conditionName, map = null, { warn = false } = {}) {
		if (!conditionName) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.GetCondition.Failed.NoCondition"));
		}

		return EnhancedConditions._lookupConditionByName(conditionName);
	}

	/**
	 * Retrieves all active conditions for one or more given entities (Actors or Tokens)
	 * @param {Actor | Token} entities  one or more Actors or Tokens to get Conditions from
	 * @param {object} options
	 * @param {boolean} options.warn  output notifications
	 * @returns {string[] | string | undefined}
	 * @example
	 * // Get conditions for an Actor named "Bob"
	 * game.clt.getConditions(game.actors.getName("Bob"));
	 * @example
	 * // Get conditions for the currently controlled Token
	 * game.clt.getConditions();
	 */
	static getConditions(entities = null, { warn = true } = {}) {
		if (!entities) {
			// First check for any controlled tokens
			if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
			// Then check if the user has an assigned character
			else if (game.user.character) entities = game.user.character;
		}

		if (!entities) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.GetConditions.Failed.NoToken"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.GetConditions.Failed.NoToken"
				)}`
			);
			return;
		}

		const map = game.settings.get("condition-lab-triggler", "activeConditionMap");

		if (!map || !map.length) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.GetConditions.Failed.NoCondition"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.GetConditions.Failed.NoCondition"
				)}`
			);
			return;
		}

		if (!(entities instanceof Array)) {
			entities = [entities];
		}

		const results = [];

		for (let entity of entities) {
			const actor =
				entity instanceof Actor
					? entity
					: entity instanceof Token || entity instanceof TokenDocument
						? entity.actor
						: null;

			const effects = actor?.effects.contents;

			if (!effects) continue;

			const effectIds =
				effects instanceof Array
					? effects.map((e) => e.getFlag("condition-lab-triggler", "conditionId"))
					: effects.getFlag("condition-lab-triggler", "conditionId");

			if (!effectIds.length) continue;

			const entityConditions = {
				entity: entity,
				conditions: EnhancedConditions.lookupEntryMapping(effectIds)
			};

			results.push(entityConditions);
		}

		if (!results.length) {
			if (warn) ui.notifications.notify(game.i18n.localize("CLT.ENHANCED_CONDITIONS.GetConditions.Failed.NoResults"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.GetConditions.Failed.NoResults"
				)}`
			);
			return null;
		}

		return results.length > 1 ? results : results.shift();
	}

	/**
	 * Gets the Active Effect data (if any) for the given conditions
	 * @param {Array} conditions
	 * @returns {Array} statusEffects
	 */
	static getActiveEffects(conditions) {
		return EnhancedConditions._prepareStatusEffects(conditions);
	}

	/**
	 * Gets any Active Effect instances present on the entities (Actor/s or Token/s) that are mapped Conditions
	 * @param {string} entities  the entities to check
	 * @param {Array} map  the Condition map to check (optional)
	 * @param {boolean} warn  output notifications
	 * @returns {Map | object | undefined} A Map containing the Actor Id and the Condition Active Effect instances if any
	 */
	static getConditionEffects(entities, map = null, { warn = true } = {}) {
		if (!entities) {
			// First check for any controlled tokens
			if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
			else if (game.user.character) entities = game.user.character;
		}

		if (!entities) {
			if (warn) ui.notifications.error(
				game.i18n.localize("CLT.ENHANCED_CONDITIONS.GetConditionEffects.Failed.NoEntity")
			);
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"
				)}`
			);
			return;
		}

		entities = entities instanceof Array ? entities : [entities];

		if (!map) map = game.settings.get("condition-lab-triggler", "activeConditionMap");

		let results = new Collection();

		for (const entity of entities) {
			const actor =
				entity instanceof Actor
					? entity
					: entity instanceof Token || entity instanceof TokenDocument
						? entity.actor
						: null;
			const activeEffects = actor.effects.contents;

			if (!activeEffects.length) continue;

			const conditionEffects = activeEffects.filter((ae) => ae.getFlag("condition-lab-triggler", "conditionId"));

			if (!conditionEffects.length) continue;

			results.set(entity.id, conditionEffects.length > 1 ? conditionEffects : conditionEffects.shift());
		}

		if (!results.size) return null;

		return results.size > 1 ? results : results.values().next().value;
	}

	/**
	 * Checks if the provided Entity (Actor or Token) has the given condition
	 * @param {string | Array} conditionName  the name/s of the condition or conditions to check for
	 * @param {Actor | Token | Array} entities  the entity or entities to check (Actor/s or Token/s)
	 * @param {object} [options]  options object
	 * @param {boolean} [options.warn]  whether or not to output notifications
	 * @returns {boolean} hasCondition  Returns true if one or more of the provided entities has one or more of the provided conditions
	 * @example
	 * // Check for the "Blinded" condition on Actor "Bob"
	 * game.clt.hasCondition("Blinded", game.actors.getName("Bob"));
	 * @example
	 * // Check for the "Charmed" and "Deafened" conditions on the controlled tokens
	 * game.clt.hasCondition(["Charmed", "Deafened"]);
	 */
	static hasCondition(conditionName, entities = null, { warn = true } = {}) {
		if (!conditionName) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.HasCondition.Failed.NoCondition"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.HasCondition.Failed.NoCondition"
				)}`
			);
			return false;
		}

		if (!entities) {
			// First check for any controlled tokens
			if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
			// Then check if the user has an assigned character
			else if (game.user.character) entities = game.user.character;
		}

		if (!entities) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.HasCondition.Failed.NoToken"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.HasCondition.Failed.NoToken"
				)}`
			);
			return false;
		}

		entities = entities instanceof Array ? entities : [entities];

		let conditions = EnhancedConditions._lookupConditionByName(conditionName);

		if (!conditions) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.HasCondition.Failed.NoMapping"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoMapping"
				)}`
			);
			return false;
		}

		conditions = EnhancedConditions._prepareStatusEffects(conditions);
		conditions = conditions instanceof Array ? conditions : [conditions];

		for (let entity of entities) {
			const actor =
				entity instanceof Actor
					? entity
					: entity instanceof Token || entity instanceof TokenDocument
						? entity.actor
						: null;

			if (!actor.effects.size) continue;

			const conditionEffect = actor.effects.contents.some((ae) => {
				return conditions.some(
					(e) =>
						e?.flags["condition-lab-triggler"].conditionId
						=== ae.getFlag("condition-lab-triggler", "conditionId")
				);
			});

			if (conditionEffect) return true;
		}

		return false;
	}

	/**
	 * Removes one or more named conditions from an Entity (Actor/Token)
	 * @param {string} conditionName  the name of the Condition to remove
	 * @param {Actor | Token} entities  One or more Actors or Tokens
	 * @param {object} options  options for removal
	 * @param {boolean} options.warn  whether or not to raise warnings on errors
	 * @example
	 * // Remove Condition named "Blinded" from an Actor named Bob
	 * game.clt.removeCondition("Blinded", game.actors.getName("Bob"));
	 * @example
	 * // Remove Condition named "Charmed" from the currently controlled Token, but don't show any warnings if it fails.
	 * game.clt.removeCondition("Charmed", {warn=false});
	 */
	static async removeCondition(conditionName, entities = null, { warn = true } = {}) {
		if (!entities) {
			// First check for any controlled tokens
			if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
			else if (game.user.character) entities = game.user.character;
			else entities = null;
		}

		if (!entities) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"
				)}`
			);
			return;
		}

		if (!(conditionName instanceof Array)) conditionName = [conditionName];

		const conditions = EnhancedConditions._lookupConditionByName(conditionName);

		if (!conditions || (conditions instanceof Array && !conditions.length)) {
			if (warn) ui.notifications.error(
				`${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition"
				)} ${conditionName}`
			);
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition"
				)}`,
				conditionName
			);
			return;
		}

		let effects = EnhancedConditions.getActiveEffects(conditions);

		if (!effects) {
			if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDTIONS.RemoveCondition.Failed.NoEffect"));
			console.log(
				`Combat Utility Belt - Enhanced Condition | ${game.i18n.localize(
					"ENHANCED_CONDTIONS.RemoveCondition.Failed.NoEffect"
				)}`,
				conditionName
			);
			return;
		}

		if (!(effects instanceof Array)) effects = [effects];

		if (entities && !(entities instanceof Array)) entities = [entities];

		for (let entity of entities) {
			const actor =
				entity instanceof Actor
					? entity
					: entity instanceof Token || entity instanceof TokenDocument
						? entity.actor
						: null;
			const toRemove = actor.appliedEffects?.filter((e) => effects.find((r) => e.statuses.has(r.id)));

			if (!toRemove || (toRemove && !toRemove.length)) {
				if (warn) ui.notifications.warn(
					`${conditionName} ${game.i18n.localize(
						"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive"
					)}`
				);
				console.log(
					`Combat Utility Belt - Enhanced Conditions | ${conditionName} ${game.i18n.localize(
						"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive"
					)}")`
				);
				return;
			}

			await actor.deleteEmbeddedDocuments("ActiveEffect", toRemove.map((e) => e.id));
		}
	}

	/**
	 * Removes all conditions from the provided entities
	 * @param {Actors | Tokens} entities  One or more Actors or Tokens to remove Conditions from
	 * @param {object} options
	 * @param {boolean} options.warn  output notifications
	 * @example
	 * // Remove all Conditions on an Actor named Bob
	 * game.clt.removeAllConditions(game.actors.getName("Bob"));
	 * @example
	 * // Remove all Conditions on the currently controlled Token
	 * game.clt.removeAllConditions();
	 */
	static async removeAllConditions(entities = null, { warn = true } = {}) {
		if (!entities) {
			// First check for any controlled tokens
			if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
			else if (game.user.character) entities = game.user.character;
		}

		if (!entities) {
			if (warn) ui.notifications.error(game.i18n.localize("CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
			console.log(
				`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize(
					"CLT.ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"
				)}`
			);
			return;
		}

		entities = entities instanceof Array ? entities : [entities];

		for (let entity of entities) {
			const actor =
				entity instanceof Actor
					? entity
					: entity instanceof Token || entity instanceof TokenDocument
						? entity.actor
						: null;

			let actorConditionEffects = EnhancedConditions.getConditionEffects(actor, { warn: false });

			if (!actorConditionEffects) continue;

			actorConditionEffects =
				actorConditionEffects instanceof Array ? actorConditionEffects : [actorConditionEffects];

			const effectIds = actorConditionEffects.map((ace) => ace.id);

			await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
		}
	}
}
