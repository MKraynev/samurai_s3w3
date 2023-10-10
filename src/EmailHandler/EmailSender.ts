import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MAIL_LOGIN, MAIL_PASSWORD } from "../../settings";

export class EmailSender{
  private login: string;
  private password: string;
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    constructor(login: string, password: string) {
        this.login = login;
        this.password = password;

        this.transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: this.login,
            pass: this.password
          }
        });
    }

    public async SendRegistrationMail(mailTo: string, destinationPath: string, linkVal: string){
      let sendObj = {
        from: `"SAMURAI 🥷"<${this.login}@gmail.com>`,
        to: mailTo,
        subject: "Testing email registration",
        html:`
        <p>To finish registration please follow the link below:
        <a href='${destinationPath}?code=${linkVal}'>complete registration</a>
        </p>`,
      };

      const info = await this.transporter.sendMail(sendObj, (err, data) =>{
        if(err){
          console.log("Some problems with sending email");
        }
      });
    }

    public async SendRefreshPasswordMail(mailTo: string, destinationPath: string, linkVal: string){
      let sendObj = {
        from: `"SAMURAI 🥷"<${this.login}@gmail.com>`,
        to: mailTo,
        subject: "Testing email registration",
        html:`
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
        <a href='${destinationPath}?recoveryCode=${linkVal}'>recovery password</a>
        </p>`,
      };
      const info = await this.transporter.sendMail(sendObj, (err, data) =>{
        if(err){
          console.log("Some problems with sending email");
        }
      })
    }
}

export const emailSender = new EmailSender(MAIL_LOGIN, MAIL_PASSWORD);

