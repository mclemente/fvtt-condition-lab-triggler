import { Butler as BUTLER } from "./butler.js";
/**
 * Provides helper methods for use elsewhere in the module (and has your back in a melee)
 */
export class Sidekick {
	/**
	 * Get a single setting using the provided key
	 * @param {*} key
	 * @returns {object} setting
	 */
	static getSetting(key) {
		return game.settings.get(BUTLER.NAME, key);
	}

	/**
	 * Get all CUB settings
	 * @returns {Array} settings
	 */
	static getAllSettings() {
		const settings = [...game.settings.settings].filter((k, v) => String(k).startsWith(BUTLER.NAME));
		return settings;
	}

	/**
	 * Sets a single game setting
	 * @param {*} key
	 * @param {*} value
	 * @param {*} awaitResult
	 * @returns {Promise | ClientSetting}
	 */
	static setSetting(key, value, awaitResult = false) {
		if (!awaitResult) {
			return game.settings.set(BUTLER.NAME, key, value);
		}

		game.settings
			.set(BUTLER.NAME, key, value)
			.then((result) => {
				return result;
			})
			.catch((rejected) => {
				throw rejected;
			});
	}

	/**
	 * Register a single setting using the provided key and setting data
	 * @param {*} key
	 * @param {*} metadata
	 * @returns {ClientSettings.register}
	 */
	static registerSetting(key, metadata) {
		return game.settings.register(BUTLER.NAME, key, metadata);
	}

	/**
	 * Register a menu setting using the provided key and setting data
	 * @param {*} key
	 * @param {*} metadata
	 * @returns {ClientSettings.registerMenu}
	 */
	static registerMenu(key, metadata) {
		return game.settings.registerMenu(BUTLER.NAME, key, metadata);
	}

	/**
	 * Register all provided setting data
	 * @param {*} settingsData
	 * @returns {Array}
	 */
	static registerAllSettings(settingsData) {
		return Object.keys(settingsData).forEach((key) => Sidekick.registerSetting(key, settingsData[key]));
	}

	/**
	 * Use FilePicker to browse then Fetch one or more JSONs and return them
	 * @param {*} source
	 * @param {*} path
	 */
	static async fetchJsons(source, path) {
		const extensions = [".json"];
		const fp = await FilePicker.browse(source, path, { extensions });
		const fetchedJsons = fp?.files?.length ? await Promise.all(fp.files.map((f) => Sidekick.fetchJson(f))) : [];
		const jsons = fetchedJsons.filter((j) => !!j);

		return jsons;
	}

	/**
	 * Fetch a JSON from a given file
	 * @param {File} file
	 * @returns JSON | null
	 */
	static async fetchJson(file) {
		try {
			const jsonFile = await fetch(file);
			const json = await jsonFile.json();
			if (!(json instanceof Object)) throw new Error("Not a valid JSON!");
			return json;
		} catch(e) {
			console.warn(e.message);
			return null;
		}
	}

	/**
	 * Validate that an object is actually an object
	 * @param {object} object
	 * @returns {boolean}
	 */
	static validateObject(object) {
		return !!(object instanceof Object);
	}

	/**
	 * Convert any ES6 Maps/Sets to objects for settings use
	 * @param {Map} map
	 */
	static convertMapToArray(map) {
		return map instanceof Map ? Array.from(map.entries()) : null;
	}

	/**
	 * Retrieves a key using the given value
	 * @param {object} object the object that contains the key/value
	 * @param {*} value
	 */
	static getKeyByValue(object, value) {
		return Object.keys(object).find((key) => object[key] === value);
	}

	/**
	 * Inverts the key and value in a map
	 * @param map
	 * @todo: rework
	 */
	static getInverseMap(map) {
		let newMap = new Map();
		for (let [k, v] of map) {
			newMap.set(v, k);
		}
		return newMap;
	}

	/**
	 * Adds additional handlebars helpers
	 */
	static handlebarsHelpers() {
		Handlebars.registerHelper("cub-concat", () => {
			let result;

			for (let a in arguments) {
				result += typeof arguments[a] === "string" ? arguments[a] : "";
			}
			return result;
		});
	}

