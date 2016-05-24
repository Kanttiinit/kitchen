const AWS = require('aws-sdk');

const Bucket = 'kanttiinit';
const region = 'eu-central-1';
const s3 = new AWS.S3({signatureVersion: 'v4', region});

function getUrl(key) {
   return 'https://s3.' + region + '.amazonaws.com/' + Bucket + '/' + key;
}

module.exports = {
   upload(buffer, filename) {
      return new Promise((resolve, reject) => {
         s3.upload({
            Bucket,
            Key: filename,
            Body: buffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
         },
         function(err, data) {
            if (err)
               reject(err);
            else
               resolve(data.Location);
         });
      });
   },
   getUrl(filename) {
      return new Promise((resolve, reject) => {
         s3.headObject({Bucket, Key: filename}, function(err, data) {
            if (err)
               resolve(undefined);
            else
               resolve(getUrl(filename));
         });
      });
   }
};
