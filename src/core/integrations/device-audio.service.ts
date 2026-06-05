// src/core/integrations/device-audio.service.ts

import {
    setAudioModeAsync,
    createAudioPlayer,
    AudioPlayer
} from "expo-audio";

import {
    logInfo,
    logWarn,
    logError,
} from "../../shared/utils";

/*
|--------------------------------------------------------------------------
| Device Audio State
|--------------------------------------------------------------------------
*/

type DeviceAudioState =
    {
        initialized: boolean;

        playing: boolean;

        looping: boolean;

        volume: number;

        currentSound?:
        AudioPlayer;
    };

/*
|--------------------------------------------------------------------------
| Device Audio Service
|--------------------------------------------------------------------------
|
| RESPONSIBILITIES:
|
| - alarm playback
| - looping alarm runtime
| - assistant sounds
| - runtime audio management
| - stop/pause/resume alarms
| - background audio execution
|
| IMPORTANT:
| This becomes the REAL
| alarm audio execution engine.
|
*/

export class DeviceAudioService {
    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    private static state:
        DeviceAudioState =
        {
            initialized: false,

            playing: false,

            looping: false,

            volume: 1,
        };

    /*
    |--------------------------------------------------------------------------
    | Initialize Audio Runtime
    |--------------------------------------------------------------------------
    */

    static async initialize():
        Promise<void> {
        try {
            if (
                this.state
                    .initialized
            ) {
                return;
            }

            logInfo(
                "Initializing device audio..."
            );

            /*
            |--------------------------------------------------------------------------
            | Configure Audio Runtime
            |--------------------------------------------------------------------------
            */

            await setAudioModeAsync(
                {
                    allowsRecording: false,
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                    shouldRouteThroughEarpiece: false,
                    interruptionMode: 'doNotMix',
                }
            );

            this.state.initialized =
                true;

            logInfo(
                "Device audio initialized"
            );
        } catch (error) {
            logError(
                "Audio initialization failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Play Audio
    |--------------------------------------------------------------------------
    */

    static async play(
        source:
            number | string,

        options?:
            {
                looping?: boolean;

                volume?: number;
            }
    ): Promise<void> {
        try {
            /*
            |--------------------------------------------------------------------------
            | Initialize Runtime
            |--------------------------------------------------------------------------
            */

            await this.initialize();

            /*
            |--------------------------------------------------------------------------
            | Stop Existing Audio
            |--------------------------------------------------------------------------
            */

            await this.stop();

            logInfo(
                "Starting audio playback..."
            );

            /*
            |--------------------------------------------------------------------------
            | Create Sound
            |--------------------------------------------------------------------------
            */

            const sound = createAudioPlayer(source, {
                keepAudioSessionActive: true
            });

            sound.loop = options?.looping ?? false;
            sound.volume = options?.volume ?? 1;

            /*
            |--------------------------------------------------------------------------
            | Persist Runtime State
            |--------------------------------------------------------------------------
            */

            this.state.currentSound =
                sound;

            this.state.playing =
                true;

            this.state.looping =
                options?.looping ??
                false;

            this.state.volume =
                options?.volume ??
                1;

            /*
            |--------------------------------------------------------------------------
            | Playback Listener
            |--------------------------------------------------------------------------
            */

            sound.addListener('playbackStatusUpdate', (status) => {
                if (
                    status.isLoaded &&
                    status.didJustFinish &&
                    !status.loop
                ) {
                    this.state.playing = false;
                }
            });

            sound.play();

            logInfo(
                "Audio playback started"
            );
        } catch (error) {
            logError(
                "Audio playback failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Play Alarm
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Add your real alarm asset:
    |
    | assets/audio/alarm.mp3
    |
    */

    static async playAlarm():
        Promise<void> {
        try {
            await this.play(
                require(
                    "../../../assets/audio/alarm.mp3"
                ),
                {
                    looping: true,

                    volume: 1,
                }
            );

            logInfo(
                "Alarm playback started"
            );
        } catch (error) {
            logError(
                "Alarm playback failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Playback
    |--------------------------------------------------------------------------
    */

    static async stop():
        Promise<void> {
        try {
            if (
                !this.state
                    .currentSound
            ) {
                return;
            }

            this.state.currentSound.pause();

            this.state.currentSound.remove();

            this.state.currentSound =
                undefined;

            this.state.playing =
                false;

            this.state.looping =
                false;

            logInfo(
                "Audio playback stopped"
            );
        } catch (error) {
            logError(
                "Audio stop failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pause Playback
    |--------------------------------------------------------------------------
    */

    static async pause():
        Promise<void> {
        try {
            if (
                !this.state
                    .currentSound
            ) {
                return;
            }

            this.state.currentSound.pause();

            this.state.playing =
                false;

            logInfo(
                "Audio playback paused"
            );
        } catch (error) {
            logError(
                "Audio pause failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Resume Playback
    |--------------------------------------------------------------------------
    */

    static async resume():
        Promise<void> {
        try {
            if (
                !this.state
                    .currentSound
            ) {
                return;
            }

            this.state.currentSound.play();

            this.state.playing =
                true;

            logInfo(
                "Audio playback resumed"
            );
        } catch (error) {
            logError(
                "Audio resume failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Set Volume
    |--------------------------------------------------------------------------
    */

    static async setVolume(
        volume: number
    ): Promise<void> {
        try {
            if (
                !this.state
                    .currentSound
            ) {
                return;
            }

            this.state.currentSound.volume = volume;

            this.state.volume =
                volume;

            logInfo(
                "Audio volume updated",
                {
                    volume,
                }
            );
        } catch (error) {
            logError(
                "Volume update failed",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime State
    |--------------------------------------------------------------------------
    */

    static getState():
        DeviceAudioState {
        return this.state;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Playing
    |--------------------------------------------------------------------------
    */

    static isPlaying():
        boolean {
        return this.state.playing;
    }
}