import nodemailer from "nodemailer";
import multer from "multer";
import AWS from "aws-sdk";
import "dotenv/config";

/***************************************
    PORT & APPLICATION CONFIGRATIONS
***************************************/

export const APP_ENV = process.env.hasOwnProperty('APP_ENV') ? process.env.APP_ENV : 'local';
export const PORT = process.env.hasOwnProperty('PORT') ? process.env.PORT : '2023';
export const JWT_SECRET_TOKEN = process.env.hasOwnProperty('JWT_SECRET_TOKEN') ? process.env.JWT_SECRET_TOKEN : '32c103437dbee3dae37dcbe8cd459226fc47bbd9942e335c088a9ecbf908fe8fa7f828e4c8c354e1bf07f3ac2c084610b3e83d18a91b65e390ee83231312eefb';
export const JWT_EXPIRES_IN = process.env.hasOwnProperty('JWT_EXPIRES_IN') ? process.env.JWT_EXPIRES_IN : '24h';
 

/***************************
    DATABASE CONFIGRATIONS
***************************/

export const DB_HOST = process.env.hasOwnProperty('DB_HOST') ? process.env.DB_HOST : '127.0.0.1';
export const DB_PORT = process.env.hasOwnProperty('DB_PORT') ? process.env.DB_PORT : '27017';
export const DB_NAME = process.env.hasOwnProperty('DB_NAME') ? process.env.DB_NAME : 'octopus';


/***************************
        AWS CREDENTIALS
***************************/

const AWS_S3_ACCESS_KEY = process.env.hasOwnProperty('AWS_S3_ACCESS_KEY') ? process.env.AWS_S3_ACCESS_KEY : 'AKIAZZGJRL7GMGPB7PJV';
const AWS_S3_SECRET_ACCESS_KEY = process.env.hasOwnProperty('AWS_S3_SECRET_ACCESS_KEY') ? process.env.AWS_S3_SECRET_ACCESS_KEY : 'Dtui7n7FKMelE4BS8F5xL5p4ZxliGXnowjLMFuzu';
const AWS_S3_BUCKET_REGION = process.env.hasOwnProperty('AWS_S3_BUCKET_REGION') ? process.env.AWS_S3_BUCKET_REGION : 'ap-southeast-1';
export const AWS_S3_BUCKET = process.env.hasOwnProperty('AWS_S3_BUCKET') ? process.env.AWS_S3_BUCKET : 'skinocare';
export const EXPIRES_SINGNED_URL = process.env.hasOwnProperty('EXPIRES_SINGNED_URL') ? process.env.EXPIRES_SINGNED_URL : 300 // = 60 * 5min;

const awsConfig = {accessKeyId: AWS_S3_ACCESS_KEY,secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,region: AWS_S3_BUCKET_REGION}
export const S3 = new AWS.S3(awsConfig);



/***************************
    MAILER CONFIGRATIONS
***************************/

const EMAIL_HOST = process.env.hasOwnProperty('EMAIL_HOST') ? process.env.EMAIL_HOST : 'smtp.gmail.com';
export const EMAIL_FROM = process.env.hasOwnProperty('EMAIL_FROM') ? process.env.EMAIL_FROM : 'softfix2020@gmail.com';
const EMAIL_PASSWORD = process.env.hasOwnProperty('EMAIL_PASSWORD') ? process.env.EMAIL_PASSWORD : 'btwqddfoiuhinrbo';
export const mailer = nodemailer.createTransport({ host: EMAIL_HOST, port: 465, secure: true, auth: { user: EMAIL_FROM, pass: EMAIL_PASSWORD, }, });


/***************************
    MULTER CONFIGRATIONS
***************************/

export const multerImageUpload = multer({limits: {fileSize: 1024 * 1024 * 5,},fileFilter: function (req, file, done) {if (file.mimetype === "image/jpeg" ||file.mimetype === "image/png" ||file.mimetype === "image/jpg" ||file.mimetype === "image/webp") {done(null, true);} else {var newError = new Error("File type is incorrect");newError.name = "MulterError";done(newError, false);}},});

/***************************
    AWS SAVING FILE PATH
***************************/


export const uploadsPath = (type)=>{
    var array = { Category : "uploads/categories" ,Product : "uploads/products",Testimonial: "uploads/testimonials", CaseStudy:"uploads/case_studies" };
    return `${array[type]}`;

}  


/***************************
    RAZORPAY CONFIGRATIONS
***************************/

export const RAZORPAY_KEY_ID = process.env.hasOwnProperty('RAZORPAY_KEY_ID') ? process.env.RAZORPAY_KEY_ID: 'rzp_test_YJWihDNp5IscjX';

export const RAZORPAY_KEY_SECRET = process.env.hasOwnProperty('RAZORPAY_KEY_SECRET') ? process.env.RAZORPAY_KEY_SECRET: 'CG6yDlSdpQXHK71t4mfKcP5D'; 