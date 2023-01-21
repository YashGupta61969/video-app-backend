require("dotenv").config();
// require("./db");
const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { uploadBytes, ref, getDownloadURL } = require("firebase/storage");
const { storage, database } = require("./firebase");
const { addDoc, collection } = require("firebase/firestore");
const port = process.env.PORT || 8000;

const app = express();

const upload = multer({ dest: 'raw-videos/' }).single('video')

app.use("/video-app/converted-videos", express.static("./converted-videos"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.get("/video-app", async (req, res) => {
  try {
    // const videos = await db.videos.findAll({})
    res.send({ messgae: "success API Working" });
  } catch (error) {
    res.send({ error });
  }
});

app.post("/video-app", upload, async (req, res) => {
  const name = new Date().getTime();

  // Reads the raw-videos dir after creation
  fs.readdir("./raw-videos/", (err, files) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Internal Sevrer error", error5: err });
    } else {
      // converts the raw video to add text and push it to converted-videos dir
      const command = ffmpeg({ source: `./raw-videos/${files[0]}` });
      command
        .format("mp4")
        .videoFilters({
          filter: "drawtext",
          options: {
            text: "What Is Longest River In The World?",
            fontsize: 150,
            fontcolor: "white",
            box: 1,
            boxborderw: 15,
            fontfile:'./adventpro-bold.ttf',
            boxcolor: "black@0.4",
            x: 10,
            y: 10,
          },
        })
        .outputOptions([
          "-frag_duration 100",
          "-strict -2",
          "-movflags frag_keyframe+empty_moov",
          "-pix_fmt yuv420p",
        ])
        .output(`converted-videos/${name}.mp4`)
        .on("error", (err, stdout, stderr) => {
          res.send({ stderr });
        })
        .on("progress", (progress) => {
          progress.percent > 99 &&
            fs.readdir("./converted-videos", async (err, files) => {
              if (err) {
                return res
                  .status(500)
                  .send({ message: "Internal Sevrer error", error: err });
              } else {
                const file = files[0];
                fs.readFile(
                  `./converted-videos/${file}`,
                  async (error, item) => {
                    if (error) {
                      return res
                        .status(500)
                        .send({ message: "Internal Sevrer error", error });
                    } else {
                      const refrence = ref(storage, `${file}`);
                      const snap = await uploadBytes(refrence, item);
                      const url = await getDownloadURL(
                        ref(storage, snap.ref.fullPath)
                      );
                      await addDoc(collection(database, "videos"), {
                        media: url,
                        name,
                      });

                      // Removes Previously Added Videos
                      fs.readdir("./raw-videos", (err, files) => {
                        if (err) {
                          return res.status(500).send({
                            message: "Internal Sevrer error",
                            error1: err,
                          });
                        }

                        for (const file of files) {
                          fs.unlink(path.join("raw-videos", file), (err) => {
                            if (err) {
                              return res.status(500).send({
                                message: "Internal Sevrer error",
                                error2: err,
                              });
                            }
                          });
                        }
                      });

                      // Removes Previously converted Videos
                      fs.readdir("converted-videos", (err, files) => {
                        if (err) {
                          return res.status(500).send({
                            message: "Internal Sevrer error",
                            error3: err,
                          });
                        }

                        for (const file of files) {
                          fs.unlink(
                            path.join("converted-videos", file),
                            (err) => {
                              if (err) {
                                return res.status(500).send({
                                  message: "Internal Sevrer error",
                                  error4: err,
                                });
                              }else{
                                  return res.send({
                                    message: "Video Uploaded Successfully",
                                  });
                              }
                            }
                          );
                        }
                      });

                    }
                  }
                );
              }
            });
        })
        .run();
    }
  });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
