window.SITTADoTracking = {
  props: {
    initialTracking: { type: Object, default: () => ({}) },
    paketList: { type: Array, default: () => [] },
    pengirimanList: { type: Array, default: () => [] },
    stokList: { type: Array, default: () => [] },
  },
  template: window.SITTA_TEMPLATES.trackingDo,
  data() {
    return {
      trackingList: { ...this.initialTracking },
      searchQuery: "",
      searchResult: null,
      searchResultKey: "",
      searchMessage: "",
      progressText: "",
      newDO: {
        nim: "",
        nama: "",
        ekspedisi: "",
        paketKode: "",
        tanggalKirim: this.localDate(),
        total: 0,
      },
    };
  },
  watch: {
    // Watcher: normalisasi input pencarian menjadi huruf kapital.
    searchQuery(value) {
      const upper = value.toUpperCase();
      if (value !== upper) this.searchQuery = upper;
      if (!value) {
        this.searchResult = null;
        this.searchResultKey = "";
        this.searchMessage = "";
      }
    },
    // Watcher: harga total otomatis mengikuti paket yang dipilih.
    "newDO.paketKode"(kode) {
      const paket = this.paketList.find((item) => item.kode === kode);
      this.newDO.total = paket ? Number(paket.harga) : 0;
    },
  },
  computed: {
    selectedPaket() {
      return (
        this.paketList.find((item) => item.kode === this.newDO.paketKode) ||
        null
      );
    },
    nextDONumber() {
      const year = new Date().getFullYear();
      const prefix = `DO${year}-`;
      const sequences = Object.keys(this.trackingList).map((key) => {
        const parts = key.split("-");
        return parts.length > 1 ? Number(parts[1]) || 0 : 0;
      });
      return `${prefix}${String(Math.max(0, ...sequences) + 1).padStart(4, "0")}`;
    },
  },
  methods: {
    localDate() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    },
    formatEkspedisi(item) {
      const name = typeof item === "string" ? item : item.nama;
      if (/JNE/i.test(name)) return name;
      return `JNE ${name.replace(/Reguler/i, "Regular").replace(/Ekspres/i, "Express")}`;
    },
    getJudul(kode) {
      const item = this.stokList.find((row) => row.kode === kode);
      return item ? item.judul : "Nama bahan ajar tidak tersedia";
    },
    searchDO() {
      const query = this.searchQuery.trim();
      if (!query) {
        this.searchMessage = "Masukkan Nomor DO atau NIM terlebih dahulu.";
        return;
      }
      const found = Object.entries(this.trackingList).find(
        ([nomor, row]) =>
          nomor.toUpperCase() === query ||
          String(row.nim || "").toUpperCase() === query,
      );
      if (!found) {
        this.searchResult = null;
        this.searchResultKey = "";
        this.searchMessage = "Nomor DO atau NIM tidak ditemukan.";
        return;
      }
      this.searchResultKey = found[0];
      this.searchResult = found[1];
      this.searchMessage = "";
    },
    clearSearch() {
      this.searchQuery = "";
      this.searchResult = null;
      this.searchResultKey = "";
      this.searchMessage = "";
    },
    showDetail(nomor) {
      this.searchQuery = nomor;
      this.searchResultKey = nomor;
      this.searchResult = this.trackingList[nomor];
      this.searchMessage = "";
      this.$nextTick(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    },

    showProgressForm(nomor) {
      this.searchQuery = nomor;
      this.searchResultKey = nomor;
      this.searchResult = this.trackingList[nomor];
      this.searchMessage = "";
      this.progressText = "";

      this.$nextTick(() => {
        const form = document.getElementById("sitta-progress-form");

        if (form) {
          form.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          const input = form.querySelector("input");

          if (input) input.focus({ preventScroll: true });
        }
      });
    },
    createDO() {
      if (!/^\d{8,15}$/.test(this.newDO.nim)) {
        this.notify(
          "Validasi gagal",
          "NIM harus terdiri dari 8 sampai 15 digit angka.",
          "error",
        );
        return;
      }
      if (
        !this.newDO.nama.trim() ||
        !this.newDO.ekspedisi ||
        !this.selectedPaket ||
        !this.newDO.tanggalKirim
      ) {
        this.notify(
          "Validasi gagal",
          "Lengkapi seluruh field Delivery Order.",
          "error",
        );
        return;
      }
      const nomor = this.nextDONumber;
      const now = new Date();
      const waktu = now.toLocaleString("id-ID");
      const record = {
        nomorDO: nomor,
        nim: this.newDO.nim,
        nama: this.newDO.nama.trim(),
        status: "Diproses",
        ekspedisi: this.newDO.ekspedisi,
        tanggalKirim: this.newDO.tanggalKirim,
        paket: this.selectedPaket.kode,
        total: Number(this.selectedPaket.harga),
        perjalanan: [
          {
            waktu,
            keterangan:
              "Delivery Order dibuat dan menunggu diserahkan ke ekspedisi.",
          },
        ],
      };
      this.trackingList[nomor] = record;
      this.showDetail(nomor);
      this.newDO = {
        nim: "",
        nama: "",
        ekspedisi: "",
        paketKode: "",
        tanggalKirim: this.localDate(),
        total: 0,
      };
      this.notify(
        "Berhasil",
        `Delivery Order ${nomor} berhasil dibuat.`,
        "success",
      );
    },
    addProgress() {
      if (!this.searchResult || !this.progressText.trim()) return;
      this.searchResult.perjalanan.push({
        waktu: new Date().toLocaleString("id-ID"),
        keterangan: this.progressText.trim(),
      });
      this.progressText = "";
    },
    notify(title, text, icon) {
      if (window.Swal) Swal.fire(title, text, icon);
      else window.alert(`${title}: ${text}`);
    },
  },
};
