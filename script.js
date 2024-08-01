let mediaRecorder;
let recordedChunks = [];

document
  .getElementById("startRecording")
  .addEventListener("click", async () => {
    const audioSource = document.getElementById("audioSource").value;

    try {
      // Get screen media
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: audioSource === "screen" || audioSource === "both",
      });

      // Get microphone media if needed
      let micStream;
      if (audioSource === "mic" || audioSource === "both") {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      let combinedStream = screenStream;

      if (micStream) {
        // Combine screen and mic streams
        combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...micStream.getAudioTracks(),
        ]);
      }

      mediaRecorder = new MediaRecorder(combinedStream);
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
  downloadLink.download = "recording.mp4";
  downloadLink.textContent = "Download";

  listItem.appendChild(videoElement);
  listItem.appendChild(downloadLink);
  recordingsList.appendChild(listItem);
}
