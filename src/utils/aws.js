import AWS from 'aws-sdk';

const Bucket = 'kanttiinit';
const region = 'eu-central-1';
const s3 = new AWS.S3({signatureVersion: 'v4', region});

function getBaseUrl(key) {
  return 'https://s3.' + region + '.amazonaws.com/' + Bucket + '/' + key;
}

export const upload = (buffer, filename) =>
  new Promise((resolve, reject) => {
    s3.upload({
      Bucket,
      Key: filename,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    },
    (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });

export const getUrl = filename =>
  new Promise((resolve, reject) => {
    s3.headObject({Bucket, Key: filename}, function(err, data) {
      if (err) {
        resolve(undefined);
      } else {
        resolve(getBaseUrl(filename));
      }
    });
  });
