import Jimp from 'jimp';

Jimp.read('public/logo.png').then(image => {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    var red = this.bitmap.data[idx + 0];
    var green = this.bitmap.data[idx + 1];
    var blue = this.bitmap.data[idx + 2];
    if (red > 240 && green > 240 && blue > 240) {
      this.bitmap.data[idx + 3] = 0; // alpha to 0
    }
  });
  image.write('public/logo_transparent.png');
  console.log("Done generating transparent logo!");
});
