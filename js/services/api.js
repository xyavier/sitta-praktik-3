// Data service: semua data bahan ajar dibaca dari file JSON, bukan dari database.
window.SITTAApi = {
  async getBahanAjar() {
    const response = await fetch("./data/dataBahanAjar.json");
    if (!response.ok)
      throw new Error("Tidak dapat memuat data/dataBahanAjar.json");
    const data = await response.json();
    // Bentuk tracking dapat berupa object atau array of object; normalisasi menjadi object.
    if (Array.isArray(data.tracking)) {
      data.tracking = Object.assign({}, ...data.tracking);
    }
    data.tracking = data.tracking || {};
    return data;
  },
  async getTemplates(names) {
    const entries = await Promise.all(
      names.map(async ([key, path]) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Template ${path} gagal dimuat`);
        return [key, await response.text()];
      }),
    );
    return Object.fromEntries(entries);
  },
  async loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = path;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Gagal memuat ${path}`));
      document.body.appendChild(script);
    });
  },
};
