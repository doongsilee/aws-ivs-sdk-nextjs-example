import videojs from "video.js";
import {
  VideoJSQualityPlugin,
  VideoJSIVSTech,
  registerIVSQualityPlugin,
  registerIVSTech,
  VideoJSEvents,
} from "amazon-ivs-player";

import wasmWorkerPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js";
// We use the TypeScript compiler (TSC) to check types; it doesn't know what this WASM module is, so let's ignore the error it throws (TS2307).
// @ts-ignore
import wasmBinaryPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm";
import { useEffect, useState } from "react";

const createAbsolutePath = (assetPath: string) =>
  new URL(assetPath, document.URL).toString();

export default function Video() {
  const [player, setPlayer] = useState<videojs.Player>();

  useEffect(() => {
    console.log("loading Video Component");

    const options = {
      wasmWorker: createAbsolutePath(wasmWorkerPath),
      wasmBinary: createAbsolutePath(wasmBinaryPath),
    };
    // Register Amazon IVS as playback technology for Video.js
    registerIVSTech(videojs, options);
    // register the quality plugin
    registerIVSQualityPlugin(videojs);

    // // create the player with the appropriate types. We're using @types/video.js VideoJsPlayer, and intersecting our Player and Quality Plugin interface
    const player = videojs(
      "amazon-ivs-videojs",
      {
        techOrder: ["AmazonIVS"],
        autoplay: true,
      },
      function () {
        console.warn("Player is ready to use");
      }
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    // // enable the quality plugin
    player.enableIVSQualityPlugin();

    // listen to IVS specific events
    const events: VideoJSEvents = player.getIVSEvents();
    const ivsPlayer = player.getIVSPlayer();
    ivsPlayer.addEventListener(events.PlayerState.PLAYING, () => {
      console.log("IVS Player is playing");
    });

    setPlayer(player);
  }, []);

  const handleClick = () => {
    // Get playback URL from Amazon IVS API 
    // Test URL from amazon-ivs-player-web-sample project (https://github.com/aws-samples/amazon-ivs-player-web-sample)
    var PLAYBACK_URL =
      "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8";
    player.src(PLAYBACK_URL);
  };

  return (
    <div className="video-container">
      <video
        style={{width: 500, height: 350}}
        id="amazon-ivs-videojs"
        className="video-js vjs-4-3 vjs-big-play-centered"
        controls
        playsInline
      ></video>
      <button onClick={handleClick}>재생!</button>
    </div>
  );
}
