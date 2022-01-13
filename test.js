import pdf from 'pdf-thumbnail'
import fs from 'fs'

const pdfBuffer = fs.readFileSync('./uploads/materials/ipZVQgDR5Wdixl5EfR48I6rPtkG3-1642055742380.CSE-R19_2nd-Year-Course-Structure-Syllabus.pdf');

pdf(pdfBuffer, /*Buffer or stream of the pdf*/)
    .then(data /*Stream of the image*/ => {
        data.pipe(fs.createWriteStream('./uploads/materials/example.jpg'));
    })
    .catch(err => console.log(err))

// pdf(fs.createReadStream(`./uploads/materials/ipZVQgDR5Wdixl5EfR48I6rPtkG3-1642054020086.CSE-R19_2nd-Year-Course-Structure-Syllabus.pdf`))
//     .then(data /*is a stream*/ => {
//         data.pipe(fs.createWriteStream("./previewStream.jpg"))
//         console.log(data)
//     })
//     .catch(err => console.error(err))

