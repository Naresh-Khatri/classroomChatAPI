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
    let filename = "";
    if (file.fieldname === "preview") {
      filename = `${req.body.uid}-${Date.now()}-${file.originalname}.png`;
    } else {
      filename = `${req.body.uid}-preview-${Date.now()}-${file.originalname}`;
    }
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.use(express.static("uploads/"));

//upload attachment
const cpUpload = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "preview", maxCount: 1 },
]);
router.post("/pdf", cpUpload, async (req, res) => {
  //create new study material object
  const studyMaterialInfo = {};
  try {
    studyMaterialInfo.title = req.body.title;
    studyMaterialInfo.description = req.body.description;
    studyMaterialInfo.subject = req.body.subject;
    studyMaterialInfo.classroomID = req.body.classroomID;
    studyMaterialInfo.createdUser = req.body.uid;

    studyMaterialInfo.previewPath = req.files["preview"][0].path;
    studyMaterialInfo.fileName = req.files["file"][0].filename;
    studyMaterialInfo.fileType = req.files["file"][0].mimetype.split("/")[1];
    studyMaterialInfo.fileSize = req.files["file"][0].size;
    studyMaterialInfo.filePath = req.files["file"][0].path;
    const studyMaterial = new StudyMaterial(studyMaterialInfo);
    studyMaterial.save();
    res.send("pdf uploaded");
  } catch (err) {
    console.log("error when uploading pdf", err);
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

export default router;
