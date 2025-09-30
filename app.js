const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const uploader = document.getElementById("uploader");
const processBtn = document.getElementById("processBtn");
const progressDiv = document.getElementById("progress");
const volumeInput = document.getElementById("volume");

let file;

uploader.addEventListener("change", (e) => {
  file = e.target.files[0];
});

processBtn.addEventListener("click", async () => {
  if (!file) {
    alert("動画を選択してください！");
    return;
  }

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  await ffmpeg.FS('writeFile', file.name, await fetchFile(file));

  const outputName = "output.mp4";
  const volumeValue = volumeInput.value;

  ffmpeg.setProgress(({ ratio }) => {
    const percent = Math.round(ratio * 100);
    progressDiv.innerText = `進捗: ${percent}%`;
  });

  await ffmpeg.run('-i', file.name, '-af', `volume=${volumeValue}dB`, outputName);

  const data = ffmpeg.FS('readFile', outputName);
  const blob = new Blob([data.buffer], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = outputName;
  a.click();

  URL.revokeObjectURL(url);
});
