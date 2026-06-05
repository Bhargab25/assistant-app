const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withCustomNotificationSound = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resDir = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "res",
        "raw"
      );

      // Create the raw directory if it doesn't exist
      if (!fs.existsSync(resDir)) {
        fs.mkdirSync(resDir, { recursive: true });
      }

      const soundSource = path.join(
        projectRoot,
        "assets",
        "audio",
        "alarm_sound.wav"
      );
      const soundDest = path.join(resDir, "alarm_sound.wav");

      // Copy the sound file
      if (fs.existsSync(soundSource)) {
        fs.copyFileSync(soundSource, soundDest);
      } else {
        console.warn(
          "withCustomNotificationSound: Could not find alarm_sound.wav in assets/audio/"
        );
      }

      return config;
    },
  ]);
};

module.exports = withCustomNotificationSound;
