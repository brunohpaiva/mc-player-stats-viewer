(function () {
  const form = /** @type {HTMLFormElement} */ document.getElementById("json-file-form");
  const fileInput = /** @type {HTMLInputElement} */ form.querySelector("input[type='file']");
  const list = /** @type {HTMLUListElement} */ document.getElementById("list");
  const pre = /** @type {HTMLPreElement} */ document.getElementById("pre");

  form.onsubmit = async function (event) {
    event.preventDefault();

    if (fileInput.files.length !== 1) {
      alert("Please select a stats file (json).");
      return;
    }

    const file = fileInput.files.item(0);
    try {
      const json = /** @type {PlayerData} */ await readJson(file);
      const flattenStats = {};

      const categories = Object.keys(json.stats);
      categories.forEach(function (categoryName) {
        const category = json.stats[categoryName];
        const keys = Object.keys(category);
        keys.forEach(function (itemName) {
          const value = category[itemName];
          const item = flattenStats[itemName] || {};
          item[categoryName] = value;
          flattenStats[itemName] = item;
        });
      });

      Object.keys(flattenStats).forEach(function (itemName) {
        const itemStats = Object.keys(flattenStats[itemName]).map(function (statsName) {
          return `<li>${statsName} = ${flattenStats[itemName][statsName]}</li>`;
        });

        const element = /** @type {HTMLLIElement} */ document.createElement("li");
        element.innerHTML = `
          <b>${itemName}</b>
          <ul>${itemStats.join("")}</ul>
        `;
        list.appendChild(element);
      });

      pre.innerHTML = JSON.stringify(flattenStats, undefined, 2);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @async
   * @param file {File}
   * @returns PromiseLike<any>
   */
  async function readJson(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function (event) {
        resolve(JSON.parse(/** @type {string} */ this.result), event);
      };
      reader.onerror = function (event) {
        reject(event.target.error);
      }
      reader.readAsText(file, "UTF-8");
    });
  }

  /**
   * @typedef {{
   *   stats: Object.<string, Object.<string, number>>,
   *   DataVersion: number
   * }} PlayerData
   * */
})();