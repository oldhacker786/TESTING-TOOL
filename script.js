document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // DP MAKER
  const dpUpload = document.getElementById("dpUpload");
  const dpCanvas = document.getElementById("dpCanvas");
  const dpCtx = dpCanvas.getContext("2d");
  const borderColor = document.getElementById("borderColor");
  const borderSize = document.getElementById("borderSize");
  const zoomDp = document.getElementById("zoomDp");
  const downloadDp = document.getElementById("downloadDp");
  let dpImage = null;

  function drawDp() {
    if (!dpImage) return;
    const size = dpCanvas.width;
    const radius = size / 2;

    dpCtx.clearRect(0, 0, size, size);

    // Border
    dpCtx.beginPath();
    dpCtx.arc(radius, radius, radius, 0, Math.PI * 2);
    dpCtx.fillStyle = borderColor.value;
    dpCtx.fill();

    // Image
    dpCtx.save();
    dpCtx.beginPath();
    dpCtx.arc(radius, radius, radius - parseInt(borderSize.value), 0, Math.PI * 2);
    dpCtx.clip();

    const zoom = parseFloat(zoomDp.value);
    const iw = dpImage.width * zoom;
    const ih = dpImage.height * zoom;
    dpCtx.drawImage(dpImage, (size - iw) / 2, (size - ih) / 2, iw, ih);
    dpCtx.restore();
  }

  dpUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      dpImage = new Image();
      dpImage.onload = drawDp;
      dpImage.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  [borderColor, borderSize, zoomDp].forEach(input => {
    input.addEventListener("input", drawDp);
  });

  downloadDp.addEventListener("click", () => {
    if (!dpImage) return;
    const link = document.createElement("a");
    link.download = "profile-picture.png";
    link.href = dpCanvas.toDataURL("image/png");
    link.click();
  });

  // FILTERS
  const filterUpload = document.getElementById("filterUpload");
  const filterCanvas = document.getElementById("filterCanvas");
  const fCtx = filterCanvas.getContext("2d");
  const brightness = document.getElementById("brightness");
  const contrast = document.getElementById("contrast");
  const saturation = document.getElementById("saturation");
  const blur = document.getElementById("blur");
  const downloadFilter = document.getElementById("downloadFilter");
  let filterImage = null;

  function drawFilter() {
    if (!filterImage) return;
    fCtx.clearRect(0, 0, filterCanvas.width, filterCanvas.height);

    fCtx.filter = `
      brightness(${brightness.value}%)
      contrast(${contrast.value}%)
      saturate(${saturation.value}%)
      blur(${blur.value}px)
    `;

    fCtx.drawImage(filterImage, 0, 0, filterCanvas.width, filterCanvas.height);
    fCtx.filter = "none";
  }

  filterUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      filterImage = new Image();
      filterImage.onload = drawFilter;
      filterImage.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  [brightness, contrast, saturation, blur].forEach(input => {
    input.addEventListener("input", drawFilter);
  });

  downloadFilter.addEventListener("click", () => {
    if (!filterImage) return;
    const link = document.createElement("a");
    link.download = "filtered-image.png";
    link.href = filterCanvas.toDataURL("image/png");
    link.click();
  });
});
