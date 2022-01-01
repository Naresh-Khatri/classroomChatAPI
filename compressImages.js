import  imagemin from 'imagemin'
import  imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
(async() => {
  const files = await imagemin(
      ['images/*.png', 'another_dir/*-small.png'],
      {
        destination: 'destination_dir',
        plugins: [imageminMozjpeg({quality: 50}),
          imageminPngquant({quality: [0.0, 0.005]})]
      }
  );
  console.log(files);
})();