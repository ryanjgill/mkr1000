# MKR1000
Plant monitoring system using Arduino MKR1000, Standard Firmata WiFi, Johnny-five.io, and Node

### TODO
I plan to add more features that take advantage of RethinkDB's changefeeds. Some would include min and max readings for each of the sensors for a set duration (last 24 hours). 

## Guide to installing Plant Monitoring System (app)

We need to perform 3 major tasks in order to get our software up and running

1. Install and start a RethinkDB server to store our measurements.

2. Install Standard Firmata Wifi sketch on the MKR1000 and make sure it is connected to your home network.

3. Install Node.js to run our express web sever for both johnny-five and the client UI.

### 1. Installing RethinkDB

Go to https://www.rethinkdb.com/docs/install/ and click the appropriate installation depending on your operating system.

Follow the installation instruction on the rethinkdb website.

Once the installation has finished, you can start rethinkdb from the terminal by simply typing 'rethinkdb'. If you are on windows you will need to execute the rethinkdb.exe file that was unpacked during the installation. Simply open the cmd line and change directories to the location of the rethinkdb.exe. Then type `rethinkdb.exe` to start the rethinkdb server.

Now that the rethinkdb server is running, we can open our web broswser and go to `localhost:8080`. This is the rethinkdb web interface where you can manage your cluster. Here we will need to create the database `plant_monitoring_system` and a table to store our measurements named `measurements`.

To create a database, we can use the web interface. Open the web browser and go to `localhost:8080/tables`. Then click `add Database` button to create our database for this project. Type `plant_monitoring_system` with the underscores in the name. Then click create.

Next click the `Add table` button. Then type `measurements` and click create.

We now have a RethinkDB server running with our database `plant_monitoring_system` and our table `measurements`.

### 2. Installing Standard Firmata Wifi

Open Arduino IDE and go to `File` --> `Examples` --> `Firmata` --> `StandardFirmataWifi`.
This sketch will open a new Arduino IDE window with 2 tabs. The first tab is the `StandardFirmataWifi` sketch and the 2nd tab is the `wifiConfig` file. We need to change a few settings inside the wifi config and then upload this sketch to the MKR1000.

Click the `wifiConfig.h` tab.
Comment out Option A by add '//' in front of '#define ARDUINO_WIFI_SHIELD`
It should look like this when done.

`//#define ARDUINO_WIFI_SHIELD`

Scroll down and uncomment Option B by removing the leading `// on line `//#define WIFI_101`
It should look like below when done.

`#define WIFI_101`

Add you wifi ssid to the following line where it says 'your_network_name'

`char ssid[] = "Wish I had Google Fiber";`

Uncomment the line `// #define STATIC_IP_ADDRESS 192,168,86,63` 
It should look like below when done.

`#define STATIC_IP_ADDRESS 192,168,86,63`

Enter you wifi password where it says `your_wpa_passphrase`;

`char wpa_passphrase[] = "mkr1000wifi";`

If you are using WEP then enter you password in the other option listed below in the next lines of the config.

That finishes up the settings for the StandFirmataWifi sketch. Now we need to compile the sketch and upload it to the MKR1000.

Connect the MKR1000 to the computer with the usb cable. Then select it in the Arduino IDE. Then `verify` the sketch by clicking the checkmark icon.
Once verified, Click the arrow icon to `upload` the sketch to the MKR1000.
The upload should complete and log some information about the size of the sketch.
You are now ready to connect to the MKR1000 using the firmata protocol.

### 3. Installing Node.js

Go to https://nodejs.org/en/ and click the big green button `v4.4.1 LTS`. This will download the installer for Node.js. Run the installer and follow the wizard.

Once installed you should be able to open up the command line and type `node -v` and it should return `v4.4.1` or whatever version you installed earlier. You should also be able to check the version of NPM with `npm -v`.

We will now install the Node.js app and start communicating using Johnny-Five.

Go to my repo and click download ZIP. Then extract the folder to a place you want to store the project. Now open the command line and 'cd' in to that folder of the project.
Once at the root of the project, we will need to install the dependencies and then start our app.

Run `npm install`. This installs all dependencies listed in our package.json file.

Once all dependencies are installed, run `npm start` to start our web server. At this point we will need to have already started our rethinkdb server as well as having the MKR1000 up and running the StandardFirmataWifi sketch and connected to your network.


TLDR: I made a video of me trying to follow this long guide here:
[Video Guide](https://youtu.be/XD4Cotwo1-4)
