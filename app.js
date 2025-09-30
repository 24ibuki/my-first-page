// ffmpegモジュールをwindowから取得
const { FFmpeg } = window.FFmpeg;
const { fetchFile } = window.FFmpegUtil;

const ffmpeg = new FFmpeg({
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
});

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

  // ffmpeg初期化
  await ffmpeg.load();

  // ファイルを仮想FSに書き込む
  await ffmpeg.writeFile(file.name, await fetchFile(file));

  // 出力ファイル名
  const outputName = "output.mp4";

  // 進捗表示
  ffmpeg.on("progress", ({ progress }) => {
    const percent = Math.round(progress * 100);
    progressDiv.innerText = `進捗: ${percent}%`;
  });

  // 音量調整処理
  const volumeValue = volumeInput.value;
  await ffmpeg.exec([
    "-i", file.name,
    "-af", `volume=${volumeValue}dB`,
    outputName
  ]);

  // 結果を取得してダウンロード
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data.buffer], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = outputName;
  a.click();

  URL.revokeObjectURL(url);
});
