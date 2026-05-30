"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailService = exports.MailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailService {
    constructor() {
        this.transporter = null;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            let testAccount = yield nodemailer_1.default.createTestAccount();
            // create reusable transporter object using the default SMTP transport
            this.transporter = nodemailer_1.default.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            console.log('Nodemailer test account created:', testAccount.user);
        });
    }
    sendPasswordEmail(to, password, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.transporter) {
                console.log('Mail transporter not initialized yet, waiting 1s...');
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (!this.transporter) {
                console.error('Failed to send email: Mail transporter not initialized.');
                return;
            }
            try {
                // send mail with defined transport object
                let info = yield this.transporter.sendMail({
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
                console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
            }
            catch (error) {
                console.error("Error sending email:", error);
            }
        });
    }
}
exports.MailService = MailService;
exports.mailService = new MailService();
