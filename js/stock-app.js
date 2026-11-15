(async function () {
  try {
    const [data, templates] = await Promise.all([
      SITTAApi.getBahanAjar(),
      SITTAApi.getTemplates([
        ["stockTable", "templates/stock-table.html"],
        ["statusBadge", "templates/status-badge.html"],
        ["appModal", "templates/app-modal.html"],
      ]),
    ]);
    window.SITTA_TEMPLATES = templates;
    await Promise.all([
      SITTAApi.loadScript("js/components/status-badge.js"),
      SITTAApi.loadScript("js/components/app-modal.js"),
      SITTAApi.loadScript("js/components/stock-table.js"),
    ]);

    const app = Vue.createApp({
      data() {
        return {
          stok: data.stok || [],
          upbjjList: data.upbjjList || [],
          kategoriList: data.kategoriList || [],
        };
      },
      template: `<ba-stock-table :initial-stok="stok" :upbjj-list="upbjjList" :kategori-list="kategoriList" @update:stok="stok = $event"></ba-stock-table>`,
    });
    app.config.globalProperties.$filters = {
      currency(value) {
        return "Rp " + Number(value || 0).toLocaleString("id-ID");
      },
      unit(value) {
        return Number(value || 0).toLocaleString("id-ID") + " buah";
      },
    };
    app.component("status-badge", window.SITTAStatusBadge);
    app.component("app-modal", window.SITTAAppModal);
    app.component("ba-stock-table", window.SITTAStockTable);
    app.mount("#stockApp");
  } catch (error) {
    console.error(error);
    const target = document.getElementById("stockApp");
    if (target)
      target.innerHTML = `<p class="sitta-error">Aplikasi stok gagal dimuat: ${error.message}. Jalankan melalui Live Server.</p>`;
  }
})();
