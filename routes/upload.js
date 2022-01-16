import fs from "fs";

import express from "express";
import multer from "multer";
// import pdf from 'pdf-thumbnail'

import StudyMaterial from "../Models/StudyMaterial.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/materials");
  },
  filename: (req, file, cb) => {
    console.log(req.body);
    cb(null, `${req.body.uid}-${Date.now()}.${req.body.fileName}`);
  },
});

const upload = multer({ storage: storage });

//upload attachment
router.post("/pdf", upload.single("file"), async (req, res) => {
  console.log(req.file);
  console.log(req.body);
  //create new study material object
  const studyMaterialInfo = {};
  try {
    studyMaterialInfo.title = req.body.title;
    studyMaterialInfo.description = req.body.description;
    studyMaterialInfo.subject = req.body.subject;
    studyMaterialInfo.classroomID = req.body.classroomID;
    studyMaterialInfo.createdUser = req.body.uid;
    // studyMaterialInfo.classroomID = req.body.classroomID

    // studyMaterialInfo.previewPath = await createPdfPreview(req.file.filename)
    studyMaterialInfo.fileName = req.file.filename;
    studyMaterialInfo.fileType = req.file.mimetype.split("/")[1];
    studyMaterialInfo.fileSize = req.file.size;
    studyMaterialInfo.filePath = req.file.path;
    const studyMaterial = new StudyMaterial(studyMaterialInfo);
    studyMaterial.save();
    res.send("pdf uploaded");
  } catch (err) {
    console.log('error when uploading pdf', err);
    res.status(400).send({ msg: "check your inputs" });
  }
});

router.get("/materials/:classroomID", (req, res) => {
  StudyMaterial.find({ classroomID: req.params.classroomID })
    .sort({ timestamp: -1 })
    .exec((err, studyMaterials) => {
      if (err) {
        console.log("error in finding study materials", err);
        res.status(404).send({ message: "error in finding study materials" });
      }
      res.send(studyMaterials);
    });
});
router.get("/material/:id", (req, res) => {
  console.log("getting material", req.params.id);
  StudyMaterial.findById(req.params.id, (err, studyMaterial) => {
    if (err) {
      console("error while getting single study material", err);
      res
        .status(404)
        .send({ message: "error while getting single study material" });
    }
    res.download("uploads/materials/" + studyMaterial.fileName, "okayokay.pdf");
  });
});

router.delete("/material/:id", (req, res) => {
  console.log("deleting material", req.params);
  // res.send('deleting material');
  StudyMaterial.findByIdAndDelete(req.params.id, (err, studyMaterial) => {
    if (err) {
      console.log("couldnt delete study material", err);
      res.status(404).send({ message: "couldnt delete study material" });
    }
    res.status(200).send({ message: "study material deleted" });
  });
});

router.get("/", (req, res) => {
  res.send("hello");
});

// const createPdfPreview = (filename) => {
//     return new Promise((resolve, reject) => {
//         console.log('creating preview')
//         pdf(fs.readFileSync('uploads/materials/' + filename))
//             .then(data => {
//                 const path = `uploads/materials/preview-${filename}.jpg`
//                 data.pipe(fs.createWriteStream(path))
//                 console.log(path)
//                 resolve(path)
//             })
//             .catch(err => {
//                 console.log('error in creating preview', err)
//             })
//     })
// }

export default router;
