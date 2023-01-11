const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const cors = require("cors");
const db = require("./db");
const path = require("path");
const port = process.env.PORT || 8000;

const app = express();

require("./db");
app.use(
  fileUpload({
    limits: {
      fileSize: 50000000, // Around 50MB
    },
    abortOnLimit: true,
  })
);

app.use("/converted-videos", express.static("./converted-videos"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.get("/video-app", async (req, res) => {
  try {
    const videos = await db.videos.findAll({});
    res.send(videos);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/video-app", async (req, res) => {
  fs.writeFile(
    `./raw-videos/${req.files.video.name}`,
    req.files.video.data,
    "binary",
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        fs.readdir("./raw-videos/", (err, files) => {
          if (err) {
            res.status(500).send({ message: "Internal Sevrer error" });
          } else {
            const removeRawVideo = () => {
              fs.readdir("raw-videos", (err, files) => {
                if (err) throw err;

                for (const file of files) {
                  fs.unlink(path.join("raw-videos", file), (err) => {
                    if (err) throw err;
                  });
                }
              });
            };

            const convertVideo = () => {
              files.map((f) => {
                const command = ffmpeg({source:`./raw-videos/${f}`});
                command
                  .format("mp4")
                  .videoFilters({
                    filter: "drawtext",
                    options: {
                      text: "What Is The Longest River In The World ?",
                      fontsize: "(h/25)",
                      fontcolor: "white",
                      box: 1,
                      boxborderw: 10,
                      boxcolor: "black@0.5",
                      x: 10,
                      y: 10,
                    },
                  })
                  .outputOptions([
                    "-frag_duration 100",
                    "-movflags frag_keyframe+empty_moov",
                    "-pix_fmt yuv420p",
                  ])
                  .output(`converted-videos/${f}`)
                  .on("error", function (err, stdout, stderr) {
                    console.log("err", err.message);
                    console.log("stdout", stdout);
                    console.log("stderr", stderr);
                  })
                  .run();
              });
            };

            const data = {
              video: `/converted-videos\\${req.files.video.name.replace(
                / /g,
                ""
              )}`,
              name: req.files.name,
            };

            db.videos
              .create(data)
              .then((data) => {
                // removeRawVideo()
                res.send({ status: "success", ...data.dataValues });
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(500)
                  .send({ status: "error", message: "Internal Server Error" });
              });
            convertVideo();
          }
        });
      }
    }
  );
});

app.listen(port, () => {
  console.log("first");
});
