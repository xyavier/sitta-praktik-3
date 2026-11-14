(async function () {
  try {
    const [data, templates] = await Promise.all([
      SITTAApi.getBahanAjar(),
      SITTAApi.getTemplates([
        ['trackingDo', 'templates/tracking-do.html']
      ])
    ]);
    window.SITTA_TEMPLATES = templates;
    await SITTAApi.loadScript('js/components/do-tracking.js');

    const app = Vue.createApp({
      data() {
        return {
          tracking: data.tracking || {},
          paketList: data.paket || [],
          pengirimanList: data.pengirimanList || [],
          stokList: data.stok || []
        };
      },
      template: `<do-tracking :initial-tracking="tracking" :paket-list="paketList" :pengiriman-list="pengirimanList" :stok-list="stokList"></do-tracking>`
    });
    app.config.globalProperties.$filters = {
      currency(value) {
        if (typeof value === 'string' && value.trim().startsWith('Rp')) return value;
        return 'Rp ' + Number(value || 0).toLocaleString('id-ID');
      },
      date(value) {
        if (!value) return '-';
        const date = new Date(value + 'T00:00:00');
        return Number.isNaN(date.getTime())
          ? value
          : date.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
      }
    };
    app.component('do-tracking', window.SITTADoTracking);
    app.mount('#trackingApp');
  } catch (error) {
    console.error(error);
    const target = document.getElementById('trackingApp');
    if (target) target.innerHTML = `<p class="sitta-error">Tracking DO gagal dimuat: ${error.message}. Jalankan melalui Live Server.</p>`;
  }
})();
