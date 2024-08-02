let mediaRecorder;
let recordedChunks = [];

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
  if (isMobile()) {
      alert('Screen recording is not supported on mobile browsers. Please use a desktop browser.');
      return;
  }

document
  .getElementById("startRecording")
  .addEventListener("click", async () => {

  

    const audioSource = document.getElementById("audioSource").value;
    const resolution = document.getElementById("resolution").value.split("x");
    const frameRate = parseInt(document.getElementById("frameRate").value, 10);
    const bitRate =
      parseInt(document.getElementById("bitRate").value, 10) * 1000;


    try {
      // Get screen media
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
         video: {
          width: { ideal: parseInt(resolution[0], 10) },
          height: { ideal: parseInt(resolution[1], 10) },
          frameRate: { ideal: frameRate, max: frameRate },
        },
        audio: audioSource === "screen" || audioSource === "both",
      });

      // Get microphone media if needed
      let micStream;
      if (audioSource === "mic" || audioSource === "both") {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleSize: 16,
            channelCount: 2,
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        });
      }

      let combinedStream = screenStream;

      if (micStream) {
        // Combine screen and mic streams
        combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...micStream.getAudioTracks(),
        ]);
      }

      // Define options for MediaRecorder
      const options = {
        mimeType: "video/webm; codecs=vp9",
        audioBitsPerSecond: 128000, // Increased bitrate for better audio quality
        videoBitsPerSecond: 2500000,
      };

      mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        recordedChunks = [];
        const url = URL.createObjectURL(blob);
        addRecordingToList(url);
      };
      mediaRecorder.start();
      document.getElementById("startRecording").disabled = true;
      document.getElementById("stopRecording").disabled = false;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  });

document.getElementById("stopRecording").addEventListener("click", () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    document.getElementById("startRecording").disabled = false;
    document.getElementById("stopRecording").disabled = true;
  }
});

function addRecordingToList(url) {
  const recordingsList = document.getElementById("recordingsList");
  const listItem = document.createElement("li");
  const videoElement = document.createElement("video");
  videoElement.src = url;
  videoElement.controls = true;
  videoElement.width = 300;

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "recording.webm";
  downloadLink.textContent = "Download";

  listItem.appendChild(videoElement);
  listItem.appendChild(downloadLink);
  recordingsList.appendChild(listItem);
}
