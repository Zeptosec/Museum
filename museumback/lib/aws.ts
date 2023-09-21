import aws from 'aws-sdk';
import fs from 'fs';
aws.config.update({
    // Your SECRET ACCESS KEY from AWS should go here,
    // Never share it!
    // Setup Env Variable, e.g: process.env.SECRET_ACCESS_KEY
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // Not working key, Your ACCESS KEY ID from AWS should go here,
    // Never share it!
    // Setup Env Variable, e.g: process.env.ACCESS_KEY_ID
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION // region of your bucket
});

export const s3 = new aws.S3();

export const uploadFile = (filedata: Buffer) => {
    fs.writeFileSync('filt.jpg', filedata);
    // fs.readFile('filet.jpg', (err, data) => {
    //    if (err) throw err;
    //    const params = {
    //        Bucket: 'testBucket', //  bucket name
    //        Key: 'image.png', // filename
    //        Body: JSON.stringify(data, null, 2)
    //    };
    //    s3.upload(params, function(s3Err, data) {
    //        if (s3Err) throw s3Err;
    //        console.log(`File uploaded successfully at ${data.Location}`);
    //    });
    // });
};