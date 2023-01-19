require('dotenv').config()
require("./db");
const express = require('express')
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const { uploadBytes, ref, getDownloadURL } = require('firebase/storage');
const { storage, database } = require('./firebase');
const { addDoc, collection } = require('firebase/firestore');
const port = process.env.PORT || 8000

const app = express();

app.use(
    fileUpload({
        limits: {
            fileSize: 50000000, // Around 50MB
        },
        abortOnLimit: true,
    })
);

app.use('/video-app/converted-videos', express.static('./converted-videos'));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());



app.get('/video-app', async (req, res) => {
    try {
        const videos = await db.videos.findAll({})
        res.send({ messgae: 'success', videos })
    } catch (error) {
        res.send(error)
    }
})

app.post('/video-app', async (req, res) => {
console.log(req.files.video)    

    const name = new Date().getTime();

    // Removes Previously Added Videos
    fs.readdir('raw-videos', (err, files) => {
        if (err) {
            return res.status(500).send({ message: 'Internal Sevrer error' })
        }

        for (const file of files) {
            fs.unlink(path.join('raw-videos', file), (err) => {
                if (err) {
                    return res.status(500).send({ message: 'Internal Sevrer error' })
                }
            });
        }
    });

    // Creates a raw video in the raw-videos dir
    fs.writeFile(`./raw-videos/${name}.mp4`, req.files.video.data, "binary", function (err) {
        if (err) {
            res.status(500).send({ message: 'Internal Sevrer error' })
        } else {

            // Reads the raw-videos dir after creation
            fs.readdir('./raw-videos/', (err, files) => {
                if (err) {
                    res.status(500).send({ message: 'Internal Sevrer error' })
                } else {

                    // converts the raw video to add text and push it to converted-videos dir
                    files.map(f => {
                        const command = ffmpeg({ source: `./raw-videos/${f}` })
                        command
                            .format('mp4')
                            .videoFilters({
                                filter: 'drawtext',
                                options: {
                                    text: 'What Is The Longest River In The World ?',
                                    fontsize: '(h/25)',
                                    fontcolor: 'white',
                                    box: 1,
                                    boxborderw: 10,
                                    boxcolor: 'black@0.3',
                                    x: 10,
                                    y: 10,
                                }
                            })
                            .outputOptions(['-frag_duration 100', '-movflags frag_keyframe+empty_moov', '-pix_fmt yuv420p'])
                            .output(`converted-videos/${name}.mp4`)
                            .on('error', (err, stdout, stderr) => {
                                console.log('err', err.message)
                                console.log('stdout', stdout)
                                console.log('stderr', stderr)
                            })
                            .on('progress', (progress) => {

                                progress.percent > 99.9 && fs.readdir('./converted-videos', async (err, files) => {
                                    if (err) {
                                        res.status(500).send({ message: 'Internal Sevrer error', error: err })
                                    } else {
                                        const file = files[files.length - 1]
                                        fs.readFile(`./converted-videos/${file}`, async (error, item) => {
                                            if (error) {
                                                res.status(500).send({ message: 'Internal Sevrer error', error })
                                            } else {
                                                const refrence = ref(storage, `${file}`)
                                                const snap = await uploadBytes(refrence, item)
                                                const url = await getDownloadURL(ref(storage, snap.ref.fullPath))

                                                await addDoc(collection(database, 'videos'), {
                                                    media: url,
                                                    name
                                                })

                                                res.send({ message: "Video Uploaded Successfully" })
                                            }
                                        })
                                    }
                                })

                            }).run();
                    });
                }
            })
        }
    });
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
