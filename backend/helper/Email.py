
from flask_mail import Message, Mail

from threading import Thread
import time

class EmailHelper(object):

    def __init__(self,app):
        self.app = app
        self.mail = Mail(app)

    def send_async_email(self,msg):
        with self.app.app_context():
            self.mail.send(msg)

    def sendEmail(self,title = "MitoCube - Sample Submission", html= None, body = "Welcome to MitoCube",recipients = []):

        msg = Message(title, recipients = recipients, cc = [self.app.config["MAIL_DEFAULT_SENDER"]])
        msg.body = body
        msg.html = html
        thr = Thread(target=self.send_async_email,args=[msg])
        thr.start()
        return True