import nodemailer from 'nodemailer';

export class MailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        this.init();
    }

    private async init() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        this.transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log('Nodemailer test account created:', testAccount.user);
    }

    async sendPasswordEmail(to: string, password: string, name: string) {
        if (!this.transporter) {
            console.log('Mail transporter not initialized yet, waiting 1s...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!this.transporter) {
            console.error('Failed to send email: Mail transporter not initialized.');
            return;
        }

        try {
            // send mail with defined transport object
            let info = await this.transporter.sendMail({
                from: '"CodeSchool" <noreply@codeschool.ru>', // sender address
                to: to, // list of receivers
                subject: "Ваш аккаунт в CodeSchool успешно создан! \uD83C\uDF89", // Subject line
                text: `Здравствуйте, ${name}!\n\nВаш аккаунт успешно создан.\nВаш пароль для входа: ${password}\n\nДобро пожаловать!`, // plain text body
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #4F46E5;">Здравствуйте, ${name}!</h2>
                        <p>Ваш личный кабинет в онлайн-школе программирования <b>CodeSchool</b> успешно создан.</p>
                        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 16px;">Ваш пароль для входа:</p>
                            <h3 style="margin: 10px 0 0 0; color: #111827; letter-spacing: 2px;">${password}</h3>
                        </div>
                        <p>С уважением,<br>Команда CodeSchool</p>
                    </div>
                `, // html body
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error("Error sending email:", error);
        }
    }
}

export const mailService = new MailService();
