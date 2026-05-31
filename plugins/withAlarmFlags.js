const { withAndroidManifest, withMainActivity } = require("@expo/config-plugins");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

const withAlarmFlags = (config) => {
  // 1. Android Manifest changes
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Add permissions if not present
    if (!androidManifest.manifest["uses-permission"]) {
      androidManifest.manifest["uses-permission"] = [];
    }

    const permissions = [
      "android.permission.USE_FULL_SCREEN_INTENT",
      "android.permission.DISABLE_KEYGUARD",
      "android.permission.WAKE_LOCK",
      "android.permission.FOREGROUND_SERVICE"
    ];

    permissions.forEach((permission) => {
      const hasPermission = androidManifest.manifest["uses-permission"].some(
        (p) => p.$["android:name"] === permission
      );
      if (!hasPermission) {
        androidManifest.manifest["uses-permission"].push({
          $: { "android:name": permission }
        });
      }
    });

    // Configure MainActivity
    if (androidManifest.manifest.application) {
      const application = androidManifest.manifest.application[0];
      const mainActivity = application.activity?.find(
        (activity) => activity.$["android:name"] === ".MainActivity"
      );

      if (mainActivity) {
        mainActivity.$["android:showWhenLocked"] = "true";
        mainActivity.$["android:turnScreenOn"] = "true";
      }
    }

    return config;
  });

  // 2. MainActivity.kt changes
  config = withMainActivity(config, (config) => {
    let mainActivity = config.modResults.contents;

    // We need to import WindowManager and Bundle if not present
    let importsToInject = [];
    if (!mainActivity.includes("import android.os.Bundle")) {
      importsToInject.push("import android.os.Bundle");
    }
    if (!mainActivity.includes("import android.view.WindowManager")) {
      importsToInject.push("import android.view.WindowManager");
    }

    if (importsToInject.length > 0) {
      const importSrc = importsToInject.join("\n");
      
      // Inject imports below package declaration
      const packageRegex = /^package .*/m;
      const match = mainActivity.match(packageRegex);
      if (match) {
        const mergedImports = mergeContents({
          tag: 'alarm-imports',
          src: mainActivity,
          newSrc: importSrc,
          anchor: packageRegex,
          offset: 1,
          comment: '//',
        });
        if (mergedImports.didMerge) {
          mainActivity = mergedImports.contents;
        } else {
          console.warn("withAlarmFlags: Could not merge imports into MainActivity.kt");
        }
      }
    }

    // Inject onCreate flags
    // Under Kotlin, we hook after super.onCreate(...)
    const onCreateFlags = `        setShowWhenLocked(true)
        setTurnScreenOn(true)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON)`;

    // Look for super.onCreate(null) or super.onCreate(savedInstanceState)
    const onCreateRegex = /super\.onCreate\(.*\)/;
    
    if (!onCreateRegex.test(mainActivity)) {
      // If super.onCreate doesn't exist, we might need to inject the onCreate override.
      // But typically it exists due to expo-splash-screen or default templates.
      // Let's throw a helpful message if it's missing.
      throw new Error(
        "withAlarmFlags: Could not find 'super.onCreate(...)' in MainActivity.kt. " +
        "Ensure MainActivity.kt has onCreate or is configured properly."
      );
    }

    const mergedOnCreate = mergeContents({
      tag: 'alarm-oncreate-flags',
      src: mainActivity,
      newSrc: onCreateFlags,
      anchor: onCreateRegex,
      offset: 1,
      comment: '//',
    });

    if (mergedOnCreate.didMerge) {
      mainActivity = mergedOnCreate.contents;
    } else {
      throw new Error("withAlarmFlags: Failed to merge onCreate flags into MainActivity.kt");
    }

    config.modResults.contents = mainActivity;
    return config;
  });

  return config;
};

module.exports = withAlarmFlags;

