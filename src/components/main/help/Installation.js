import { Code, Pre } from "@blueprintjs/core";
import { MCHeader } from "../../utils/components/MCHeader";


function MCVenvSpan() {
    return <span className="help-venv-span">venv</span>
}

function MCProjectSpan() {
    return <span className="help-project-span">mitocube</span>
}

function MCDomainSpan() {
    return <span className="help-domain-span">your_domain</span>
}

export function MCInstallationHelp() {
    
    return (
        <div className="help-installation-container">
            <MCHeader text="MitoCube App Installation" fontSize="1.5rem"/>
            <div className="help-info-content">
            <MCHeader text="Installation using Gunicorn and nginx on Ubuntu 22.04"/>



            <MCHeader text="Requirements" />
            <ul>
                <li>Python 3.10 installed</li>
                <li>Nodejs v.16.xx installed (requires curl)</li>
                <li>A server with Ubuntu 22.04 installed and a non-root user with sudo privileges</li>
                <li>Nginx installed</li>
                <li>Optional: A domain name configured to point to your server.</li>
            </ul>
            <div className="vert-align-div-flexStart">
                <p>
                    First,update the local package index and install the packages that will allow you to build your Python environment.
                    These will include python3-pip, along with a few more packages and development tools necessary for a robust programming environment:
                </p>
                {["sudo apt update", "sudo apt install python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools"].map(
                    codeText => <Code key={codeText}>{codeText}</Code>)
                }
                <p>Install git to clone the GitHub MitoCube repository if you haven't already.</p>
                <Code>
                    sudo apt install git
                </Code>
                <p>Create a folder to init a git and pull the repository from github.</p>
                {["mkdir mitocube","git init","git pull https://github.com/hnolcol/mitocube"].map(codeText => <Code key={codeText}>{codeText}</Code>)}
                    <p>Then, create an .env file that is used by the python-decouple package and handles the passwords. .env files are not pushed to the repository. You should not save the password in any other file.</p>
                    <p>Info: We will likely implement a utility python function to create this file which will not save plain text passwords but the hash.</p>
                    <p>First create the file</p>
                    <Code>sudo nano .env</Code>
                    <Pre>
                        {
    `
    mitocube-pw="PASSWORD TO ENTER WEBSITE"
    email-pw="EMAIL ACCOUNT PASSWORD"
    email-admin="SUPER ADMIN EMAIL"
    pw-admin="SUPER ADMIN PASSWORD"`
                    }
                    </Pre>
                    <p>Please note that other email settings should be defined in the main <a href="/help/config">config file.</a></p>
                    <p>Save the file by ctrl-x, shift-Y and enter.</p>
                </div>
            
            <MCHeader text="Install javascript reactjs packages" />
            <div className="vert-align-div-flexStart">
                <p>Install packages from packages.json file obtained from GitHub repository.</p>
                <Code>yarn add</Code>
                <p>Then build the index.html file which will be rendered by the Flask App (@app.route("/") in the App.py file and nginx config) from the build/static folder.</p>
                <Code>yarn build</Code>
                <p>The output should look like this.</p>
                <Pre>
                    <Code>
                        {   `
    ....
    The project was built assuming it is hosted at /.
    You can control this with the homepage field in your package.json.

    The build folder is ready to be deployed.
    You may serve it with a static server:

        yarn global add serve
        serve -s build

    Find out more about deployment here:

    https://cra.link/deployment

    Done in 13.81s.
    `
                    }
                </Code>
                </Pre>
            </div>


            <MCHeader text="Create a python virtual environment in the folder" />
            <div className="vert-align-div-flexStart">
                <p>Next, you’ll set up a virtual environment in order to isolate the Flask application from the other Python files on your system. Start by installing the python3-venv package, which will install the venv module:</p>
            <Code>
                sudo apt install python3-venv
            </Code>
                <p>Creat the virtual environment (here name: venv) if you are using a different name you will have to change the name in the following setup</p>
            <Code>python3 -m venv <span className="help-venv-span">venv</span></Code>
                <p>Then activate the virtual env by using</p>
                <Code>source {<MCVenvSpan />}/bin/activate</Code>
            </div>
            <MCHeader text="Install python packages" />
            <div className="vert-align-div-flexStart">
                <Code>({<MCVenvSpan />}) $ pip3 install -r requirements.txt</Code>
            
            <p>In order to test the application, we will have to allow the port 5000</p>
            <Code>({<MCVenvSpan />}) $ sudo ufw allow 5000</Code>
            <p>The application starts by executing the App.py file as follows. (might be python instead of python3 depending on your installed python versions).</p>
            <Code>({<MCVenvSpan />}) $ python3 App.py</Code>
            <p>You should see something like this:</p>
                <Pre>
                    <Code>
                    {   `
    Serving Flask app 'App' (lazy loading)
    Environment: production
    ....
    Running on http://<server_ip>:5000/ (Press CTRL+C to quit)`
                    }
                </Code>
                </Pre>
                
                <p>Close the app by using ctrl+c. You have successfully installed the backend.</p>
            </div>
            <MCHeader text="Creating the WSGI Entry Point" />
            <div className="vert-align-div-flexStart">
            <p>Next, create a file that will serve as the entry point for your application. This will tell the Gunicorn server how to interact with the application.</p>
            <Code>({<MCVenvSpan />}) $ sudo nano ~/mitocube/wsgi.py</Code>
            <Pre>
                
                { `
    from App import app
    if __name__ == "__main__":
        app.run()`}
               
            </Pre>
           <p>Enter the code and press ctrl-x, then shift-Y and enter to save the file.</p>
           </div>
           <MCHeader text="Creating the WSGI Entry Point" />
            <div className="vert-align-div-flexStart">
                <p>After the entry point is established, lets check if gunicorn can serve the app correctly.</p>
                <p>You can do this by passing it the name of the app’s entry point. This is constructed as the name of the module (minus the .py extension), plus the name of the callable within the application. In this case, it is wsgi:app.</p>
                <p>Also specify binding to use the 0.0.0.0:5000 argument so that the application will be started on a publicly available interface:</p>
                <Code>({<MCVenvSpan />}) $ cd ~/{<MCProjectSpan/>}</Code>
                <Code>({<MCVenvSpan />}) $ gunicorn --bind 0.0.0.0:5000 wsgi:app</Code>
                The console output should look something like this.
                <Pre>
                    {   `
    [DATE] [46419] [INFO] Starting gunicorn 20.0.4
    [DATE] [46419] [INFO] Listening at: http://0.0.0.0:5000 (46419)
    [DATE] [46419] [INFO] Using worker: sync
    [DATE] [46421] [INFO] Booting worker with pid: 46421`
                    }
                </Pre>
                <p>When you have confirmed that it’s functioning properly, press CTRL-C in your terminal window. When you are done using the virtual environment, you can deactivate it:</p>
                <p>You can deactivate the virtual environment now.</p>
                <Code>({<MCVenvSpan />}) $ deactivate</Code>
            </div>
            <MCHeader text={"Service unit file."} />
            <div className="vert-align-div-flexStart">
            <p>Next, lets create the systemd service unit file. Creating a systemd unit file will allow Ubuntu’s init system to automatically start Gunicorn and serve the Flask application whenever the server boots.</p>
            <p>Start with creating the service file.</p>
                <Code>$ sudo nano /etc/systemd/system/{<MCProjectSpan/>}.service</Code>
            <p>Please not that you will have to replace the userName. By default 3 workers will be started by gunicorn.</p>
            <Pre>
                    {`
    [Unit]
    Description=Gunicorn instance to serve MitoCube
    After=network.target

    [Service]
    User=<userName>
    Group=www-data
    WorkingDirectory=/home/<userName>/mitocube
    Environment="PATH=/home/<userName>/mitocube/venv/bin"
    ExecStart=/home/<userName>/mitocube/venv/bin/gunicorn --workers 3 --bind unix:mitocube.sock -m 007 wsgi:app

    [Install]
    WantedBy=multi-user.target`
}
                </Pre>
            <p>Your systemd service file is complete. Save and close it now using Ctrl-x,Shift-y,Enter. You can now start the Gunicorn service that you created and enable it so that it starts at boot:</p>
                <Code>sudo systemctl start {<MCProjectSpan/>}</Code>
                <Code>sudo systemctl enable {<MCProjectSpan/>}</Code>
                <p>And check the status by using:</p>
                <Code>sudo systemctl status {<MCProjectSpan/>}</Code>
                <p>The output should looks similiar to this</p>
                <Pre>
                    {`
    Output
    ● mitocube.service - Gunicorn instance to serve mitocube
            Loaded: loaded (/etc/systemd/system/mitocube.service; enabled; vendor preset: enabled)
            Active: active (running) since <Date>; 9s ago
        Main PID: 17300 (gunicorn)
            Tasks: 4 (limit: 2327)
            Memory: 56.0M
            CPU: 514ms
            CGroup: /system.slice/mitocube.service
                    ├─17300 /home/<userName>/mitocube/venv/bin/python3 /home/<userName>/mitocube/venv/bin/gunicorn --workers 3 --bind unix:mitocube.sock -m 007 wsgi:app
                    ├─17301 /home/<userName>/mitocube/venv/bin/python3 /home/<userName>/mitocube/venv/bin/gunicorn --workers 3 --bind unix:mitocube.sock -m 007 wsgi:app
                    ├─17302 /home/<userName>/mitocube/venv/bin/python3 /home/<userName>/mitocube/venv/bin/gunicorn --workers 3 --bind unix:mitocube.sock -m 007 wsgi:app
                    └─17303 /home/<userName>/mitocube/venv/bin/python3 /home/<userName>/mitocube/venv/bin/gunicorn --workers 3 --bind unix:mitocube.sock -m 007 wsgi:app
    
    <Date> r systemd[1]: Started Gunicorn instance to serve mitocube.
    . . .
                    `}
                </Pre>
                <p>If you see any errors, be sure to resolve them before continuing with the tutorial.</p>
            </div>

            <MCHeader text="Configuring Nginx to Proxy Requests" />
            <div className="vert-align-div-flexStart">
                <p>
                    Your Gunicorn application server should now be up and running, waiting for requests on the socket file in the project directory.
                    Now you can configure Nginx to pass web requests to that socket by making some small additions to its configuration file.</p>
                <p>
                    Begin by creating a new server block configuration file in Nginx’s sites-available directory. Call this <span className="help-project-span">mitocube</span> to keep in line with the rest of the guide:</p>
                <Code>sudo nano /etc/nginx/sites-available/{<MCProjectSpan />}</Code>
                <p>In the file copy the follow. Make sure to replace userName in paths. In addition replace the server_name with your domain.</p>
                <p>If you do not have a domain yet, you can delete the server name line. Nginx will then listen to every request using port 80.</p>
                <Pre>
                    {`
    server {
        listen 80;
        server_name www.app.mitocube.com app.mitocube.com;
        root /home/<userName>/mitocube/build;
        index index.html;

        location /api {
                include proxy_params;
                proxy_pass http://unix:/home/<userName>/mitocube/mitocube.sock;
        }

        location / {
                try_files $uri $uri/ /index.html;
        }

        location /protein {
                try_files $uri $uri/ /index.html;
        }
                    `}
                </Pre>

            <p>Save the file and now link the server block to the sites-enabled directory.</p>
                    <Code>sudo ln -s /etc/nginx/sites-available/{<MCProjectSpan />} /etc/nginx/sites-enabled</Code>
                    <p>Lets test the syntax by using:</p>
                    <Code>sudo nginx -t</Code>
                    <p>If no error is returned, restart the Nginx process to read the new configuration:</p>
                    <Code>sudo systemctl restart nginx</Code>
                    <p>You can now adjust the firewall again to reject access via 5000 port.</p>
                    <Code>sudo ufw delete allow 5000</Code>
                    <Code>sudo ufw allow 'Nginx Full'</Code>
                    <p>In principle you should now be able to access your site via http://{<MCDomainSpan/>}</p>
                    <MCHeader text="HTTP 502 gateway error" hexColor="#b66476" />
                    <p>If the website shows a 502 gateway error, Nginx cannot access gunicorn’s socket file, which is often a result of restricted permission in the home folder.</p>
                    <p>f your socket file is called /home/<span style={{ color: "#b66476" }}>userName</span>/{<MCProjectSpan />}/{<MCProjectSpan />}.sock, ensure that /home/<span style={{ color: "#b66476" }}>userName</span>/ has a minimum of 0755 permissions.
                        You can use a tool like chmod to change the permissions like this:</p>
                    <Code>sudo chmod 755 /home/<span style={{ color: "#b66476" }}>userName</span></Code>
            </div>
            
            <MCHeader text="Securing your application using certbot."/>
                <div className="vert-align-div-flexStart">
                    <p>Note: there are numerous different options to implemtn SSL certificates, here we will use <a href="https://letsencrypt.org">Let's encrpyt.</a></p>
                    <p>Install Certbot’s Nginx package with apt:</p>
                    <Code>sudo apt install python3-certbot-nginx</Code>
                    <p>Certbot provides several ways to obtain SSL certificates using different plugins.
                        The Nginx plugin will take care of reconfiguring Nginx and reloading the config whenever necessary which comes in very handy.
                        To use this plugin, type the following:</p>
                    <Code>sudo certbot --nginx -d {<MCDomainSpan />} -d www.{<MCDomainSpan />}</Code>
                    <p>This runs certbot with the --nginx plugin, using -d to specify the names we’d like the certificate to be valid for.
                        If this is your first time running certbot, you will be prompted to enter an email address and agree to the terms of service. After doing so, certbot will communicate with the Let’s Encrypt server,
                        then run a challenge to verify that you control the domain you’re requesting a certificate for.
                        If that’s successful, certbot will ask how you’d like to configure your HTTPS settings:</p>
                    <Pre>
                    {`
    Output
    Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
    -------------------------------------------------------------------------------
    1: No redirect - Make no further changes to the webserver configuration.
    2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
    new sites, or if you're confident your site works on HTTPS. You can undo this
    change by editing your web server's configuration.
    -------------------------------------------------------------------------------
    Select the appropriate number [1-2] then [enter] (press 'c' to cancel):
                    `}
                    </Pre>
                    <p>We highly recommend you to use option 2.</p>
                    <p>Select your choice then hit ENTER. The configuration will be updated,
                        and Nginx will reload to pick up the new settings. certbot will wrap up with a message telling you the process was successful and where your certificates are stored:</p>
                        <Pre>
                    {`
    Output
    IMPORTANT NOTES:
     - Congratulations! Your certificate and chain have been saved at:
       /etc/letsencrypt/live/your_domain/fullchain.pem
       Your key file has been saved at:
       /etc/letsencrypt/live/your_domain/privkey.pem
       Your cert will expire on 2020-08-18. To obtain a new or tweaked
       version of this certificate in the future, simply run certbot again
       with the "certonly" option. To non-interactively renew *all* of
       your certificates, run "certbot renew"
     - Your account credentials have been saved in your Certbot
       configuration directory at /etc/letsencrypt. You should make a
       secure backup of this folder now. This configuration directory will
       also contain certificates and private keys obtained by Certbot so
       making regular backups of this folder is ideal.
     - If you like Certbot, please consider supporting our work by:
    
       Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
       Donating to EFF:                    https://eff.org/donate-le
                    `}
                    </Pre>

                    
                    
                    
                    <p>Dekete the Nginx HTTP, we do not want that anymore, only HTTPS.</p>
                    <Code>sudo ufw delete allow 'Nginx HTTP'</Code>
                    <p>Try to access your website using</p>
                    <p>https://{<MCDomainSpan/>}</p>
                

                </div>
            <MCHeader text="Useful commands" />
            <div className="vert-align-div-flexStart">
                <p>Status of MitoCube and how to restart it.</p>
                <Code>sudo systemctl status {<MCProjectSpan/>}</Code> 
                <Code>sudo systemctl restart {<MCProjectSpan/>}</Code> 
                <p>Nginx logs</p>
                <Code>sudo less /var/log/nginx/error.log: checks the Nginx error logs.</Code>
                <Code>sudo less /var/log/nginx/access.log: checks the Nginx access logs</Code>
                <Code>sudo journalctl -u nginx: checks the Nginx process logs.</Code>
                <Code>sudo journalctl -u {<MCProjectSpan/>}: checks your Flask app’s Gunicorn logs.</Code>
                </div>
                </div>
            </div>
    )
}