	/**
	 * Adds additional jquery helpers
	 */
	static jQueryHelpers() {
		jQuery.expr[":"].icontains = function (a, i, m) {
			return jQuery(a).text()
				.toUpperCase()
				.indexOf(m[3].toUpperCase()) >= 0;
		};
	}

	/**
	 * Takes an array of terms (eg. name parts) and returns groups of neighbouring terms
	 * @param {*} arr
	 */
	static getTerms(arr) {
		const terms = [];
		const rejectTerms = ["of", "its", "the", "a", "it's", "if", "in", "for", "on", "by", "and"];
		for (let i of arr.keys()) {
			let len = arr.length - i;
			for (let p = 0; p <= i; p++) {
				let part = arr.slice(p, p + len);
				if (part.length === 1 && rejectTerms.includes(part[0])) {
					continue;
				}
				terms.push(part.join(" "));
			}
		}
		return terms;
	}

	/**
	 * Escapes regex special chars
	 * @param {string} string
	 * @returns {string} escapedString
	 */
	static escapeRegExp(string) {
		return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
	}

	/**
	 * Attempts to coerce a target value into the exemplar's type
	 * @param {*} target
	 * @param value
	 * @param {*} type
	 * @returns {*} coercedValue
	 */
	static coerceType(value, type) {
		switch (type) {
			case "number":
				return Number(value);

			case "string":
				return value.toString();

			case "boolean":
				return value.toString().toLowerCase() === "true"
					? true
					: value.toString().toLowerCase() === "false"
						? false
						: value;

			default:
				return value;
		}
	}

	/**
	 * Builds a FD returned from FormDataExtended into a formData array
	 * Borrowed from foundry.js
	 * @param {*} FD
	 */
	static buildFormData(FD) {
		const dtypes = FD._dtypes;

		// Construct update data object by casting form data
		let formData = Array.from(FD).reduce((obj, [k, v]) => {
			let dt = dtypes[k];
			if (dt === "Number") obj[k] = v !== "" ? Number(v) : null;
			else if (dt === "Boolean") obj[k] = v === "true";
			else if (dt === "Radio") obj[k] = JSON.parse(v);
			else obj[k] = v;
			return obj;
		}, {});

		return formData;
	}

	/**
	 * Get a random unique Id, checking an optional supplied array of ids for a match
	 * @param {*} existingIds
	 * @param root0
	 * @param root0.iterations
	 * @param root0.length
	 */
	static createId(existingIds = [], { iterations = 10000, length = 16 } = {}) {
		let i = 0;
		while (i < iterations) {
			const id = randomID(length);
			if (!existingIds.includes(id)) {
				return id;
			}
			i++;
			console.log(
				`Combat Utility Belt - Sidekick | Id ${id} already exists in the provided list of ids. ${
					i ? `This is attempt ${i} of ${iterations} ` : ""
				}Trying again...`
			);
		}

		throw new Error(
			`Combat Utility Belt - Sidekick | Tried to create a unique id over ${iterations} iterations and failed.`
		);
	}

