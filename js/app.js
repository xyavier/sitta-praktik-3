// Inisialisasi root Vue untuk halaman utama index.html.
// Navigasi antar fitur menggunakan state tab, sesuai arahan Tugas Praktik 3.
(async function () {
  try {
    const [data, templates] = await Promise.all([
      SITTAApi.getBahanAjar(),
      SITTAApi.getTemplates([
        ["stockTable", "templates/stock-table.html"],
        ["statusBadge", "templates/status-badge.html"],
        ["appModal", "templates/app-modal.html"],
        ["trackingDo", "templates/tracking-do.html"],
      ]),
    ]);
    window.SITTA_TEMPLATES = templates;

    await Promise.all([
      SITTAApi.loadScript("js/components/status-badge.js"),
      SITTAApi.loadScript("js/components/app-modal.js"),
      SITTAApi.loadScript("js/components/stock-table.js"),
      SITTAApi.loadScript("js/components/do-tracking.js"),
    ]);

    const app = Vue.createApp({
      data() {
        return {
          tab: "stock",
          stok: data.stok || [],
          upbjjList: data.upbjjList || [],
          kategoriList: data.kategoriList || [],
          tracking: data.tracking || {},
          paketList: data.paket || [],
          pengirimanList: data.pengirimanList || [],
        };
      },
      template: `
        <div>
          <nav class="menu">
            <ul class="nav-links">
              <li class="logo-li"><a href="#" class="logo-link" @click.prevent="tab='home'"><img src="assets/img/ut.png.webp" alt="Logo UT" style="max-width:50px"></a></li>
              <li><a href="#" :class="{active:tab==='stock'}" @click.prevent="tab='stock'">Informasi Bahan Ajar</a></li>
              <li><a href="#" :class="{active:tab==='tracking'}" @click.prevent="tab='tracking'">Tracking Pengiriman</a></li>
              <li><a href="#" :class="{active:tab==='home'}" @click.prevent="tab='home'">Beranda</a></li>
            </ul>
            <a id="logoutBtn" href="index.html" class="logout-btn">Logout</a>
          </nav>
          <main>
          <section v-if="tab === 'home'" class="sitta-home">
            <img src="assets/img/ut.png.webp" alt="Logo Universitas Terbuka">
            <h1>Sistem Informasi Tiras dan Transaksi Bahan Ajar</h1>
            <p>Selamat datang di SITTA Universitas Terbuka.</p>
            <button class="animated-button btn-inline" @click="tab='stock'"><span>Buka Informasi Stok</span><span></span></button>
            <button class="animated-button btn-inline" @click="tab='tracking'"><span>Tracking Delivery Order</span><span></span></button>
          </section>
          <ba-stock-table v-if="tab === 'stock'" :initial-stok="stok" :upbjj-list="upbjjList" :kategori-list="kategoriList" @update:stok="stok = $event"></ba-stock-table>
          <do-tracking v-if="tab === 'tracking'" :initial-tracking="tracking" :paket-list="paketList" :pengiriman-list="pengirimanList" :stok-list="stok"></do-tracking>
          </main>
        </div>
      `,
    });
    app.config.globalProperties.$filters = {
      currency(value) {
        if (typeof value === "string" && value.trim().startsWith("Rp"))
          return value;
        return "Rp " + Number(value || 0).toLocaleString("id-ID");
      },
      unit(value) {
        return Number(value || 0).toLocaleString("id-ID") + " buah";
      },
      date(value) {
        if (!value) return "-";
        const date = new Date(value + "T00:00:00");
        return Number.isNaN(date.getTime())
          ? value
          : date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
      },
    };
    app.component("status-badge", window.SITTAStatusBadge);
    app.component("app-modal", window.SITTAAppModal);
    app.component("ba-stock-table", window.SITTAStockTable);
    app.component("do-tracking", window.SITTADoTracking);
    app.mount("#app");
  } catch (error) {
    console.error(error);
    const target = document.getElementById("app");
    if (target)
      target.innerHTML = `<p class="sitta-error">SITTA gagal dimuat: ${error.message}. Jalankan melalui Live Server.</p>`;
  }
})();
