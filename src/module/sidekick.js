/**
 * Provides helper methods for use elsewhere in the module (and has your back in a melee)
 */
export class Sidekick {
	/**
	 * Use FilePicker to browse then Fetch one or more JSONs and return them
	 * @param {string} source
	 * @param {string} path
	 * @returns {JSON[]}
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
	 * @returns {JSON | null}
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
	 * Attempts to coerce a target value into the exemplar's type
	 * @param {string} value
	 * @param {string} type
	 * @returns {number | string | boolean} coercedValue
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
	 * Get a random unique Id, checking an optional supplied array of ids for a match
	 * @param {string[]} existingIds
	 * @param {object} root0
	 * @param {number} root0.iterations
	 * @param {number} root0.length
	 * @returns {string}
	 */
	static createId(existingIds = [], { iterations = 10000, length = 16 } = {}) {
		for (let attempt = 0; attempt < iterations; attempt++) {
			const id = foundry.utils.randomID(length);
			if (!existingIds.includes(id)) {
				return id;
			}
		}

		throw new Error(
			`Combat Utility Belt - Sidekick | Tried to create a unique id over ${iterations} iterations and failed.`
		);
	}

	/**
	 * For a given string generate a slug, optionally checking a list of existing Ids for uniqueness
	 * @param {string} string
	 * @param {string[]} idList
	 * @returns {string}
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

		const name = filename.titleCase();
		return name;
	}

	/**
	 * Loads templates for partials
	 */
	static async loadTemplates() {
		const templates = [
			"modules/condition-lab-triggler/templates/partials/chat-card-condition-list.hbs",
			"modules/condition-lab-triggler/templates/partials/condition-lab-row.hbs",
			"modules/condition-lab-triggler/templates/partials/triggler-icon.hbs"
		];
		await loadTemplates(templates);
	}

	/**
	 * Converts the given string to camelCase using the provided delimiter to break up words
	 * @param {string} string
	 * @param {string} delimiter
	 * @returns {string} the converted string
	 * @example Sidekick.toCamelCase("my-cool-string", "-") // returns "myCoolString"
	 */
	static toCamelCase(string, delimiter) {
		const stringParts = string.split(delimiter);
		return stringParts instanceof Array
			? stringParts.reduce((camelString, part, index) => {
				return (camelString += index > 0 ? part.titleCase() : part);
			}, "")
			: stringParts;
	}
}
