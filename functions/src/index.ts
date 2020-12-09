import * as functions from 'firebase-functions';
import {reCAPTCHA_SECRET} from './constants';
import axios from 'axios';
// const nodemailer = require('nodemailer').;
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';
cors({origin: ['https://gamezordd.github.io', 'http://127.0.0.1']});

exports.verify_reCAPTCHA = functions.https.onRequest(async (req,res) => {
    return cors()(req,res, async () => {
        try {
            const {token, contact, subject, message} = req.body;
            // console.log("token= ", token);
            if(!token || !contact || !subject || !message) throw new Error('Incomplete Request');
            let score = 0;

            const x = await axios.post('https://www.google.com/recaptcha/api/siteverify' + '?secret=' + reCAPTCHA_SECRET + '&response=' + token);
                // console.log(x.data);
            if(x.status === 200){
                if(x.data?.success){
                    score = x.data?.score;
                }
                else{
                    console.log(x.data);
                    return res.status(500).send({success: false, "Server Error" : x?.data['error-codes']?.length > 0 ? x?.data['error-codes'] : 'Unknown error'}).end();
                }
            }
            
            if(score > 0.6){
                const smtpTransport = nodemailer.createTransport({
                    service: "Gmail",
                    auth:{
                        user: "amartyamishrawebfolio@gmail.com",
                        pass:"9edCKFWH5XmM",
                    },
                });
                const mailConfig = {
                    from: contact,
                    to: 'amartyamishrawebfolio@gmail.com',
                    subject: `${contact}: ` + subject,
                    text: message,
                }
                smtpTransport.sendMail(mailConfig, (err, resp) => {
                    if(err){
                        throw new Error(err.toString());
                    }
                })
                return res.status(200).send({success: true}).end();
            }
            else{
                return res.status(500).send({success: false, token: token ? token : "Token Not Found"}).end();
            }
        } catch (err) {
            console.error('Error', err.toString());
            return res.status(500).send({success: false, errorMessage: 'Request Failed: ' + err.toString()}).end();
        }
    })
	
});
