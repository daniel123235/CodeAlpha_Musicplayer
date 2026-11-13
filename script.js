// Edit this list to use your own songs. Put the files in the audio folder.
const tracks = [
  { title: "Night Drive",  artist: "Studio Loop", src: "audio/night-drive.wav" },
  { title: "Slow Tide",    artist: "Studio Loop", src: "audio/slow-tide.wav" },
  { title: "Paper Planes", artist: "Studio Loop", src: "audio/paper-planes.wav" }
];

const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const seek = document.getElementById("seek");
const currentEl = document.getElementById("current");
const durationEl = document.getElementById("duration");
const playBtn = document.getElementById("play");
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const volume = document.getElementById("volume");
const volumeOut = document.getElementById("volume-out");
const autoplayBtn = document.getElementById("autoplay");
const playlistEl = document.getElementById("playlist");

let index = 0;
let autoplay = true;

function fmt(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + String(s).padStart(2, "0");
}

function paintRange(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--pct", pct + "%");
}

// Build the playlist
tracks.forEach((track, i) => {
  const li = document.createElement("li");
  li.innerHTML =
    '<button type="button">' +
      '<span class="n">' + (i + 1) + '</span>' +
      '<span class="t">' + track.title + '<small>' + track.artist + '</small></span>' +
      '<span class="d">--:--</span>' +
    '</button>';
  li.querySelector("button").addEventListener("click", () => loadTrack(i, true));
  playlistEl.appendChild(li);

  // Read each song's length without playing it
  const probe = new Audio();
  probe.preload = "metadata";
  probe.addEventListener("loadedmetadata", () => {
    li.querySelector(".d").textContent = fmt(probe.duration);
  });
  probe.src = track.src;
});

function loadTrack(i, shouldPlay) {
  index = (i + tracks.length) % tracks.length;
  const track = tracks[index];
  audio.src = track.src;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  document.title = track.title + " – " + track.artist;
  seek.value = 0;
  paintRange(seek);
  currentEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  [...playlistEl.children].forEach((li, n) => li.classList.toggle("active", n === index));
  if (shouldPlay) play();
}

function play() {
  const p = audio.play();
  if (p) p.catch(() => {});
}

function togglePlay() {
  if (audio.paused) play(); else audio.pause();
}

function previous() {
  // Like most players: restart the song first, go back only if it just began
  if (audio.currentTime > 3) audio.currentTime = 0;
  else loadTrack(index - 1, !audio.paused);
}

audio.addEventListener("play", () => {
  iconPlay.hidden = true; iconPause.hidden = false;
  playBtn.setAttribute("aria-label", "Pause");
});
audio.addEventListener("pause", () => {
  iconPlay.hidden = false; iconPause.hidden = true;
  playBtn.setAttribute("aria-label", "Play");
});
audio.addEventListener("loadedmetadata", () => {
  seek.max = audio.duration;
  durationEl.textContent = fmt(audio.duration);
  paintRange(seek);
});
audio.addEventListener("timeupdate", () => {
  seek.value = audio.currentTime;
  currentEl.textContent = fmt(audio.currentTime);
  paintRange(seek);
});
audio.addEventListener("ended", () => {
  if (autoplay) loadTrack(index + 1, true);
});

seek.addEventListener("input", () => {
  audio.currentTime = seek.value;
  paintRange(seek);
});

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  volumeOut.textContent = Math.round(volume.value * 100);
  paintRange(volume);
});

autoplayBtn.addEventListener("click", () => {
  autoplay = !autoplay;
  autoplayBtn.setAttribute("aria-pressed", String(autoplay));
  autoplayBtn.textContent = "Autoplay: " + (autoplay ? "on" : "off");
});

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", () => loadTrack(index + 1, !audio.paused));
prevBtn.addEventListener("click", previous);

// Keyboard: Space play/pause, arrows seek 5s, N next, P previous
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.tagName === "BUTTON" && e.code === "Space") return;
  if (e.target.type === "range" && e.key.startsWith("Arrow")) return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  else if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
  else if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
  else if (e.key === "n" || e.key === "N") loadTrack(index + 1, !audio.paused);
  else if (e.key === "p" || e.key === "P") previous();
});

audio.volume = Number(volume.value);
paintRange(volume);
loadTrack(0, false);
