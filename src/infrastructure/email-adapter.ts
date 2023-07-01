import nodemailer from 'nodemailer';
import { EmailConfig } from './configuration/email.configuration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapter {
  private TECH_EMAIL: string;
  private TECH_EMAIL_PASSWORD: string;

  constructor(private readonly emailConfig: EmailConfig) {
    const settings = emailConfig.getEmailSettings();
    this.TECH_EMAIL = settings.TECH_EMAIL;
    this.TECH_EMAIL_PASSWORD = settings.TECH_EMAIL_PASSWORD;
  }

  async sendEmail(email: string, subject: string, textMessage: string) {
    const transport = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      // service: "gmail",
      auth: {
        user: this.TECH_EMAIL,
        pass: this.TECH_EMAIL_PASSWORD,
      },
    });

    const message = {
      from: `Learning platform <${this.TECH_EMAIL}>`,
      to: email,
      subject: subject,
      html: textMessage,
    };

    // let info = await transport.sendMail(message);

    await new Promise((resolve, reject) => {
      transport.sendMail(message, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }
}
