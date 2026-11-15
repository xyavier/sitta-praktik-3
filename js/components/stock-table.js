window.SITTAStockTable = {
  props: {
    initialStok: { type: Array, default: () => [] },
    upbjjList: { type: Array, default: () => [] },
    kategoriList: { type: Array, default: () => [] },
  },
  template: window.SITTA_TEMPLATES.stockTable,
  data() {
    return {
      stok: this.initialStok.map((item) => ({ ...item })),
      filter: { upbjj: "", kategori: "", belowSafety: false, emptyOnly: false },
      sortBy: "",
      modalOpen: false,
      isEditing: false,
      formError: "",
      form: this.emptyForm(),
    };
  },
  watch: {
    // Watcher 1: ketika UT-Daerah berubah, kategori direset agar opsi tetap relevan.
    "filter.upbjj"(newValue) {
      this.filter.kategori = "";
    },
    // Watcher 2: sinkronisasi jika data stok dari parent diperbarui.
    initialStok: {
      deep: true,
      handler(newValue) {
        this.stok = (newValue || []).map((item) => ({ ...item }));
      },
    },
  },
  computed: {
    kategoriOptions() {
      if (!this.filter.upbjj) return [];
      return [
        ...new Set(
          this.stok
            .filter((item) => item.upbjj === this.filter.upbjj)
            .map((item) => item.kategori),
        ),
      ];
    },
    filteredData() {
      let rows = this.stok.filter(
        (item) =>
          (!this.filter.upbjj || item.upbjj === this.filter.upbjj) &&
          (!this.filter.kategori || item.kategori === this.filter.kategori) &&
          (!this.filter.belowSafety ||
            Number(item.qty) < Number(item.safety)) &&
          (!this.filter.emptyOnly || Number(item.qty) === 0),
      );
      if (this.sortBy === "judul")
        rows.sort((a, b) => a.judul.localeCompare(b.judul, "id"));
      if (this.sortBy === "qty")
        rows.sort((a, b) => Number(a.qty) - Number(b.qty));
      if (this.sortBy === "harga")
        rows.sort((a, b) => Number(a.harga) - Number(b.harga));
      return rows;
    },
  },
  methods: {
    emptyForm() {
      return {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: "",
        qty: 0,
        safety: 0,
        catatanHTML: "",
      };
    },
    openCreate() {
      this.isEditing = false;
      this.form = this.emptyForm();
      this.formError = "";
      this.modalOpen = true;
    },
    openEdit(item) {
      this.isEditing = true;
      this.form = { ...item };
      this.formError = "";
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
    saveItem() {
      const f = this.form;
      if (!f.kode || !f.judul || !f.kategori || !f.upbjj || !f.lokasiRak) {
        this.formError = "Semua field identitas wajib diisi.";
        return;
      }
      if (
        !(Number(f.harga) > 0) ||
        Number(f.qty) < 0 ||
        Number(f.safety) < 0 ||
        f.qty === "" ||
        f.safety === ""
      ) {
        this.formError =
          "Harga harus lebih dari 0, sedangkan stok dan safety tidak boleh negatif.";
        return;
      }
      if (
        !this.isEditing &&
        this.stok.some((x) => x.kode.toLowerCase() === f.kode.toLowerCase())
      ) {
        this.formError = "Kode mata kuliah sudah terdaftar.";
        return;
      }
      const saved = {
        ...f,
        harga: Number(f.harga),
        qty: Number(f.qty),
        safety: Number(f.safety),
      };
      if (this.isEditing) {
        const index = this.stok.findIndex((x) => x.kode === f.kode);
        if (index !== -1) this.stok[index] = saved;
      } else {
        this.stok.push(saved);
      }
      this.$emit(
        "update:stok",
        this.stok.map((x) => ({ ...x })),
      );
      this.closeModal();
      if (window.Swal)
        Swal.fire("Berhasil", "Data bahan ajar berhasil disimpan.", "success");
    },
    async deleteItem(item) {
      let confirmed = window.confirm("Hapus data " + item.judul + "?");
      if (window.Swal) {
        const result = await Swal.fire({
          title: "Hapus Data?",
          text: `Data ${item.judul} akan dihapus.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya, hapus",
          cancelButtonText: "Batal",
        });
        confirmed = result.isConfirmed;
      }
      if (!confirmed) return;
      this.stok = this.stok.filter((x) => x.kode !== item.kode);
      this.$emit(
        "update:stok",
        this.stok.map((x) => ({ ...x })),
      );
    },
    resetFilter() {
      this.filter = {
        upbjj: "",
        kategori: "",
        belowSafety: false,
        emptyOnly: false,
      };
      this.sortBy = "";
    },
  },
};