	/**
	 * Sets a string to Title Case
	 * @param {*} string
	 */
	static toTitleCase(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/**
	 * Parses HTML and replaces instances of a matched pattern
	 * @param {*} pattern
	 * @param {*} string
	 * @param {*} param2
	 */
	static replaceOnDocument(pattern, string, { target = document.body } = {}) {
		// Handle `string` — see the last section
		[target, ...target.querySelectorAll("*:not(script):not(noscript):not(style)")].forEach(
			({ childNodes: [...nodes] }) =>
				nodes
					.filter(({ nodeType }) => nodeType === document.TEXT_NODE)
					.forEach((textNode) => (textNode.textContent = textNode.textContent.replace(pattern, string)))
		);
	}

	/**
	 * Get text nodes in a given element
	 * @param {*} el
	 * @returns {jQuery}
	 */
	static getTextNodesIn(el) {
		return $(el)
			.find(":not(iframe)")
			.addBack()
			.contents()
			.filter((i, e) => e.nodeType == 3 && /\S/.test(e.nodeValue));
	}

	/**
	 * For a given string generate a slug, optionally checking a list of existing Ids for uniqueness
	 * @param {*} string
	 * @param {*} idList
	 */
	static generateUniqueSlugId(string, idList = []) {
		let slug = string.slugify();

		const existingIds = idList.filter((id) => id === slug);

		if (!existingIds.length) return slug;

		const uniqueIndex = existingIds.length > 1 ? Math.max(...existingIds.map((id) => id.match(/\d+/g)[0])) + 1 : 1;
		slug = slug.replace(/\d+$/g, uniqueIndex);

		return slug;
	}

	/**
	 * For a given file path, find the filename and then apply title case
	 * @param {string} path
	 * @returns {string}
	 */
	static getNameFromFilePath(path) {
		if (!path) return null;

		const file = path.split("\\").pop()
			.split("/")
			.pop();

		if (!file) return null;

		const filename = file.replace(/\.[^/.]+$/, "");

		if (!filename) return null;

		const name = Sidekick.toTitleCase(filename);
		return name;
	}

	/**
	 * Gets the first GM user
	 * @returns {GM | null} a GM object or null if none found
	 */
	static getFirstGM() {
		const gmUsers = game.users.filter((u) => u.isGM && u.active).sort((a, b) => a.name.localeCompare(b.name));

		return gmUsers.length ? gmUsers[0] : null;
	}

	/**
	 * Checks if the current user is the first active GM
	 * @returns {boolean}
	 */
	static isFirstGM() {
		return game.user.id === this.getFirstGM()?.id;
	}

	/**
	 * Filters an array down to just its duplicate elements based on the property specified
	 * @param {*} arrayToCheck
	 * @param {*} filterProperty
	 * @returns {Array}
	 */
	static findArrayDuplicates(arrayToCheck, filterProperty) {
		const lookup = arrayToCheck.reduce((a, e) => {
			a.set(e[filterProperty], (a.get(e[filterProperty]) ?? 0) + 1);
			return a;
		}, new Map());

		return arrayToCheck.filter((e) => lookup.get(e[filterProperty] > 1));
	}

	/**
	 * Returns true for each array element that is a duplicate based on the property specified
	 * @param {*} arrayToCheck
	 * @param {*} filterProperty
	 * @returns {boolean}
	 */
	static identifyArrayDuplicatesByProperty(arrayToCheck, filterProperty) {
		const seen = new Set();
		return arrayToCheck.map((e) => {
			if (seen.size === seen.add(e[filterProperty]).size) {
				return true;
			}
			return false;
		});
	}

	/**
	 * Loads templates for partials
	 */
	static async loadTemplates() {
		const templates = [
			`${BUTLER.PATH}/templates/partials/chat-card-condition-list.hbs`,
			`${BUTLER.PATH}/templates/partials/condition-lab-row.hbs`,
			`${BUTLER.PATH}/templates/partials/triggler-icon.hbs`
		];
		await loadTemplates(templates);
	}

	/**
	 * Retrieves all the owners of a given document
	 * @param {*} document
	 * @returns {Array}
	 */
	static getDocumentOwners(document) {
		const permissions = document.ownership ?? document.data?.ownership;
		if (!permissions) return null;
		const owners = [];
		for (const userId in permissions) {
			if (permissions[userId] === foundry.CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) owners.push(userId);
		}
		return owners;
	}

	static consoleMessage(type, source, { objects = [], message = "", subStr = [] }) {
		const msg = `${BUTLER.TITLE} | ${source} :: ${message}`;
		const params = [];
		if (objects && objects.length) params.push(objects);
		if (msg) params.push(msg);
		if (subStr && subStr.length) params.push(subStr);
		return console[type](...params);
	}

	/**
	 * Converts the given string to camelCase using the provided delimiter to break up words
	 * @param {string} string
	 * @param {string} delimiter
	 * @returns the converted string
	 * @example Sidekick.toCamelCase("my-cool-string", "-") // returns "myCoolString"
	 */
	static toCamelCase(string, delimiter) {
		const stringParts = string.split(delimiter);
		return stringParts instanceof Array
			? stringParts.reduce((camelString, part, index) => {
				return (camelString += index > 0 ? Sidekick.toTitleCase(part) : part);
			}, "")
			: stringParts;
	}
}
